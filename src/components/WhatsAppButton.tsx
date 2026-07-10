import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fireGoogleAdsConversion, trackEvent } from "@/lib/trackingEvents";

const WhatsAppButton = () => {
  const [phone, setPhone] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    supabase
      .from("whatsapp_config")
      .select("phone_number,welcome_message")
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.phone_number) return;
        setPhone(data.phone_number.replace(/[\s\-()]/g, ""));
        setMessage(data.welcome_message || "");
      });

    const showTimer = window.setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = window.setTimeout(() => setShowTooltip(false), 8000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!phone) return null;

  const url = `https://wa.me/${phone.replace("+", "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  const handleWhatsAppClick = (label: string) => {
    trackEvent("whatsapp_click", {
      event_category: "contact",
      event_label: label,
    });
    fireGoogleAdsConversion();
  };

  return (
    <>
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 items-end gap-3">
        {showTooltip && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleWhatsAppClick("floating_tooltip")}
            className="max-w-[230px] rounded-xl border border-border bg-card px-4 py-3 shadow-xl"
          >
            <p className="text-xs text-muted-foreground mb-0.5">WhatsApp</p>
            <p className="text-sm font-medium text-foreground">
              ¿Necesitas una respuesta rápida? Escríbenos.
            </p>
          </a>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleWhatsAppClick("floating_button")}
          className="h-14 w-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle
            className="h-7 w-7 text-[#052e16]"
            fill="currentColor"
          />
        </a>
      </div>

      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl shadow-[0_-8px_28px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
          <a
            href="/#contacto"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Presupuesto <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleWhatsAppClick("mobile_bar")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-[#052e16]"
          >
            <MessageCircle className="h-4 w-4" fill="currentColor" /> WhatsApp
          </a>
        </div>
      </div>
    </>
  );
};

export default WhatsAppButton;
