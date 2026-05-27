import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Package, MapPin, Calendar, Bookmark, BookmarkCheck,
  Share2, Loader2, LayoutDashboard, Globe, Truck, CheckCircle2,
  Clock, RefreshCw
} from "lucide-react";
import { Header } from "../components/Header";
import { TrackingTimeline } from "../components/TrackingTimeline";
import {
  fetchTracking, TrackingInfo, savePackage, getSavedPackages,
  getStatusColor, getStatusText
} from "../utils/tracking";
import { toast } from "sonner";

const DeliveryMap = lazy(() =>
  import("../components/DeliveryMap").then(m => ({ default: m.DeliveryMap }))
);

function MapSkeleton() {
  return (
    <div className="h-[420px] bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center animate-pulse">
      <div className="text-center text-gray-400">
        <MapPin className="size-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Carregando mapa…</p>
      </div>
    </div>
  );
}

export function TrackingDetails() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromDashboard = (location.state as any)?.from === 'dashboard';

  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (code) {
      loadTrackingInfo();
      checkIfSaved();
    }
  }, [code]);

  const loadTrackingInfo = async (silent = false) => {
    if (!code) return;
    if (silent) setIsRefreshing(true);
    else { setIsLoading(true); setError(null); }

    try {
      const info = await fetchTracking(code);
      setTrackingInfo(info);
      if (silent) toast.success("Rastreamento atualizado");
    } catch {
      if (!silent) setError("Não foi possível buscar as informações de rastreamento");
      else toast.error("Erro ao atualizar rastreamento");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const checkIfSaved = () => {
    const saved = getSavedPackages();
    setIsSaved(saved.some(p => p.code === code));
  };

  const handleSave = () => {
    if (!trackingInfo) return;
    savePackage(trackingInfo, nickname || undefined);
    setIsSaved(true);
    toast.success("Encomenda salva no painel!");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: 'LogiTrack', text: `Rastreie: ${code}`, url }); }
      catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="size-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
            <Package className="size-6 text-blue-600 absolute inset-0 m-auto" />
          </div>
          <p className="text-gray-600 font-medium">Buscando informações de rastreamento…</p>
          <p className="text-sm text-gray-400 mt-1">Consultando transportadora</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !trackingInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <Package className="size-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Não encontramos o rastreamento</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => loadTrackingInfo()}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="size-4" /> Tentar novamente
              </button>
              <button
                onClick={() => fromDashboard ? navigate('/dashboard') : navigate('/')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {fromDashboard ? 'Voltar ao painel' : 'Voltar para o início'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(trackingInfo.status);
  const statusText  = getStatusText(trackingInfo.status);

  const statusIcon =
    trackingInfo.status === 'delivered'        ? <CheckCircle2 className="size-5 text-green-600" /> :
    trackingInfo.status === 'out_for_delivery' ? <Truck className="size-5 text-purple-600" /> :
    trackingInfo.status === 'in_transit'       ? <Package className="size-5 text-blue-600" /> :
    <Clock className="size-5 text-gray-400" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Back button */}
        <button
          onClick={() => fromDashboard ? navigate('/dashboard') : navigate('/')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors touch-manipulation group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm">{fromDashboard ? 'Minhas Encomendas' : 'Início'}</span>
          {fromDashboard && <LayoutDashboard className="size-3.5 text-gray-400" />}
        </button>

        {/* ── Main card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-7 mb-5">

          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {trackingInfo.isInternational && (
                  <Globe className="size-4 text-blue-500 shrink-0" />
                )}
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {trackingInfo.isInternational ? 'Encomenda internacional' : 'Encomenda nacional'}
                </p>
              </div>
              <p className="text-lg font-mono font-semibold text-gray-900 break-all">{trackingInfo.code}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${statusColor}`}>
                  {statusIcon}
                  {statusText}
                </span>
                <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium">
                  {trackingInfo.carrier}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => loadTrackingInfo(true)}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Atualizar"
              >
                <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Compartilhar"
              >
                <Share2 className="size-4" />
              </button>
            </div>
          </div>

          {/* Route info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium mb-1">Origem</p>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-blue-400 shrink-0" />
                <p className="text-sm font-medium text-gray-800 leading-tight">{trackingInfo.origin}</p>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium mb-1">Destino</p>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-green-400 shrink-0" />
                <p className="text-sm font-medium text-gray-800 leading-tight">{trackingInfo.destination}</p>
              </div>
            </div>
          </div>

          {/* Estimated delivery */}
          {trackingInfo.estimatedDelivery && (
            <div className="flex items-center gap-2.5 p-3 bg-amber-50 rounded-lg text-amber-800 mb-4">
              <Calendar className="size-4 shrink-0 text-amber-500" />
              <p className="text-sm">
                <span className="font-semibold">Previsão de entrega:</span>{" "}
                {trackingInfo.estimatedDelivery}
              </p>
            </div>
          )}

          {/* Save section */}
          {!isSaved ? (
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-xs font-medium text-gray-600 mb-2.5">
                Salve para acompanhar no seu painel
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Apelido opcional (ex: Tênis Nike)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none min-h-[40px]"
                />
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap font-medium"
                >
                  <Bookmark className="size-4" /> Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3 bg-green-50 rounded-lg text-green-700">
              <BookmarkCheck className="size-4 shrink-0" />
              <p className="text-sm font-medium">Salvo no seu painel de encomendas</p>
            </div>
          )}
        </div>

        {/* ── Delivery Map ───────────────────────────────────────────────── */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="size-4 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Mapa de entrega</h2>
          </div>
          <Suspense fallback={<MapSkeleton />}>
            <DeliveryMap trackingInfo={trackingInfo} />
          </Suspense>
        </div>

        {/* ── Timeline ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900">Histórico de movimentação</h2>
            </div>
            <span className="text-xs text-gray-400">{trackingInfo.events.length} eventos</span>
          </div>
          <TrackingTimeline events={trackingInfo.events} />
          <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100">
            Última atualização: {trackingInfo.lastUpdate}
          </p>
        </div>

      </div>
    </div>
  );
}
