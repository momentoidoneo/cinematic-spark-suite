import { useEffect } from "react";
import {
  fireGoogleAdsConversion,
  trackEvent,
} from "@/lib/trackingEvents";

/**
 * Listener global que detecta clicks en cualquier enlace que apunte a
 * #contacto (Solicitar Presupuesto) y dispara eventos de intención.
 * Funciona automáticamente con todos los CTAs existentes.
 */
const GlobalCTATracker = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (window.location.pathname.startsWith("/admin")) return;

      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const section = link.closest("section")?.id || "unknown";
      const page = window.location.pathname || "/";

      if (href.toLowerCase().startsWith("tel:")) {
        const eventLabel = `telefono_${page}_${section}`;
        trackEvent("phone_click", {
          event_category: "contact",
          event_label: eventLabel,
        });
        fireGoogleAdsConversion({
          kind: "phone",
          eventLabel,
        });
        return;
      }

      // Detect any link that goes to the contact section
      if (href === "#contacto" || href === "/#contacto" || href.endsWith("/#contacto")) {
        // Identify source via section/page
        trackEvent("cta_click", {
          event_category: "engagement",
          event_label: `presupuesto_${page}_${section}`,
        });
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
};

export default GlobalCTATracker;
