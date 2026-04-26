import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PublicLayout>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-display text-5xl font-bold text-primary">404</h1>
          <p className="mb-4 font-body text-xl text-muted-foreground">A pagina que voce tentou abrir nao existe.</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Voltar para a capa
          </a>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFound;
