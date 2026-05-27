import { MapPin, CheckCircle2, Package, Truck, Clock, Globe, AlertCircle } from "lucide-react";
import { TrackingEvent } from "../utils/tracking";

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

function eventIcon(status: string, isFirst: boolean, isCurrent: boolean) {
  const s = status.toLowerCase();
  if (s.includes('entregue'))         return <CheckCircle2 className="size-4 text-green-600" />;
  if (s.includes('saiu para entrega')) return <Truck className="size-4 text-purple-600" />;
  if (s.includes('internacional') || s.includes('voo')) return <Globe className="size-4 text-blue-500" />;
  if (s.includes('aduaneiro') || s.includes('receita')) return <AlertCircle className="size-4 text-amber-500" />;
  if (s.includes('postado'))          return <Package className="size-4 text-gray-500" />;
  if (isCurrent)                      return <MapPin className="size-4 text-blue-600" />;
  return <Clock className="size-4 text-gray-400" />;
}

function dotColor(status: string, isFirst: boolean) {
  const s = status.toLowerCase();
  if (s.includes('entregue'))          return 'bg-green-500 border-green-200';
  if (s.includes('saiu para entrega')) return 'bg-purple-500 border-purple-200';
  if (s.includes('aduaneiro') || s.includes('receita')) return 'bg-amber-500 border-amber-200';
  if (isFirst)                         return 'bg-blue-500 border-blue-200';
  return 'bg-gray-300 border-gray-100';
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const isFirst = index === 0;
        const isLast = index === events.length - 1;
        const isCurrent = !!event.isCurrentLocation;
        const dot = dotColor(event.status, isFirst);

        return (
          <div key={event.id} className="flex gap-4 group">
            {/* Timeline spine */}
            <div className="flex flex-col items-center shrink-0 w-8">
              {/* Dot */}
              <div className={`
                relative z-10 flex items-center justify-center
                size-8 rounded-full border-2
                ${isFirst ? `${dot} shadow-sm` : dot}
                ${isCurrent ? 'ring-2 ring-blue-300 ring-offset-1' : ''}
                transition-all
              `}>
                {eventIcon(event.status, isFirst, isCurrent)}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
                )}
              </div>
              {/* Connector */}
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[32px] my-1 ${isFirst ? 'bg-blue-200' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
              <div className={`
                rounded-lg px-3.5 py-3 border transition-all
                ${isFirst ? 'bg-blue-50 border-blue-100' :
                  isCurrent ? 'bg-purple-50 border-purple-100' :
                  'bg-white border-gray-100 group-hover:border-gray-200'}
              `}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className={`text-sm font-semibold leading-snug ${
                    isFirst ? 'text-blue-800' :
                    isCurrent ? 'text-purple-800' :
                    'text-gray-800'
                  }`}>
                    {event.status}
                  </p>
                  <time className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-0.5">
                    {event.time}
                  </time>
                </div>

                {event.description && event.description !== event.status && (
                  <p className="text-xs text-gray-500 mb-2 leading-relaxed">{event.description}</p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin className="size-3 shrink-0" />
                  <span className="font-medium text-gray-500">{event.location}</span>
                  <span>·</span>
                  <span>{event.date}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
