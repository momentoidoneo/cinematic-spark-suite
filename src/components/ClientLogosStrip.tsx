import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  link_url: string | null;
}

const ClientLogosStrip = () => {
  const [logos, setLogos] = useState<ClientLogo[]>([]);

  useEffect(() => {
    supabase
      .from("client_logos")
      .select("id,name,logo_url,link_url")
      .eq("is_visible", true)
      .order("order")
      .then(({ data }) => setLogos((data as ClientLogo[]) || []));
  }, []);

  if (logos.length === 0) return null;

  return (
    <section aria-label="Clientes que confían en nosotros" className="py-12 border-y border-border/50 bg-background/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Confían en nosotros
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-14">
          {logos.map((l) => {
            const img = (
              <img
                src={l.logo_url}
                alt={l.name}
                loading="lazy"
                className="h-10 md:h-12 w-auto max-w-[160px] object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
              />
            );
            return l.link_url ? (
              <a key={l.id} href={l.link_url} target="_blank" rel="noopener noreferrer" title={l.name}>{img}</a>
            ) : (
              <div key={l.id} title={l.name}>{img}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ClientLogosStrip;