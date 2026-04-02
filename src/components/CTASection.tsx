import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Sparkles, Send, MessageCircle, CheckCircle, Phone, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { fireGoogleAdsConversion, trackEvent } from "./TrackingScripts";

const contactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Email no válido").max(255),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(1, "El mensaje es obligatorio").max(2000),
});

const CTASection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("whatsapp_config")
      .select("phone_number, welcome_message")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone_number) {
          const clean = data.phone_number.replace(/[\s\-()]/g, "").replace("+", "");
          const msg = data.welcome_message || "";
          setWhatsappUrl(`https://wa.me/${clean}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      message: result.data.message,
    });

    if (error) {
      toast.error("Error al enviar el mensaje. Inténtalo de nuevo.");
    } else {
      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      toast.success("¡Mensaje enviado correctamente!");
      // Fire tracking events
      trackEvent("generate_lead", { event_category: "contact", event_label: "contact_form" });
      fireGoogleAdsConversion();
    }
    setSending(false);
  };

  return (
    <section id="contacto" className="relative py-24 px-6 overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Contacto
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            ¿Listo para dar vida{" "}
            <span className="text-gradient-primary italic">a tu proyecto?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cuéntanos tu idea y te responderemos con un presupuesto personalizado sin compromiso.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl bg-card/80 border border-border p-8 backdrop-blur-sm">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">¡Mensaje enviado!</h3>
                  <p className="text-muted-foreground mb-6">Nos pondremos en contacto contigo lo antes posible.</p>
                  <button
                    onClick={() => setSent(false)}
                    className="px-6 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Enviar otro mensaje
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Tu nombre"
                          className={`w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.name ? "border-destructive" : "border-border"}`}
                        />
                      </div>
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="tu@email.com"
                          className={`w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.email ? "border-destructive" : "border-border"}`}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+34 600 000 000"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Mensaje *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Cuéntanos sobre tu proyecto..."
                      rows={4}
                      className={`w-full px-3 py-2.5 rounded-lg bg-secondary border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all ${errors.message ? "border-destructive" : "border-border"}`}
                    />
                    {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Enviando..." : "Enviar Mensaje"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Side panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {/* WhatsApp card */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackEvent("whatsapp_click", { event_category: "contact", event_label: "cta_section" });
                  fireGoogleAdsConversion();
                }}
                className="group rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 p-6 hover:bg-[#25D366]/15 transition-colors block"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6 text-white" fill="white" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">WhatsApp Directo</h3>
                <p className="text-sm text-muted-foreground">
                  ¿Prefieres una respuesta inmediata? Escríbenos por WhatsApp y te atendemos al momento.
                </p>
              </a>
            )}

            {/* Info cards */}
            <div className="rounded-2xl bg-card/80 border border-border p-6 backdrop-blur-sm">
              <h3 className="font-display text-lg font-bold text-foreground mb-3">¿Qué incluye?</h3>
              <ul className="space-y-2.5">
                {[
                  "Presupuesto personalizado sin compromiso",
                  "Asesoría gratuita sobre tu proyecto",
                  "Respuesta en menos de 24 horas",
                  "Propuesta visual adaptada a tu marca",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6">
              <Sparkles className="w-6 h-6 text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">+500 proyectos</span> realizados con éxito para clientes de toda España.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
