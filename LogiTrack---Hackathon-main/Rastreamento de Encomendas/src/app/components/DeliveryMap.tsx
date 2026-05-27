import { useEffect, useRef, useState } from "react";
import { MapPin, Truck, Navigation, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { RoutePoint, TrackingInfo } from "../utils/tracking";
import "leaflet/dist/leaflet.css";

let L: typeof import("leaflet") | null = null;

interface DeliveryMapProps {
  trackingInfo: TrackingInfo;
}

// Build great-circle intermediate points for long routes (avoids straight lines cutting through continents)
function interpolatePoints(
  from: [number, number],
  to: [number, number],
  steps: number
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
  }
  return pts;
}

function buildPolylineCoords(routePoints: RoutePoint[], isInternational: boolean): [number, number][] {
  if (!isInternational) {
    return routePoints.map(p => [p.lat, p.lng]);
  }
  // For international routes, interpolate more points to show curved path
  const coords: [number, number][] = [];
  for (let i = 0; i < routePoints.length - 1; i++) {
    const from: [number, number] = [routePoints[i].lat, routePoints[i].lng];
    const to: [number, number] = [routePoints[i + 1].lat, routePoints[i + 1].lng];
    const steps = isInternational ? 30 : 5;
    const pts = interpolatePoints(from, to, steps);
    if (i === 0) coords.push(...pts);
    else coords.push(...pts.slice(1));
  }
  return coords;
}

// Interpolate truck position along polyline based on progress (0-100)
function getTruckPosition(coords: [number, number][], progress: number): [number, number] {
  if (coords.length < 2) return coords[0] ?? [0, 0];
  const t = Math.min(Math.max(progress / 100, 0), 1);
  const totalSegments = coords.length - 1;
  const floatIdx = t * totalSegments;
  const idx = Math.min(Math.floor(floatIdx), totalSegments - 1);
  const frac = floatIdx - idx;
  const a = coords[idx];
  const b = coords[idx + 1] ?? coords[idx];
  return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
}

const MARKER_COLORS: Record<RoutePoint['type'], string> = {
  origin:      '#2563eb', // blue
  transit:     '#6b7280', // gray
  current:     '#7c3aed', // purple
  destination: '#16a34a', // green
};

const MARKER_LABELS: Record<RoutePoint['type'], string> = {
  origin:      'Origem',
  transit:     'Trânsito',
  current:     'Localização atual',
  destination: 'Destino',
};

