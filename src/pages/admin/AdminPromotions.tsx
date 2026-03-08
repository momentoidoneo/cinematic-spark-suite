import { Tag } from "lucide-react";

const AdminPromotions = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Promociones</h1>
    <p className="text-muted-foreground mb-8">Crea y gestiona ofertas y promociones</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <Tag className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: sistema de promociones con códigos de descuento y ofertas especiales.</p>
    </div>
  </div>
);

export default AdminPromotions;
