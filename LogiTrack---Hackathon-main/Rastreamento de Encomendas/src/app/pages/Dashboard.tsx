import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, Inbox } from "lucide-react";
import { Header } from "../components/Header";
import { TrackingCard } from "../components/TrackingCard";
import { getCurrentUser } from "../utils/auth";
import { getSavedPackages, removePackage, SavedPackage } from "../utils/tracking";
import { toast } from "sonner";

export function Dashboard() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<SavedPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadPackages = useCallback(() => {
    setPackages(getSavedPackages());
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    loadPackages();
  }, [navigate, loadPackages]);

  const handleDelete = (code: string) => {
    removePackage(code);
    loadPackages();
    toast.success("Encomenda removida");
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.carrier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl mb-2">Minhas Encomendas</h1>
          <p className="text-gray-600">Gerencie e acompanhe todas as suas encomendas</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, apelido ou transportadora..."
              inputMode="search"
              className="w-full pl-11 pr-4 py-3 sm:py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors bg-white text-base min-h-[48px]"
            />
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all font-medium whitespace-nowrap touch-manipulation min-h-[48px]"
          >
            <Plus className="size-5" />
            <span>Rastrear Nova</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 hover:shadow-sm transition-shadow">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl sm:text-3xl font-semibold text-gray-900">{packages.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 hover:shadow-sm transition-shadow">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Em trânsito</p>
            <p className="text-2xl sm:text-3xl font-semibold text-blue-600">
              {packages.filter(p => p.status === 'in_transit').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 hover:shadow-sm transition-shadow">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Saiu p/ entrega</p>
            <p className="text-2xl sm:text-3xl font-semibold text-purple-600">
              {packages.filter(p => p.status === 'out_for_delivery').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 hover:shadow-sm transition-shadow">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Entregues</p>
            <p className="text-2xl sm:text-3xl font-semibold text-green-600">
              {packages.filter(p => p.status === 'delivered').length}
            </p>
          </div>
        </div>

        {/* Packages List */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg) => (
              <TrackingCard key={pkg.code} package={pkg} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            {searchQuery ? (
              <>
                <Search className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma encomenda encontrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente buscar por outro termo
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Limpar busca
                </button>
              </>
            ) : (
              <>
                <Inbox className="size-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma encomenda salva
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece rastreando sua primeira encomenda
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Package className="size-5" />
                  Rastrear Encomenda
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
