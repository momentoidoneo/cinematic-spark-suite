import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Eye,
  Save,
  ExternalLink,
  Tags,
} from "lucide-react";

interface TrackingConfig {
  google_tag_manager_id: string;
  google_tag_manager_enabled: string;
  google_analytics_id: string;
  google_analytics_enabled: string;
  google_ads_id: string;
  google_ads_conversion_label: string;
  google_ads_enabled: string;
  meta_pixel_id: string;
  meta_pixel_enabled: string;
}

const TRACKING_KEYS: (keyof TrackingConfig)[] = [
  "google_tag_manager_id",
  "google_tag_manager_enabled",
  "google_analytics_id",
  "google_analytics_enabled",
  "google_ads_id",
  "google_ads_conversion_label",
  "google_ads_enabled",
  "meta_pixel_id",
  "meta_pixel_enabled",
];

const DEFAULT_CONFIG: TrackingConfig = {
  google_tag_manager_id: "",
  google_tag_manager_enabled: "false",
  google_analytics_id: "",
  google_analytics_enabled: "false",
  google_ads_id: "",
  google_ads_conversion_label: "",
  google_ads_enabled: "false",
  meta_pixel_id: "",
  meta_pixel_enabled: "false",
};

const validators = {
  google_tag_manager_id: (value: string) =>
    /^GTM-[A-Z0-9]+$/i.test(value.trim()),
  google_analytics_id: (value: string) => /^G-[A-Z0-9]+$/i.test(value.trim()),
  google_ads_id: (value: string) => /^AW-\d+$/i.test(value.trim()),
  google_ads_conversion_label: (value: string) =>
    /^[A-Za-z0-9_-]{6,80}$/.test(value.trim()),
  meta_pixel_id: (value: string) => /^\d{8,30}$/.test(value.trim()),
};

