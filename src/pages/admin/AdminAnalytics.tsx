import { BarChart3 } from "lucide-react";

const AdminAnalytics = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Analytics</h1>
    <p className="text-muted-foreground mb-8">Estadísticas y métricas de tu sitio web</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <BarChart3 className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: panel de analíticas con visitas, clics y conversiones.</p>
    </div>
  </div>
);

export default AdminAnalytics;
