import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X, ArrowRight, Loader2, MessageCircle, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fireGoogleAdsConversion, trackEvent } from "@/lib/trackingEvents";
import { toast } from "sonner";

interface QuoteResult {
  min: number;
  max: number;
  summary: string;
  includes: string[];
  notes: string;
  whatsappMessage: string;
  requestId?: string | null;
  source?: "ai" | "fallback";
}

const SERVICES = [
  "Fotografía profesional",
  "Vídeo corporativo",
  "Vídeo con dron",
  "Tour Virtual Matterport",
  "Cobertura de eventos",
  "Renders 3D",
  "Streaming profesional",
];

const URGENCY = ["Esta semana", "Este mes", "Próximos 3 meses", "Sin prisa"];

const SmartQuoter = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    service: "",
    scope: "",
    location: "",
    urgency: "",
    details: "",
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const reset = () => {
    setStep(0);
    setForm({ service: "", scope: "", location: "", urgency: "", details: "", name: "", email: "", phone: "" });
    setResult(null);
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    trackEvent("quoter_open", { event_category: "engagement" });
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(reset, 300);
  };

  useEffect(() => {
    supabase
      .from("whatsapp_config")
      .select("phone_number")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone_number) {
          setWhatsappPhone(data.phone_number.replace(/[\s\-()]/g, "").replace("+", ""));
        }
      });
  }, []);

  useEffect(() => {
    const onOpenQuoter = () => handleOpen();
    window.addEventListener("open-smart-quoter", onOpenQuoter);
    return () => window.removeEventListener("open-smart-quoter", onOpenQuoter);
  }, []);

  const handleGenerate = async () => {
    if (!emailValid) {
      toast.error("Introduce un email válido para guardar la solicitud");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quote", { body: form });
      if (error || data?.error) {
        toast.error(data?.error || "No se pudo generar el presupuesto");
        setLoading(false);
        return;
      }
      setResult(data as QuoteResult);
      toast.success("Solicitud guardada. Aquí tienes una estimación orientativa.");
      trackEvent("quoter_complete", {
        event_category: "engagement",
        event_label: form.service,
      });
    } catch (err) {
      toast.error("Error al generar el presupuesto");
    }
    setLoading(false);
  };

  const sendWhatsApp = () => {
    if (!whatsappPhone || !result) return;
    const msg = `${result.whatsappMessage}\n\n💰 Presupuesto orientativo: ${result.min}€ - ${result.max}€`;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`;
    trackEvent("quoter_whatsapp", { event_category: "conversion", event_label: form.service });
    fireGoogleAdsConversion();
    window.open(url, "_blank");
  };

  const canNext =
    (step === 0 && form.service) ||
    (step === 1 && form.scope.trim().length > 0) ||
    (step === 2 && form.location.trim().length > 0) ||
    (step === 3 && form.urgency) ||
    step === 4 ||
    (step === 5 && emailValid);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-4 top-16 sm:top-20 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:w-full sm:max-w-lg max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl"
            >
              <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg font-bold text-foreground">Cotizador Inteligente</h2>
                </div>
                <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Cerrar">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {!result && !loading && (
                  <>
                    {/* Progress */}
                    <div className="flex gap-1.5 mb-6">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`} />
                      ))}
                    </div>

                    {step === 0 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">¿Qué servicio necesitas?</h3>
                        <p className="text-sm text-muted-foreground mb-4">Elige el tipo de proyecto.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SERVICES.map((s) => (
                            <button
                              key={s}
                              onClick={() => setForm({ ...form, service: s })}
                              className={`text-left px-4 py-3 rounded-lg text-sm border transition-all ${form.service === s ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">Tamaño o alcance</h3>
                        <p className="text-sm text-muted-foreground mb-4">Ej: "120 m²", "vídeo 60s", "evento 4h", "5 renders".</p>
                        <input
                          autoFocus
                          value={form.scope}
                          onChange={(e) => setForm({ ...form, scope: e.target.value })}
                          placeholder="Describe el alcance"
                          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">Ubicación</h3>
                        <p className="text-sm text-muted-foreground mb-4">Ciudad o zona del proyecto.</p>
                        <input
                          autoFocus
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="Ej: Lisboa, Madrid, Algarve..."
                          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">¿Cuándo lo necesitas?</h3>
                        <p className="text-sm text-muted-foreground mb-4">La urgencia puede afectar al precio.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {URGENCY.map((u) => (
                            <button
                              key={u}
                              onClick={() => setForm({ ...form, urgency: u })}
                              className={`px-4 py-3 rounded-lg text-sm border transition-all ${form.urgency === u ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">Detalles adicionales <span className="text-muted-foreground text-sm font-normal">(opcional)</span></h3>
                        <p className="text-sm text-muted-foreground mb-4">Cualquier requisito especial que debamos saber.</p>
                        <textarea
                          value={form.details}
                          onChange={(e) => setForm({ ...form, details: e.target.value })}
                          placeholder="Ej: Necesito derechos exclusivos, formato vertical para Instagram..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                      </div>
                    )}

                    {step === 5 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">¿Dónde enviamos la estimación?</h3>
                        <p className="text-sm text-muted-foreground mb-4">Guardaremos la solicitud para poder responderte con una propuesta ajustada.</p>
                        <div className="space-y-3">
                          <input
                            autoFocus
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="Email"
                            type="email"
                            autoComplete="email"
                            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Nombre (opcional)"
                            autoComplete="name"
                            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="Teléfono o WhatsApp (opcional)"
                            type="tel"
                            autoComplete="tel"
                            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-6">
                      <button
                        onClick={() => setStep(Math.max(0, step - 1))}
                        disabled={step === 0}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        Atrás
                      </button>
                      {step < 5 ? (
                        <button
                          onClick={() => setStep(step + 1)}
                          disabled={!canNext}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                        >
                          Siguiente <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleGenerate}
                          disabled={!canNext}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                        >
                          <Sparkles className="w-4 h-4" /> Calcular y guardar
                        </button>
                      )}
                    </div>
                  </>
                )}

                {loading && (
                  <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-foreground font-medium">Calculando tu presupuesto…</p>
                    <p className="text-sm text-muted-foreground mt-1">La IA está analizando tu solicitud</p>
                  </div>
                )}

                {result && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="text-center mb-6 pb-6 border-b border-border">
                      <p className="text-sm text-muted-foreground mb-1">Presupuesto orientativo</p>
                      <p className="font-display text-4xl font-bold text-gradient-primary mb-2">
                        {result.min}€ – {result.max}€
                      </p>
                      <p className="text-sm text-muted-foreground">{result.summary}</p>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Incluye</p>
                      <ul className="space-y-2">
                        {result.includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {result.notes && (
                      <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground"><strong className="text-foreground">Nota:</strong> {result.notes}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      {whatsappPhone && (
                        <button
                          onClick={sendWhatsApp}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                        </button>
                      )}
                      <button
                        onClick={reset}
                        className="px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                      >
                        Calcular otro
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      * Estimación orientativa. Tu solicitud queda registrada para poder preparar una propuesta final.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartQuoter;
