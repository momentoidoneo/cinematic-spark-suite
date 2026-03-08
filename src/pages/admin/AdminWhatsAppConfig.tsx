import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, MessageCircle, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

interface WhatsAppConfig {
  id: string;
  phone_number: string | null;
  api_key_name: string | null;
  welcome_message: string | null;
  auto_reply_enabled: boolean;
  business_hours_start: string | null;
  business_hours_end: string | null;
}

const AdminWhatsAppConfig = () => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone_number: "",
    welcome_message: "Hola, ¿en qué podemos ayudarte?",
    auto_reply_enabled: false,
    business_hours_start: "09:00",
    business_hours_end: "18:00",
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("whatsapp_config").select("*").maybeSingle();
      if (data) {
        const d = data as WhatsAppConfig;
        setConfig(d);
        setForm({
          phone_number: d.phone_number || "",
          welcome_message: d.welcome_message || "",
          auto_reply_enabled: d.auto_reply_enabled,
          business_hours_start: d.business_hours_start || "09:00",
          business_hours_end: d.business_hours_end || "18:00",
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      phone_number: form.phone_number || null,
      welcome_message: form.welcome_message || null,
      auto_reply_enabled: form.auto_reply_enabled,
      business_hours_start: form.business_hours_start || null,
      business_hours_end: form.business_hours_end || null,
    };

    if (config) {
      const { error } = await supabase.from("whatsapp_config").update(payload).eq("id", config.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("whatsapp_config").insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    toast.success("Configuración guardada");
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Config. WhatsApp</h1>
          <p className="text-sm text-muted-foreground">Configura la integración con WhatsApp Business</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-6 space-y-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-500" /> Datos de contacto</h2>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Número de teléfono</label>
            <input
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="+34 600 000 000"
            />
            <p className="text-xs text-muted-foreground mt-1">Número de WhatsApp Business con código de país</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Mensaje de bienvenida</label>
            <textarea
              value={form.welcome_message}
              onChange={(e) => setForm({ ...form, welcome_message: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
              placeholder="Hola, ¿en qué podemos ayudarte?"
            />
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 space-y-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Configuración</h2>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div>
              <p className="text-sm font-medium text-foreground">Respuesta automática</p>
              <p className="text-xs text-muted-foreground">Envía el mensaje de bienvenida automáticamente</p>
            </div>
            <button onClick={() => setForm({ ...form, auto_reply_enabled: !form.auto_reply_enabled })}>
              {form.auto_reply_enabled ? <ToggleRight className="w-7 h-7 text-green-400" /> : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Horario comercial</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Apertura</label>
                <input type="time" value={form.business_hours_start} onChange={(e) => setForm({ ...form, business_hours_start: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cierre</label>
                <input type="time" value={form.business_hours_end} onChange={(e) => setForm({ ...form, business_hours_end: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-400 font-medium">⚡ API de WhatsApp</p>
            <p className="text-xs text-muted-foreground mt-1">
              Para activar la funcionalidad completa, necesitas configurar una API key de WhatsApp Business (Meta) o un proveedor como Twilio. Contacta al desarrollador para la integración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWhatsAppConfig;
