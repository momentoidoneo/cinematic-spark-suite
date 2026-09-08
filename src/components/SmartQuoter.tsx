import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  X,
  ArrowRight,
  Loader2,
  MessageCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fireGoogleAdsConversion, trackEvent } from "@/lib/trackingEvents";
import {
  isValidQuoteLeadEmail,
  isValidQuoteLeadName,
} from "../../supabase/functions/_shared/quoteLeadValidation";
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

const EU_COUNTRIES = [
  ["AT", "Austria"],
  ["BE", "Bélgica"],
  ["BG", "Bulgaria"],
  ["CY", "Chipre"],
  ["CZ", "Chequia"],
  ["DE", "Alemania"],
  ["DK", "Dinamarca"],
  ["EE", "Estonia"],
  ["EL", "Grecia"],
  ["ES", "España"],
  ["FI", "Finlandia"],
  ["FR", "Francia"],
  ["HR", "Croacia"],
  ["HU", "Hungría"],
  ["IE", "Irlanda"],
  ["IT", "Italia"],
  ["LT", "Lituania"],
  ["LU", "Luxemburgo"],
  ["LV", "Letonia"],
  ["MT", "Malta"],
  ["NL", "Países Bajos"],
  ["PL", "Polonia"],
  ["PT", "Portugal"],
  ["RO", "Rumanía"],
  ["SE", "Suecia"],
  ["SI", "Eslovenia"],
  ["SK", "Eslovaquia"],
] as const;

const SERVICES = [
  "Fotografía inmobiliaria",
  "Fotografía corporativa y de empresa",
  "Fotografía de producto y ecommerce",
  "Fotografía gastronómica",
  "Retrato corporativo y equipos",
  "Fotografía de eventos",
  "Vídeo corporativo",
  "Vídeo de producto o publicitario",
  "Reels y contenido para redes",
  "Vídeo inmobiliario",
  "Vídeo con dron",
  "Tour Virtual Matterport",
  "Renders 3D",
  "Streaming profesional",
  "Podcast y videopodcast",
  "Otro servicio audiovisual",
];

const URGENCY = ["Esta semana", "Este mes", "Próximos 3 meses", "Sin prisa"];

const initialForm = {
  service: "",
  services: [] as string[],
  serviceScopes: {} as Record<string, string>,
  scope: "",
  location: "",
  urgency: "",
  details: "",
  name: "",
  email: "",
  phone: "",
  countryCode: "ES",
  countryName: "España",
  vatNumber: "",
};

