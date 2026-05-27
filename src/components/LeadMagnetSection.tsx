import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface LeadMagnet {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string;
  cover_image: string | null;
  pages: number | null;
}

const LeadMagnetSection = () => {
  const [item, setItem] = useState<LeadMagnet | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("lead_magnets").select("id, title, description, pdf_url, cover_image, pages").eq("is_active", true).order("order").limit(1).then(({ data }) => {
      if (data && data[0]) setItem(data[0] as LeadMagnet);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !email.trim()) return;
    setSubmitting(true);
    const urlParams = new URLSearchParams(window.location.search);
    await supabase.from("lead_magnet_downloads").insert({
      lead_magnet_id: item.id,
      email: email.trim().toLowerCase(),
      name: name.trim() || null,
      source: window.location.pathname,
      utm_source: urlParams.get("utm_source"),
      utm_campaign: urlParams.get("utm_campaign"),
    });
    await supabase.from("newsletter_subscribers").insert({
      email: email.trim().toLowerCase(),
      name: name.trim() || null,
      source: "lead_magnet",
      tags: ["lead_magnet", item.id],
    }).then(() => undefined, () => undefined);
    setSent(true);
    setSubmitting(false);
    toast.success("Descarga lista");
    window.open(item.pdf_url, "_blank", "noopener");
  };

  if (!item) return null;

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            {item.cover_image ? (
              <img src={item.cover_image} alt={item.title} className="w-48 md:w-64 aspect-[3/4] object-cover rounded-xl shadow-2xl shadow-primary/20" />
            ) : (
              <div className="w-48 md:w-64 aspect-[3/4] rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-2xl">
                <FileText className="w-20 h-20 text-primary" />
              </div>
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs uppercase tracking-widest mb-3">
              <Download className="w-3.5 h-3.5" /> Recurso gratuito
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">{item.title}</h2>
            {item.description && <p className="text-muted-foreground mt-3">{item.description}</p>}
            {item.pages && <p className="text-xs text-muted-foreground mt-2">{item.pages} páginas · PDF</p>}

            {sent ? (
              <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">¡Descarga lista!</p>
                  <a href={item.pdf_url} target="_blank" rel="noopener" className="text-xs text-primary underline">Volver a descargar</a>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-3">
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm" placeholder="Tu nombre (opcional)" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm" placeholder="Tu email *" />
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50">
                  <Download className="w-4 h-4" /> {submitting ? "Enviando…" : "Descargar gratis"}
                </button>
                <p className="text-xs text-muted-foreground">Al descargar aceptas recibir emails ocasionales. Cancela cuando quieras.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnetSection;