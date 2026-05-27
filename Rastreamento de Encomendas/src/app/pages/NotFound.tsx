import { Link } from "react-router-dom";
import { Package, Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <Package className="size-20 text-blue-600 mx-auto mb-6 opacity-50" />
        <h1 className="text-6xl sm:text-8xl text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl mb-4">Página não encontrada</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="size-5" />
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
