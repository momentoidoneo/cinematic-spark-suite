declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __gads_conversion_id?: string;
    __gads_conversion_label?: string;
  }
}

export const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
};

export const setGoogleAdsConversion = (conversionId: string, conversionLabel: string) => {
  window.__gads_conversion_id = conversionId;
  window.__gads_conversion_label = conversionLabel;
};

export const fireGoogleAdsConversion = () => {
  if (window.__gads_conversion_id && window.__gads_conversion_label && typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: `${window.__gads_conversion_id}/${window.__gads_conversion_label}`,
    });
    return true;
  }

  if (window.dataLayer) {
    window.dataLayer.push({
      event: "lead_conversion",
      conversion_id: window.__gads_conversion_id,
      conversion_label: window.__gads_conversion_label,
    });
    return true;
  }

  return false;
};

export const trackEvent = (eventName: string, params?: Record<string, string>) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
    return;
  }

  if (window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...params });
  }
};

export {};
