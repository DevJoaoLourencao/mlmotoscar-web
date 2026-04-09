import { ArrowLeft, Motorbike } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/core";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-32">
      {/* Número 404 */}
      <div className="relative mb-8 select-none">
        <span className="text-[10rem] font-black leading-none text-primary/10 tracking-tighter">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Motorbike className="h-20 w-20 text-primary opacity-50" />
        </div>
      </div>

      {/* Mensagem */}
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Página não encontrada
      </h1>
      <p className="text-muted-foreground mb-1">
        A rota{" "}
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono text-primary">
          {location.pathname}
        </code>{" "}
        não existe.
      </p>
      <p className="text-muted-foreground mb-10">
        Verifique o endereço ou volte para continuar navegando.
      </p>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ir para o início
          </Button>
        </Link>
        <Link to="/catalogo">
          <Button variant="outline" className="gap-2">
            Ver catálogo
          </Button>
        </Link>
      </div>
    </div>
  );
}
