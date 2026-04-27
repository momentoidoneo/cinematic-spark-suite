import { useEffect, useState } from "react";
import { Key, Shield, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyInfo {
  name: string;
  service: string;
  description: string;
  docsUrl: string;
  required: boolean;
}

const REGISTRY: ApiKeyInfo[] = [
  {
    name: "LOVABLE_API_KEY",
    service: "Lovable AI Gateway",
    description: "Acceso a modelos de IA (Gemini, GPT) para cotizador, generación de imágenes, copys y miniaturas. Se gestiona automáticamente.",
    docsUrl: "https://docs.lovable.dev/features/ai",
    required: true,
  },
  {
    name: "RESEND_API_KEY",
    service: "Resend (Emails)",
    description: "Envío de notificaciones por email cuando llegan nuevos contactos o solicitudes IA.",
    docsUrl: "https://resend.com/api-keys",
    required: false,
  },
  {
    name: "RUNWAY_API_KEY",
    service: "Runway (Vídeo IA)",
    description: "Generación de clips de vídeo con IA (modelos Gen-4, Gen-3a) en la suite de marketing.",
    docsUrl: "https://docs.dev.runwayml.com/",
    required: false,
  },
  {
    name: "RUNWARE_API_KEY",
    service: "Runware (Imágenes IA)",
    description: "Generación alternativa de imágenes IA. El sistema prioriza Lovable AI (Gemini).",
    docsUrl: "https://runware.ai/",
    required: false,
  },
  {
    name: "FIRECRAWL_API_KEY",
    service: "Firecrawl (Scraping)",
    description: "Captura del contenido de webs de competidores para el monitor de cambios.",
    docsUrl: "https://www.firecrawl.dev/app/api-keys",
    required: false,
  },
  {
    name: "WHATSAPP_API_KEY",
    service: "WhatsApp Business",
    description: "Integración con WhatsApp Business Cloud API (opcional, el botón flotante usa wa.me).",
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/",
    required: false,
  },
  {
    name: "MAPS_API_KEY",
    service: "Google Maps",
    description: "Mapas embebidos y geocoding (opcional).",
    docsUrl: "https://console.cloud.google.com/google/maps-apis",
    required: false,
  },
  {
    name: "OPENAI_API_KEY",
    service: "OpenAI (alternativa)",
    description: "Acceso directo a OpenAI. No es necesario: la IA del proyecto usa Lovable AI Gateway.",
    docsUrl: "https://platform.openai.com/api-keys",
    required: false,
  },
];

const AdminApiKeys = () => {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("list-secrets-status");
      if (error) throw error;
      const next: Record<string, boolean> = {};
      (data?.secrets || []).forEach((row: { name: string; configured: boolean }) => {
        next[row.name] = row.configured;
      });
      setStatuses(next);
    } catch (err) {
      console.error("[AdminApiKeys] load error:", err);
      setError("No se pudo leer el estado de los secretos. Verifica que la función está desplegada.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openSecretsPanel = (secretName: string) => {
    // Lovable Cloud secrets are managed in the Cloud panel. Surface clear
    // instructions to the admin and copy the secret name to the clipboard.
    navigator.clipboard?.writeText(secretName).catch(() => {});
    toast({
      title: `Configurar ${secretName}`,
      description:
        "Abre Lovable Cloud → Secretos. Pega el nombre (ya copiado al portapapeles) y guarda el valor. Vuelve aquí y pulsa Refrescar.",
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">API Keys & Secretos</h1>
          <p className="text-sm text-muted-foreground">
            Estado real de los secretos del backend. Los valores nunca se exponen al cliente.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refrescar
        </Button>
      </div>

      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 mb-6 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-400">Cómo configurar un secreto</p>
          <p className="text-xs text-muted-foreground">
            Por seguridad los valores se introducen en <strong>Lovable Cloud → Secretos</strong> (no desde el navegador).
            Pulsa "Configurar" en cualquier fila: copiamos el nombre del secreto al portapapeles para que solo
            tengas que pegarlo y guardar el valor.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {REGISTRY.map((key) => {
          const configured = !!statuses[key.name];
          return (
            <div key={key.name} className="rounded-xl bg-card border border-border p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      configured ? "bg-emerald-500/10" : "bg-secondary"
                    }`}
                  >
                    {configured ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Key className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{key.service}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          configured
                            ? "bg-emerald-500/20 text-emerald-400"
                            : key.required
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {configured ? "Configurado" : key.required ? "Requerido" : "Opcional"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{key.description}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{key.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={key.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> Docs
                  </a>
                  <Button
                    size="sm"
                    variant={configured ? "outline" : "default"}
                    onClick={() => openSecretsPanel(key.name)}
                  >
                    {configured ? "Actualizar" : "Configurar"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl bg-card border border-border p-5">
        <h2 className="font-semibold text-foreground mb-2">¿Necesitas otro secreto?</h2>
        <p className="text-sm text-muted-foreground">
          Cualquier secreto adicional que añadas en <strong>Lovable Cloud → Secretos</strong> estará disponible
          inmediatamente para las edge functions. Para que aparezca en esta lista, pídeme que lo añada al registro.
        </p>
      </div>
    </div>
  );
};

export default AdminApiKeys;