const AdminTracking = () => {
  const [config, setConfig] = useState<TrackingConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", TRACKING_KEYS);

    if (error) {
      toast.error("Error cargando configuración");
      setLoading(false);
      return;
    }

    const loaded = { ...DEFAULT_CONFIG };
    data?.forEach((row) => {
      const key = row.key as keyof TrackingConfig;
      if (TRACKING_KEYS.includes(key)) {
        loaded[key] = row.value || "";
      }
    });
    setConfig(loaded);
    setLoading(false);
  };

  const handleSave = async () => {
    const validationErrors = [
      config.google_tag_manager_enabled === "true" &&
      !validators.google_tag_manager_id(config.google_tag_manager_id)
        ? "El ID de Google Tag Manager debe tener formato GTM-XXXXXXX."
        : null,
      config.google_analytics_enabled === "true" &&
      !validators.google_analytics_id(config.google_analytics_id)
        ? "El ID de Google Analytics debe tener formato G-XXXXXXXXXX."
        : null,
      config.google_ads_enabled === "true" &&
      !validators.google_ads_id(config.google_ads_id)
        ? "El ID de Google Ads debe contener AW- seguido únicamente de números."
        : null,
      config.google_ads_enabled === "true" &&
      !validators.google_ads_conversion_label(
        config.google_ads_conversion_label,
      )
        ? "La etiqueta de conversión de Google Ads es obligatoria y no puede ser una URL."
        : null,
      config.meta_pixel_enabled === "true" &&
      !validators.meta_pixel_id(config.meta_pixel_id)
        ? "El Pixel ID de Meta debe contener únicamente números."
        : null,
    ].filter(Boolean) as string[];

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setSaving(true);
    try {
      for (const key of TRACKING_KEYS) {
        const value = config[key].trim();
        const { error } = await supabase.from("site_settings").upsert(
          {
            key,
            value,
            label: key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
          },
          { onConflict: "key" },
        );
        if (error) throw error;
      }
      toast.success("Configuración de tracking guardada");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof TrackingConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleEnabled = (key: keyof TrackingConfig) => {
    setConfig((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Tracking & Publicidad
        </h1>
        <p className="text-muted-foreground">
          Configura Google Analytics, Google Ads y Meta Pixel para tu sitio web.
        </p>
      </div>

      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                Utiliza un único origen de verdad
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Si Google Tag Manager está activo, la web carga únicamente el
                contenedor. Analytics y Ads deben estar bien configurados dentro
                de GTM y una conversión nunca debe dispararse al abrir una
                página: solo al enviar un formulario o iniciar un contacto real.
              </p>
              <a
                href="https://tagmanager.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Abrir Google Tag Manager{" "}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Tag Manager */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tags className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Google Tag Manager</CardTitle>
                <CardDescription>
                  Gestiona todas tus etiquetas de seguimiento desde un solo
                  contenedor GTM.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="gtm-enabled"
                className="text-sm text-muted-foreground"
              >
                Activo
              </Label>
              <Switch
                id="gtm-enabled"
                checked={config.google_tag_manager_enabled === "true"}
                onCheckedChange={() =>
                  toggleEnabled("google_tag_manager_enabled")
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gtm-id">Container ID</Label>
            <Input
              id="gtm-id"
              placeholder="GTM-XXXXXXX"
              value={config.google_tag_manager_id}
              onChange={(e) =>
                setField("google_tag_manager_id", e.target.value)
              }
            />
            {config.google_tag_manager_id && (
              <ValidationStatus
                valid={validators.google_tag_manager_id(
                  config.google_tag_manager_id,
                )}
                validText="Formato GTM válido"
                invalidText="Debe comenzar por GTM-"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Encuéntralo en{" "}
              <a
                href="https://tagmanager.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Google Tag Manager <ExternalLink className="h-3 w-3" />
              </a>{" "}
              → Administrar → Tu contenedor → ID del contenedor.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Google Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Google Analytics 4</CardTitle>
                <CardDescription>
                  Mide el tráfico y comportamiento de usuarios en tu web.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="ga-enabled"
                className="text-sm text-muted-foreground"
              >
                Activo
              </Label>
              <Switch
                id="ga-enabled"
                checked={config.google_analytics_enabled === "true"}
                onCheckedChange={() =>
                  toggleEnabled("google_analytics_enabled")
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga-id">Measurement ID (GA4)</Label>
            <Input
              id="ga-id"
              placeholder="G-XXXXXXXXXX"
              value={config.google_analytics_id}
              onChange={(e) => setField("google_analytics_id", e.target.value)}
            />
            {config.google_analytics_id && (
              <ValidationStatus
                valid={validators.google_analytics_id(
                  config.google_analytics_id,
                )}
                validText="Formato GA4 válido"
                invalidText="Debe comenzar por G-"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Encuéntralo en{" "}
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Google Analytics <ExternalLink className="h-3 w-3" />
              </a>{" "}
              → Admin → Flujos de datos → Tu web → ID de medición.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Google Ads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Google Ads</CardTitle>
                <CardDescription>
                  Rastrea conversiones y remarketing de tus campañas de Google
                  Ads.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="gads-enabled"
                className="text-sm text-muted-foreground"
              >
                Activo
              </Label>
              <Switch
                id="gads-enabled"
                checked={config.google_ads_enabled === "true"}
                onCheckedChange={() => toggleEnabled("google_ads_enabled")}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gads-id">Conversion ID</Label>
            <Input
              id="gads-id"
              placeholder="AW-XXXXXXXXXX"
              value={config.google_ads_id}
              onChange={(e) => setField("google_ads_id", e.target.value)}
            />
            {config.google_ads_id && (
              <ValidationStatus
                valid={validators.google_ads_id(config.google_ads_id)}
                validText="Formato de Google Ads válido"
                invalidText="Usa AW- seguido solo de números; no pegues una URL"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Encuéntralo en{" "}
              <a
                href="https://ads.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Google Ads <ExternalLink className="h-3 w-3" />
              </a>{" "}
              → Herramientas → Conversiones → Tu acción de conversión.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gads-label">Conversion Label</Label>
            <Input
              id="gads-label"
              placeholder="AbCdEfGhIjKlMn"
              value={config.google_ads_conversion_label}
              onChange={(e) =>
                setField("google_ads_conversion_label", e.target.value)
              }
            />
            {config.google_ads_conversion_label && (
              <ValidationStatus
                valid={validators.google_ads_conversion_label(
                  config.google_ads_conversion_label,
                )}
                validText="Etiqueta válida"
                invalidText="Introduce solo la etiqueta, nunca una URL"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Etiqueta de conversión específica para rastrear acciones (ej.
              solicitud de presupuesto).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meta Pixel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-indigo-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">
                  Meta Pixel (Facebook/Instagram)
                </CardTitle>
                <CardDescription>
                  Mide conversiones y crea audiencias para campañas en Meta.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="meta-enabled"
                className="text-sm text-muted-foreground"
              >
                Activo
              </Label>
              <Switch
                id="meta-enabled"
                checked={config.meta_pixel_enabled === "true"}
                onCheckedChange={() => toggleEnabled("meta_pixel_enabled")}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-id">Pixel ID</Label>
            <Input
              id="meta-id"
              placeholder="123456789012345"
              value={config.meta_pixel_id}
              onChange={(e) => setField("meta_pixel_id", e.target.value)}
            />
            {config.meta_pixel_id && (
              <ValidationStatus
                valid={validators.meta_pixel_id(config.meta_pixel_id)}
                validText="Pixel ID válido"
                invalidText="El Pixel ID solo puede contener números"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Encuéntralo en{" "}
              <a
                href="https://business.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Meta Events Manager <ExternalLink className="h-3 w-3" />
              </a>{" "}
              → Orígenes de datos → Tu Pixel → ID del pixel.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </div>
  );
};

const ValidationStatus = ({
  valid,
  validText,
  invalidText,
}: {
  valid: boolean;
  validText: string;
  invalidText: string;
}) => (
  <p
    className={`flex items-center gap-1.5 text-xs ${valid ? "text-primary" : "text-destructive"}`}
  >
    {valid ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ) : (
      <AlertTriangle className="h-3.5 w-3.5" />
    )}
    {valid ? validText : invalidText}
  </p>
);

export default AdminTracking;
