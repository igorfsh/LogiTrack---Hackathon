import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Zap, Bell, Shield } from "lucide-react";
import { Header } from "../components/Header";
import { isValidTrackingCode } from "../utils/tracking";
import { toast } from "sonner";

export function Home() {
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingCode.trim()) {
      toast.error("Digite um código de rastreamento");
      return;
    }

    if (!isValidTrackingCode(trackingCode)) {
      toast.error("Código muito curto. Digite o código completo.");
      return;
    }

    setIsSearching(true);
    
    // Simula delay de busca
    setTimeout(() => {
      navigate(`/tracking/${trackingCode.trim()}`);
      setIsSearching(false);
    }, 500);
  };

  const features = [
    {
      icon: Package,
      title: "Múltiplas Transportadoras",
      description: "Rastreie encomendas de diferentes transportadoras em um só lugar"
    },
    {
      icon: Zap,
      title: "Atualizações Automáticas",
      description: "Receba informações em tempo real sobre suas encomendas"
    },
    {
      icon: Bell,
      title: "Notificações",
      description: "Seja alertado quando o status da sua encomenda mudar"
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Seus dados estão seguros e suas encomendas sempre rastreadas"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm mb-6">
            <Package className="size-4" />
            <span>Plataforma de Rastreamento</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            Rastreie suas encomendas <br />
            <span className="text-blue-600">em tempo real</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Acompanhe seus pedidos de diferentes transportadoras em um só lugar, 
            de forma rápida, simples e organizada.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Digite o código de rastreamento"
                  inputMode="text"
                  autoCapitalize="characters"
                  className="w-full pl-12 pr-4 py-4 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base sm:text-lg font-medium touch-manipulation min-h-[56px]"
              >
                {isSearching ? "Buscando..." : "Rastrear"}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-left sm:text-center">
              Ex: AA123456789BR (Correios), 1Z999AA10123456784 (UPS), LP123456789CN (AliExpress)
            </p>
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4">
                <feature.icon className="size-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-3xl sm:text-4xl mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
            Crie sua conta gratuitamente e comece a gerenciar todas as suas 
            encomendas em um só lugar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium"
            >
              Criar conta grátis
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors text-lg font-medium"
            >
              Já tenho conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
