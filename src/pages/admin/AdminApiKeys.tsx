import { useState } from "react";
import { Key, Eye, EyeOff, Plus, Shield, ExternalLink } from "lucide-react";

interface ApiKeyInfo {
  name: string;
  service: string;
  description: string;
  docsUrl: string;
  isConfigured: boolean;
}

const apiKeys: ApiKeyInfo[] = [
  { name: "WHATSAPP_API_KEY", service: "WhatsApp Business", description: "API key para la integración con WhatsApp Business (Meta Cloud API o Twilio)", docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/", isConfigured: false },
  { name: "GOOGLE_ANALYTICS_ID", service: "Google Analytics", description: "ID de seguimiento de Google Analytics (GA4)", docsUrl: "https://analytics.google.com/", isConfigured: false },
  { name: "SMTP_API_KEY", service: "Email / SMTP", description: "API key para envío de emails transaccionales (SendGrid, Mailgun, etc.)", docsUrl: "https://sendgrid.com/", isConfigured: false },
  { name: "MAPS_API_KEY", service: "Google Maps", description: "API key para mostrar mapas y ubicaciones", docsUrl: "https://console.cloud.google.com/", isConfigured: false },
];

const AdminApiKeys = () => {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">API Keys</h1>
      <p className="text-sm text-muted-foreground mb-6">Gestiona las claves de API para integraciones externas</p>

      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 mb-6 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-400">Seguridad de API Keys</p>
          <p className="text-xs text-muted-foreground">
            Las API keys se almacenan de forma segura como secretos del servidor y nunca se exponen en el código del cliente. 
            Para configurar o actualizar una API key, contacta al desarrollador o usa el panel de secretos del backend.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {apiKeys.map((key) => (
          <div key={key.name} className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${key.isConfigured ? "bg-green-500/10" : "bg-secondary"}`}>
                  <Key className={`w-5 h-5 ${key.isConfigured ? "text-green-400" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{key.service}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${key.isConfigured ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {key.isConfigured ? "Configurado" : "No configurado"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{key.description}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{key.name}</p>
                </div>
              </div>
              <a
                href={key.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ExternalLink className="w-3 h-3" /> Docs
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-card border border-border p-5">
        <h2 className="font-semibold text-foreground mb-2">¿Necesitas añadir otra API key?</h2>
        <p className="text-sm text-muted-foreground">
          Si necesitas integrar un servicio adicional, solicita al desarrollador que configure la nueva API key de forma segura en los secretos del backend.
        </p>
      </div>
    </div>
  );
};

export default AdminApiKeys;
