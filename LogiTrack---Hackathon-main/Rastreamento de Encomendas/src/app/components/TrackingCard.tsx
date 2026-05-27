import { useNavigate } from "react-router-dom";
import { Package, ChevronRight, Trash2 } from "lucide-react";
import { SavedPackage } from "../utils/tracking";
import { getStatusColor, getStatusText } from "../utils/tracking";

interface TrackingCardProps {
  package: SavedPackage;
  onDelete?: (code: string) => void;
}

export function TrackingCard({ package: pkg, onDelete }: TrackingCardProps) {
  const navigate = useNavigate();
  const statusColor = getStatusColor(pkg.status as any);
  const statusText = getStatusText(pkg.status as any);

  const goToDetails = () => {
    navigate(`/tracking/${pkg.code}`, { state: { from: 'dashboard' } });
  };

  return (
    <div
      onClick={goToDetails}
      className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="size-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              {pkg.nickname && (
                <p className="text-sm font-medium text-gray-900 truncate">{pkg.nickname}</p>
              )}
              <p className="text-sm text-gray-500 font-mono">{pkg.code}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
              {statusText}
            </span>
            <span className="text-xs text-gray-500">{pkg.carrier}</span>
          </div>

          <p className="text-xs text-gray-400">
            Última atualização: {new Date(pkg.lastUpdate).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(pkg.code);
              }}
              className="p-2.5 sm:p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors touch-manipulation"
              aria-label="Remover"
            >
              <Trash2 className="size-5 sm:size-4" />
            </button>
          )}
          <div className="p-2.5 sm:p-2 text-blue-600 rounded-lg">
            <ChevronRight className="size-6 sm:size-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
