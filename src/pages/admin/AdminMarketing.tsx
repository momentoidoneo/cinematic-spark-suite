import { Megaphone } from "lucide-react";

const AdminMarketing = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Marketing & RRSS</h1>
    <p className="text-muted-foreground mb-8">Gestiona tus campañas y redes sociales</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <Megaphone className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: gestión de campañas de marketing y publicaciones en redes sociales.</p>
    </div>
  </div>
);

export default AdminMarketing;
