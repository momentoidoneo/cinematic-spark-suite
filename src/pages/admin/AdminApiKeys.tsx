import { Key } from "lucide-react";

const AdminApiKeys = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">API Keys</h1>
    <p className="text-muted-foreground mb-8">Gestiona las claves de API de servicios externos</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <Key className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: gestión segura de API keys para integraciones con servicios de terceros.</p>
    </div>
  </div>
);

export default AdminApiKeys;
