import { Link } from "react-router-dom";
import SEOHead, { getSiteUrl } from "@/components/SEOHead";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <SEOHead
        title="Página no encontrada | Silvio Costa Photography"
        description="La página solicitada no existe. Vuelve al inicio de Silvio Costa Photography."
        canonical={`${getSiteUrl()}/404`}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página no encontrada</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
