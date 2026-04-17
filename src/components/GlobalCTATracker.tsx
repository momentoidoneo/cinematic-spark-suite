import { useEffect } from "react";
import { fireGoogleAdsConversion, trackEvent } from "./TrackingScripts";

/**
 * Listener global que detecta clicks en cualquier enlace que apunte a
 * #contacto (Solicitar Presupuesto) y dispara los eventos GA4 + Google Ads.
 * Funciona automáticamente con todos los CTAs existentes.
 */
const GlobalCTATracker = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      // Detect any link that goes to the contact section
      if (href === "#contacto" || href === "/#contacto" || href.endsWith("/#contacto")) {
        // Identify source via section/page
        const section = link.closest("section")?.id || "unknown";
        const page = window.location.pathname || "/";
        trackEvent("cta_click", {
          event_category: "engagement",
          event_label: `presupuesto_${page}_${section}`,
        });
        fireGoogleAdsConversion();
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
};

export default GlobalCTATracker;