const SmartQuoter = ({ initialOpen = false }: { initialOpen?: boolean }) => {
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState<string | null>(null);

  const nameValid = isValidQuoteLeadName(form.name);
  const emailValid = isValidQuoteLeadEmail(form.email);

  const reset = () => {
    setStep(0);
    setForm(initialForm);
    setResult(null);
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    trackEvent("quoter_open", { event_category: "engagement" });
  };

  const handleClose = () => {
    if (!result) trackEvent("quoter_abandon", { event_category: "funnel", event_label: `step_${step + 1}` });
    setOpen(false);
    setTimeout(reset, 300);
  };

  useEffect(() => {
    if (initialOpen) {
      trackEvent("quoter_open", { event_category: "engagement" });
    }
  }, [initialOpen]);

  useEffect(() => {
    supabase
      .from("whatsapp_config")
      .select("phone_number")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone_number) {
          setWhatsappPhone(
            data.phone_number.replace(/[\s\-()]/g, "").replace("+", ""),
          );
        }
      });
  }, []);

  useEffect(() => {
    const onOpenQuoter = () => handleOpen();
    window.addEventListener("open-smart-quoter", onOpenQuoter);
    return () => window.removeEventListener("open-smart-quoter", onOpenQuoter);
  }, []);

  useEffect(() => {
    if (open && !result) trackEvent("quoter_step", { event_category: "funnel", event_label: `step_${step + 1}` });
  }, [open, step, result]);

  const handleGenerate = async () => {
    if (loading) return;
    if (!nameValid) {
      toast.error("Introduce tu nombre para ver el presupuesto");
      return;
    }
    if (!emailValid) {
      toast.error("Introduce un email válido para ver el presupuesto");
      return;
    }

    trackEvent("quoter_submit", { event_category: "funnel" });
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-quote",
        { body: form },
      );
      if (error || data?.error) {
        trackEvent("quoter_error", { event_category: "funnel", event_label: "generation" });
        toast.error(data?.error || "No se pudo generar el presupuesto");
        setLoading(false);
        return;
      }
      const quote = data as QuoteResult;
      setResult(quote);
      toast.success(
        "Solicitud guardada. Aquí tienes una estimación orientativa.",
      );
      trackEvent("quoter_complete", {
        event_category: "lead",
        event_label: form.service,
      });
      fireGoogleAdsConversion({
        eventLabel: "smart_quoter",
        transactionId: quote.requestId || undefined,
      });
    } catch {
      trackEvent("quoter_error", { event_category: "funnel", event_label: "network" });
      toast.error("Error al generar el presupuesto");
    }
    setLoading(false);
  };

  const toggleService = (service: string) => {
    const selected = form.services.includes(service);
    const services = selected
      ? form.services.filter((item) => item !== service)
      : [...form.services, service];
    const serviceScopes = { ...form.serviceScopes };
    if (selected) delete serviceScopes[service];
    const scope = services
      .map((item) => `${item}: ${serviceScopes[item] || ""}`)
      .join("\n");

    setForm({
      ...form,
      services,
      service: services.join(" + "),
      serviceScopes,
      scope,
    });
  };

  const updateServiceScope = (service: string, value: string) => {
    const serviceScopes = { ...form.serviceScopes, [service]: value };
    setForm({
      ...form,
      serviceScopes,
      scope: form.services
        .map((item) => `${item}: ${serviceScopes[item] || ""}`)
        .join("\n"),
    });
  };

  const sendWhatsApp = () => {
    if (!whatsappPhone || !result) return;
    const msg = `${result.whatsappMessage}\n\n💰 Presupuesto orientativo: ${result.min}€ - ${result.max}€`;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`;
    trackEvent("quoter_whatsapp", {
      event_category: "contact",
      event_label: form.service,
    });
    fireGoogleAdsConversion({
      kind: "whatsapp",
      eventLabel: "smart_quoter_result",
      transactionId: result.requestId || undefined,
    });
    window.open(url, "_blank");
  };

  const canNext =
    (step === 0 && form.services.length > 0) ||
    (step === 1 && form.services.every((service) =>
      form.serviceScopes[service]?.trim().length > 0
    )) ||
    (step === 2 && form.location.trim().length > 0 && !!form.urgency) ||
    (step === 3 && nameValid && emailValid);

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
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Cotizador Inteligente
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {!result && !loading && (
                  <>
                    <p className="text-sm text-primary mb-3">Trabajamos desde Madrid · Paso {step + 1} de 4</p>
                    {/* Progress */}
                    <div className="flex gap-1.5 mb-6">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`}
                        />
                      ))}
                    </div>

                    {step === 0 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          ¿Qué servicios necesitas?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Puedes elegir uno o varios. Compararemos servicios
                          individuales y packs para recomendar la combinación
                          más adecuada.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SERVICES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              aria-pressed={form.services.includes(s)}
                              onClick={() => toggleService(s)}
                              className={`flex items-start justify-between gap-3 text-left px-4 py-3 rounded-lg text-sm border transition-all ${form.services.includes(s) ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
                            >
                              <span>{s}</span>
                              {form.services.includes(s) && (
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                        {form.services.length > 0 && (
                          <p className="mt-3 text-xs font-medium text-primary">
                            {form.services.length === 1
                              ? "1 servicio seleccionado"
                              : `${form.services.length} servicios seleccionados`}
                          </p>
                        )}
                      </div>
                    )}

                    {step === 1 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          Alcance de cada servicio
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Indica la cantidad o alcance por separado para calcular
                          correctamente el pack o la suma de servicios.
                        </p>
                        <div className="space-y-4">
                          {form.services.map((service, index) => (
                            <label key={service} className="block">
                              <span className="block text-sm font-medium text-foreground mb-1.5">
                                {service}
                              </span>
                              <input
                                autoFocus={index === 0}
                                value={form.serviceScopes[service] || ""}
                                onChange={(e) =>
                                  updateServiceScope(service, e.target.value)
                                }
                                placeholder="Describe el alcance"
                                aria-label={`Alcance para ${service}`}
                                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          Ubicación
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Nuestro equipo trabaja desde Madrid. Indica la ciudad o zona del proyecto.
                        </p>
                        <input
                          autoFocus
                          value={form.location}
                          onChange={(e) =>
                            setForm({ ...form, location: e.target.value })
                          }
                          aria-label="Ciudad o zona del proyecto"
                          placeholder="Ej: Madrid, Getafe, Alcalá de Henares…"
                          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          ¿Cuándo lo necesitas?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          La urgencia puede afectar al precio.
                        </p>
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

                    {step === 2 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          Detalles adicionales{" "}
                          <span className="text-muted-foreground text-sm font-normal">
                            (opcional)
                          </span>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Cualquier requisito especial que debamos saber.
                        </p>
                        <textarea
                          value={form.details}
                          onChange={(e) =>
                            setForm({ ...form, details: e.target.value })
                          }
                          placeholder="Ej: Necesito derechos exclusivos, formato vertical para Instagram..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-2">
                          Antes de mostrarte la estimación
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Déjanos tu nombre y email. Guardaremos la solicitud
                          para poder hacer seguimiento y preparar una propuesta
                          definitiva si te interesa.
                        </p>
                        <div className="space-y-3">
                          <input
                            autoFocus
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Nombre y apellidos *"
                            autoComplete="name"
                            aria-label="Nombre y apellidos"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <input
                            value={form.email}
                            onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                            }
                            placeholder="Email *"
                            type="email"
                            autoComplete="email"
                            aria-label="Email"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <input
                            value={form.phone}
                            onChange={(e) =>
                              setForm({ ...form, phone: e.target.value })
                            }
                            placeholder="Teléfono o WhatsApp (opcional)"
                            type="tel"
                            autoComplete="tel"
                            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <details className="text-sm text-muted-foreground">
                            <summary className="cursor-pointer py-2">Datos fiscales (opcional) · {form.countryName}</summary>
                            <p className="mb-2">País fiscal del cliente, no la ubicación del proyecto. Puedes cambiarlo.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
                            <select
                              value={form.countryCode}
                              onChange={(e) => {
                                const country = EU_COUNTRIES.find(
                                  ([code]) => code === e.target.value,
                                );
                                setForm({
                                  ...form,
                                  countryCode: e.target.value,
                                  countryName: country?.[1] || e.target.value,
                                });
                              }}
                              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              aria-label="País fiscal"
                            >
                              {EU_COUNTRIES.map(([code, name]) => (
                                <option key={code} value={code}>
                                  {code} · {name}
                                </option>
                              ))}
                            </select>
                            <input
                              value={form.vatNumber}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  vatNumber: e.target.value.toUpperCase(),
                                })
                              }
                              placeholder="NIF/CIF/VAT (opcional)"
                              autoComplete="organization"
                              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          </details>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Usaremos estos datos para gestionar y dar seguimiento
                            a tu solicitud. Consulta la{" "}
                            <a
                              href="/legal/privacy-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline underline-offset-2"
                            >
                              política de privacidad
                            </a>
                            .
                          </p>
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
                      {step < 3 ? (
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
                          <Sparkles className="w-4 h-4" /> Calcular y ver
                          presupuesto
                        </button>
                      )}
                    </div>
                  </>
                )}

                {loading && (
                  <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-foreground font-medium">
                      Calculando tu presupuesto…
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      La IA está analizando tu solicitud
                    </p>
                  </div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-center mb-6 pb-6 border-b border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Presupuesto orientativo
                      </p>
                      <p className="font-display text-4xl font-bold text-gradient-primary mb-2">
                        {result.min}€ – {result.max}€
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.summary}
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Incluye
                      </p>
                      <ul className="space-y-2">
                        {result.includes.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {result.notes && (
                      <div className="mb-6 p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground">
                          <strong className="text-foreground">Nota:</strong>{" "}
                          {result.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      {whatsappPhone && (
                        <button
                          onClick={sendWhatsApp}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          <MessageCircle className="w-4 h-4" /> Enviar por
                          WhatsApp
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
                      * Estimación orientativa. Tu solicitud queda registrada
                      para poder preparar una propuesta final.
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
