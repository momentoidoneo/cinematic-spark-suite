import { Settings } from "lucide-react";

const AdminWhatsAppConfig = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Config. WhatsApp</h1>
    <p className="text-muted-foreground mb-8">Configura la integración con WhatsApp Business</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <Settings className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: configuración de número, plantillas de mensajes y respuestas automáticas.</p>
    </div>
  </div>
);

export default AdminWhatsAppConfig;
