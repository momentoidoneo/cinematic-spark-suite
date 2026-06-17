import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { CheckCircle, ClipboardCheck, Globe2, Mail, MapPin, Phone, Plus, Send, Trash2, UserRound, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEOHead, { getSiteUrl } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CollaboratorForm = {
  full_name: string;
  email: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  cameras: string[];
  lenses: string[];
  drones: string[];
  camera_360: string;
  matterport_compatible: boolean;
  offers_video: boolean;
  has_gimbal: boolean;
  comments: string;
  privacy_accepted: boolean;
  website: string;
};

const collaboratorSchema = z.object({
  full_name: z.string().trim().min(2, "Indica tu nombre").max(160, "Nombre demasiado largo"),
  email: z.string().trim().email("Email no válido").max(255, "Email demasiado largo"),
  address: z.string().trim().max(240, "Dirección demasiado larga"),
  city: z.string().trim().min(2, "Indica tu población").max(120, "Población demasiado larga"),
  country: z.string().trim().min(2, "Indica tu país").max(120, "País demasiado largo"),
  phone: z.string().trim().min(5, "Indica un teléfono de contacto").max(40, "Teléfono demasiado largo"),
  cameras: z.array(z.string().trim().max(120)).default([]),
  lenses: z.array(z.string().trim().max(120)).default([]),
  drones: z.array(z.string().trim().max(120)).default([]),
  camera_360: z.string().trim().max(160, "Modelo demasiado largo"),
  matterport_compatible: z.boolean(),
  offers_video: z.boolean(),
  has_gimbal: z.boolean(),
  comments: z.string().trim().max(3000, "Máximo 3000 caracteres"),
  privacy_accepted: z.boolean().refine((value) => value, "Debes aceptar la política de privacidad"),
  website: z.string().optional(),
});

const initialForm: CollaboratorForm = {
  full_name: "",
  email: "",
  address: "",
  city: "",
  country: "España",
  phone: "",
  cameras: [""],
  lenses: [""],
  drones: [""],
  camera_360: "",
  matterport_compatible: false,
  offers_video: true,
  has_gimbal: false,
  comments: "",
  privacy_accepted: false,
  website: "",
};

const inputClass =
  "w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

const cleanList = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

const DynamicListField = ({
  label,
  values,
  placeholder,
  addLabel,
  onChange,
}: {
  label: string;
  values: string[];
  placeholder: string;
  addLabel: string;
  onChange: (next: string[]) => void;
}) => {
  const updateValue = (index: number, value: string) => {
    onChange(values.map((item, i) => (i === index ? value : item)));
  };

  const removeValue = (index: number) => {
    const next = values.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [""]);
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${label}-${index}`} className="flex gap-2">
            <input
              value={value}
              onChange={(e) => updateValue(index, e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => removeValue(index)}
              className="shrink-0 rounded-lg border border-border bg-secondary px-3 text-muted-foreground hover:text-destructive"
              aria-label={`Eliminar ${label.toLowerCase()}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  );
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;

const WorkWithUs = () => {
  const [form, setForm] = useState<CollaboratorForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const siteUrl = getSiteUrl();

  const setField = <K extends keyof CollaboratorForm>(field: K, value: CollaboratorForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = collaboratorSchema.safeParse({
      ...form,
      cameras: cleanList(form.cameras),
      lenses: cleanList(form.lenses),
      drones: cleanList(form.drones),
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.errors.forEach((error) => {
        const key = error.path[0];
        if (key) nextErrors[String(key)] = error.message;
      });
      setErrors(nextErrors);
      toast.error("Revisa los campos marcados.");
      return;
    }

    if (form.website) {
      setSent(true);
      setForm(initialForm);
      return;
    }

    setSending(true);
    const payload = {
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      address: parsed.data.address,
      city: parsed.data.city,
      country: parsed.data.country,
      phone: parsed.data.phone,
      cameras: parsed.data.cameras,
      lenses: parsed.data.lenses,
      drones: parsed.data.drones,
      camera_360: parsed.data.camera_360,
      matterport_compatible: parsed.data.matterport_compatible,
      offers_video: parsed.data.offers_video,
      has_gimbal: parsed.data.has_gimbal,
      comments: parsed.data.comments || null,
      privacy_accepted: true,
      privacy_accepted_at: new Date().toISOString(),
      source: "trabaja_con_nosotros",
    };

    const { error } = await supabase.from("collaborator_applications").insert(payload);

    setSending(false);
    if (error) {
      console.error("[WorkWithUs] collaborator application error", error);
      toast.error("No se pudo enviar la solicitud. Inténtalo de nuevo.");
      return;
    }

    setSent(true);
    setForm(initialForm);
    toast.success("Solicitud recibida. Gracias por presentarte.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Trabaja con nosotros | Silvio Costa Photography"
        description="Formulario para fotógrafos, videógrafos, pilotos de dron y colaboradores audiovisuales que quieran trabajar con Silvio Costa Photography."
        canonical={`${siteUrl}/trabaja-con-nosotros`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Trabaja con nosotros",
          url: `${siteUrl}/trabaja-con-nosotros`,
          description: "Solicitud para colaboradores audiovisuales, fotógrafos, videógrafos y pilotos de dron.",
        }}
      />
      <Navbar />

      <main className="pt-24">
        <section className="relative overflow-hidden px-6 py-16">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:sticky lg:top-24">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <ClipboardCheck className="h-4 w-4" />
                Red de colaboradores
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
                Trabaja <span className="text-gradient-primary italic">con nosotros</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Si eres fotógrafo, videógrafo, operador de dron, técnico 360 o productor audiovisual,
                completa tus datos y equipo. Usaremos esta base interna para valorar colaboraciones y
                asignar trabajos según zona, disponibilidad y material técnico.
              </p>

              <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
                {[
                  "Guardamos tu perfil para oportunidades reales de producción.",
                  "Podrás indicar cámaras, lentes, drones, 360, vídeo y gimbal.",
                  "La información queda disponible en el panel Admin para gestión interna.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-card/70 p-4">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="rounded-2xl border border-border bg-card/85 p-5 shadow-2xl backdrop-blur md:p-8">
                {sent ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-foreground">Solicitud enviada</h2>
                    <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                      Gracias. Hemos guardado tu perfil de colaborador y lo revisaremos internamente.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="mt-8 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      Enviar otra solicitud
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => setField("website", e.target.value)}
                      className="absolute left-[-9999px] h-px w-px opacity-0"
                      aria-hidden="true"
                    />

                    <section>
                      <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
                        <UserRound className="h-5 w-5 text-primary" />
                        Datos personales
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Nombre *</label>
                          <input value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} className={inputClass} placeholder="Nombre y apellidos" />
                          <FieldError message={errors.full_name} />
                        </div>
                        <div>
                          <label className={labelClass}>Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={`${inputClass} pl-10`} placeholder="tu@email.com" />
                          </div>
                          <FieldError message={errors.email} />
                        </div>
                        <div>
                          <label className={labelClass}>Teléfono *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={`${inputClass} pl-10`} placeholder="+34 600 000 000" />
                          </div>
                          <FieldError message={errors.phone} />
                        </div>
                        <div>
                          <label className={labelClass}>País *</label>
                          <div className="relative">
                            <Globe2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input value={form.country} onChange={(e) => setField("country", e.target.value)} className={`${inputClass} pl-10`} placeholder="España, Portugal..." />
                          </div>
                          <FieldError message={errors.country} />
                        </div>
                        <div>
                          <label className={labelClass}>Población *</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input value={form.city} onChange={(e) => setField("city", e.target.value)} className={`${inputClass} pl-10`} placeholder="Madrid, Lisboa, Oporto..." />
                          </div>
                          <FieldError message={errors.city} />
                        </div>
                        <div>
                          <label className={labelClass}>Dirección</label>
                          <input value={form.address} onChange={(e) => setField("address", e.target.value)} className={inputClass} placeholder="Dirección o zona de trabajo" />
                          <FieldError message={errors.address} />
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
                        <Video className="h-5 w-5 text-primary" />
                        Equipo y capacidades
                      </h2>
                      <div className="grid gap-5 md:grid-cols-2">
                        <DynamicListField label="Cámaras" values={form.cameras} placeholder="Ej.: Sony A7 IV" addLabel="Añadir cámara" onChange={(next) => setField("cameras", next)} />
                        <DynamicListField label="Lentes" values={form.lenses} placeholder="Ej.: 24-70mm f/2.8" addLabel="Añadir lente" onChange={(next) => setField("lenses", next)} />
                        <DynamicListField label="Modelo de dron" values={form.drones} placeholder="Ej.: DJI Mavic 3 Pro" addLabel="Añadir dron" onChange={(next) => setField("drones", next)} />
                        <div className="space-y-4">
                          <div>
                            <label className={labelClass}>Cámara 360</label>
                            <input value={form.camera_360} onChange={(e) => setField("camera_360", e.target.value)} className={inputClass} placeholder="Ej.: Matterport Pro3, Insta360..." />
                          </div>
                          <label className="flex items-center gap-3 rounded-lg border border-border bg-secondary/70 p-3 text-sm text-foreground">
                            <input
                              type="checkbox"
                              checked={form.matterport_compatible}
                              onChange={(e) => setField("matterport_compatible", e.target.checked)}
                              className="h-4 w-4 accent-primary"
                            />
                            Compatible Matterport
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>Vídeo</label>
                              <select value={form.offers_video ? "yes" : "no"} onChange={(e) => setField("offers_video", e.target.value === "yes")} className={inputClass}>
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Gimbal</label>
                              <select value={form.has_gimbal ? "yes" : "no"} onChange={(e) => setField("has_gimbal", e.target.value === "yes")} className={inputClass}>
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <label className={labelClass}>Comentarios</label>
                      <textarea
                        value={form.comments}
                        onChange={(e) => setField("comments", e.target.value)}
                        rows={5}
                        className={`${inputClass} resize-none`}
                        placeholder="Disponibilidad, zonas de trabajo, tarifas orientativas, idiomas, seguros, experiencia, enlaces a portfolio..."
                      />
                      <FieldError message={errors.comments} />
                    </section>

                    <div className="rounded-xl border border-border bg-secondary/50 p-4">
                      <label className="flex items-start gap-3 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={form.privacy_accepted}
                          onChange={(e) => setField("privacy_accepted", e.target.checked)}
                          className="mt-1 h-4 w-4 accent-primary"
                        />
                        <span>
                          Acepto que Silvio Costa Photography guarde estos datos para valorar colaboraciones y asignación de trabajos. He leído la{" "}
                          <a href="/legal/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                            política de privacidad
                          </a>.
                        </span>
                      </label>
                      <FieldError message={errors.privacy_accepted} />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {sending ? "Enviando..." : "Enviar solicitud de colaboración"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default WorkWithUs;
