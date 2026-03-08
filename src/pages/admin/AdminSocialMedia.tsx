import { Share2 } from "lucide-react";

const AdminSocialMedia = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Redes Sociales</h1>
    <p className="text-muted-foreground mb-8">Configura los enlaces a tus redes sociales</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <Share2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: gestión de perfiles sociales con enlaces e iconos para el sitio web.</p>
    </div>
  </div>
);

export default AdminSocialMedia;