export function DeliveryMap({ trackingInfo }: DeliveryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const polylineRef = useRef<import("leaflet").Polyline | null>(null);
  const truckMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animProgress, setAnimProgress] = useState(trackingInfo.deliveryProgress ?? 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number | null>(null);

  const { routePoints, isInternational, status, deliveryProgress = 0 } = trackingInfo;

  // Animate truck for "out_for_delivery"
  useEffect(() => {
    if (status !== 'out_for_delivery') {
      setAnimProgress(deliveryProgress);
      return;
    }
    setIsAnimating(true);
    let start: number | null = null;
    const startPct = deliveryProgress;
    const endPct = 95;
    const duration = 12000; // 12s for one cycle

    function step(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setAnimProgress(startPct + (endPct - startPct) * eased);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        // bounce back and repeat
        start = null;
        animRef.current = requestAnimationFrame(step);
      }
    }
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [status, deliveryProgress]);

  // Init Leaflet map
  useEffect(() => {
    if (!mapContainer.current || routePoints.length === 0) return;
    let mounted = true;

    (async () => {
      const leaflet = await import("leaflet");
      L = leaflet;

      if (!mounted || !mapContainer.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Fix default marker icons (Webpack/Vite asset hashing issue)
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const allLats = routePoints.map(p => p.lat);
      const allLngs = routePoints.map(p => p.lng);
      const centerLat = (Math.min(...allLats) + Math.max(...allLats)) / 2;
      const centerLng = (Math.min(...allLngs) + Math.max(...allLngs)) / 2;

      const map = leaflet.map(mapContainer.current!, {
        center: [centerLat, centerLng],
        zoom: isInternational ? 2 : 6,
        zoomControl: false,
        attributionControl: true,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;

      // Draw markers
      markersRef.current = routePoints.map(point => {
        const color = MARKER_COLORS[point.type];
        const isPulse = point.type === 'current';

        const iconHtml = `
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            ${isPulse ? `<div style="
              position:absolute;
              width:36px; height:36px;
              border-radius:50%;
              background:${color}33;
              animation:pulse 1.8s infinite;
            "></div>` : ''}
            <div style="
              width:${isPulse ? 18 : 14}px;
              height:${isPulse ? 18 : 14}px;
              background:${color};
              border:3px solid white;
              border-radius:50%;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              position:relative;
              z-index:2;
            "></div>
          </div>`;

        const icon = leaflet.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [isPulse ? 36 : 20, isPulse ? 36 : 20],
          iconAnchor: [isPulse ? 18 : 10, isPulse ? 18 : 10],
        });

        const marker = leaflet.marker([point.lat, point.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:system-ui; min-width:140px;">
            <div style="font-size:11px; color:${color}; font-weight:600; margin-bottom:4px; text-transform:uppercase;">
              ${MARKER_LABELS[point.type]}
            </div>
            <div style="font-size:13px; font-weight:500; color:#111;">${point.label}</div>
          </div>
        `, { closeButton: false, maxWidth: 220 });

        return marker;
      });

      // Draw route polyline
      const polyCoords = buildPolylineCoords(routePoints, isInternational ?? false);
      const completedIdx = Math.floor((deliveryProgress / 100) * (polyCoords.length - 1));

      // Completed segment (colored)
      if (completedIdx > 0) {
        leaflet.polyline(polyCoords.slice(0, completedIdx + 1), {
          color: '#2563eb',
          weight: 3,
          opacity: 0.8,
          dashArray: undefined,
        }).addTo(map);
      }

      // Remaining segment (dashed gray)
      leaflet.polyline(polyCoords.slice(completedIdx), {
        color: '#9ca3af',
        weight: 2.5,
        opacity: 0.6,
        dashArray: '8, 6',
      }).addTo(map);

      polylineRef.current = leaflet.polyline(polyCoords, { opacity: 0 }).addTo(map);

      // Fit bounds
      const bounds = leaflet.latLngBounds(routePoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });

      // Truck marker (for out_for_delivery and in_transit)
      if (status !== 'delivered') {
        const polyFull = buildPolylineCoords(routePoints, isInternational ?? false);
        const truckPos = getTruckPosition(polyFull, deliveryProgress);

        const truckHtml = `
          <div style="
            background:#7c3aed;
            color:white;
            border-radius:50%;
            width:32px; height:32px;
            display:flex; align-items:center; justify-content:center;
            box-shadow:0 3px 10px rgba(124,58,237,0.5);
            border:2px solid white;
            font-size:16px;
          ">🚚</div>`;

        const truckIcon = leaflet.divIcon({
          html: truckHtml,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        truckMarkerRef.current = leaflet.marker(truckPos, { icon: truckIcon, zIndexOffset: 1000 }).addTo(map);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [trackingInfo.code]); // reinit only when code changes

  // Update truck position on animation progress change
  useEffect(() => {
    if (!mapRef.current || !truckMarkerRef.current || !L) return;
    const polyCoords = buildPolylineCoords(routePoints, isInternational ?? false);
    const truckPos = getTruckPosition(polyCoords, animProgress);
    truckMarkerRef.current.setLatLng(truckPos);
  }, [animProgress, routePoints, isInternational]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleFitBounds = () => {
    if (!mapRef.current || !L) return;
    const bounds = L.latLngBounds(routePoints.map(p => [p.lat, p.lng]));
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  const legendItems = [
    { color: MARKER_COLORS.origin,      label: 'Origem' },
    { color: MARKER_COLORS.current,     label: 'Posição atual' },
    { color: MARKER_COLORS.destination, label: 'Destino' },
    { color: MARKER_COLORS.transit,     label: 'Trânsito' },
  ];

  return (
    <div className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Map header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Navigation className="size-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">
            {status === 'out_for_delivery' ? 'Entregador a caminho' :
             status === 'delivered' ? 'Entrega concluída' :
             isInternational ? 'Rota internacional' : 'Rota de entrega'}
          </span>
          {status === 'out_for_delivery' && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Ao vivo
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleZoomIn}  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors" title="Zoom in"><ZoomIn  className="size-4" /></button>
          <button onClick={handleZoomOut} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors" title="Zoom out"><ZoomOut className="size-4" /></button>
          <button onClick={handleFitBounds} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors" title="Encaixar rota"><Maximize2 className="size-4" /></button>
        </div>
      </div>

      {/* Truck info banner (out_for_delivery) */}
      {status === 'out_for_delivery' && (
        <div className="absolute top-[56px] left-0 right-0 z-[999] flex items-center gap-3 px-4 py-2.5 bg-purple-600 text-white">
          <Truck className="size-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">Seu pedido está a caminho!</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-purple-400/50 rounded-full h-1.5">
                <div
                  className="h-1.5 bg-white rounded-full transition-all duration-300"
                  style={{ width: `${animProgress}%` }}
                />
              </div>
              <span className="text-xs font-semibold shrink-0">{Math.round(animProgress)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full"
        style={{
          height: isFullscreen ? '100vh' : 420,
          marginTop: status === 'out_for_delivery' ? 96 : 52,
        }}
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
        {legendItems.map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-full border-2 border-white shadow-sm" style={{ background: item.color }} />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
        {status !== 'delivered' && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm leading-none">🚚</span>
            <span className="text-xs text-gray-600">Entregador</span>
          </div>
        )}
      </div>

      {/* Pulse animation keyframes injected once */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
