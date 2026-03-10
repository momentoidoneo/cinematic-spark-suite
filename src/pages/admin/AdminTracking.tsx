import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BarChart3, Eye, Save, ExternalLink } from "lucide-react";

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
  google_analytics_id: "",
  google_analytics_enabled: "false",
  google_ads_id: "",
  google_ads_conversion_label: "",
  google_ads_enabled: "false",
  meta_pixel_id: "",
  meta_pixel_enabled: "false",
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
      if (row.key in loaded) {
        (loaded as any)[row.key] = row.value || "";
      }
    });
    setConfig(loaded);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const key of TRACKING_KEYS) {
        const value = config[key];
        const { error } = await supabase
          .from("site_settings")
          .upsert(
            { key, value, label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
            { onConflict: "key" }
          );
        if (error) throw error;
      }
      toast.success("Configuración de tracking guardada");
    } catch (e: any) {
      toast.error(e.message || "Error al guardar");
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
        <h1 className="text-2xl font-display font-bold text-foreground">Tracking & Publicidad</h1>
        <p className="text-muted-foreground">Configura Google Analytics, Google Ads y Meta Pixel para tu sitio web.</p>
      </div>

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
                <CardDescription>Mide el tráfico y comportamiento de usuarios en tu web.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="ga-enabled" className="text-sm text-muted-foreground">Activo</Label>
              <Switch
                id="ga-enabled"
                checked={config.google_analytics_enabled === "true"}
                onCheckedChange={() => toggleEnabled("google_analytics_enabled")}
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
            <p className="text-xs text-muted-foreground">
              Encuéntralo en{" "}
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Google Analytics <ExternalLink className="h-3 w-3" />
              </a>
              {" "}→ Admin → Flujos de datos → Tu web → ID de medición.
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
                <CardDescription>Rastrea conversiones y remarketing de tus campañas de Google Ads.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="gads-enabled" className="text-sm text-muted-foreground">Activo</Label>
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
            <p className="text-xs text-muted-foreground">
              Encuéntralo en{" "}
              <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Google Ads <ExternalLink className="h-3 w-3" />
              </a>
              {" "}→ Herramientas → Conversiones → Tu acción de conversión.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gads-label">Conversion Label (opcional)</Label>
            <Input
              id="gads-label"
              placeholder="AbCdEfGhIjKlMn"
              value={config.google_ads_conversion_label}
              onChange={(e) => setField("google_ads_conversion_label", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Etiqueta de conversión específica para rastrear acciones (ej. solicitud de presupuesto).
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
                <svg className="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">Meta Pixel (Facebook/Instagram)</CardTitle>
                <CardDescription>Mide conversiones y crea audiencias para campañas en Meta.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="meta-enabled" className="text-sm text-muted-foreground">Activo</Label>
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
            <p className="text-xs text-muted-foreground">
              Encuéntralo en{" "}
              <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Meta Events Manager <ExternalLink className="h-3 w-3" />
              </a>
              {" "}→ Orígenes de datos → Tu Pixel → ID del pixel.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </div>
  );
};

export default AdminTracking;
