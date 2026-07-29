import { supabase } from "@/integrations/supabase/client";
import { getStoredCookieConsent } from "@/lib/cookieConsent";

export type GoogleAdsConversionKind = "lead" | "whatsapp" | "phone";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __gads_conversion_id?: string;
    __gads_conversion_label?: string;
    __gads_conversion_labels?: Partial<
      Record<GoogleAdsConversionKind, string>
    >;
    __gtm_active?: boolean;
  }
}

type TrackingParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const SESSION_KEY = "sc_session_id";
const conversionEventNames = new Set([
  "cta_click",
  "whatsapp_click",
  "quoter_whatsapp",
  "phone_click",
  "generate_lead",
  "quoter_complete",
]);
const lastPersistedEvents = new Map<string, number>();
const googleAdsEventNames: Record<GoogleAdsConversionKind, string> = {
  lead: "lead_conversion",
  whatsapp: "whatsapp_conversion",
  phone: "phone_conversion",
};

export const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
};

export const setGoogleAdsConversion = (
  conversionId: string,
  conversionLabel: string,
  kind: GoogleAdsConversionKind = "lead",
) => {
  window.__gads_conversion_id = conversionId;
  window.__gads_conversion_labels = {
    ...window.__gads_conversion_labels,
    [kind]: conversionLabel,
  };

  // Keep the original property for backwards compatibility with existing
  // deployments and tests that only know about the main lead conversion.
  if (kind === "lead") {
    window.__gads_conversion_label = conversionLabel;
  }
};

export const fireGoogleAdsConversion = ({
  kind = "lead",
  eventLabel,
  transactionId,
}: {
  kind?: GoogleAdsConversionKind;
  eventLabel?: string;
  transactionId?: string;
} = {}) => {
  const conversionLabel =
    window.__gads_conversion_labels?.[kind] ||
    (kind === "lead" ? window.__gads_conversion_label : undefined);
  const eventName = googleAdsEventNames[kind];

  if (window.__gtm_active) {
    ensureDataLayer().push({
      event: eventName,
      ...(window.__gads_conversion_id
        ? { conversion_id: window.__gads_conversion_id }
        : {}),
      ...(conversionLabel
        ? { conversion_label: conversionLabel }
        : {}),
      event_label: eventLabel,
      transaction_id: transactionId,
    });
    return true;
  }

  if (!window.__gads_conversion_id || !conversionLabel) {
    return false;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: `${window.__gads_conversion_id}/${conversionLabel}`,
      event_label: eventLabel,
      transaction_id: transactionId,
    });
    return true;
  }

  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      conversion_id: window.__gads_conversion_id,
      conversion_label: conversionLabel,
      event_label: eventLabel,
      transaction_id: transactionId,
    });
    return true;
  }

  return false;
};

const getSessionId = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
};

const persistConversionEvent = (eventName: string, params?: TrackingParams) => {
  if (!conversionEventNames.has(eventName)) return;
  const consent = getStoredCookieConsent();
  if (!consent?.analytics && !consent?.marketing) return;

  const eventLabel =
    typeof params?.event_label === "string" ? params.event_label : null;
  const dedupeKey = `${eventName}:${eventLabel || ""}:${window.location.pathname}`;
  const now = Date.now();
  const last = lastPersistedEvents.get(dedupeKey) || 0;
  if (now - last < 1500) return;
  lastPersistedEvents.set(dedupeKey, now);

  const { utm_source, utm_medium, utm_campaign } = getUtmParams();

  void supabase.functions
    .invoke("track-conversion-event", {
      body: {
        event_name: eventName,
        event_label: eventLabel,
        page_path: window.location.pathname || "/",
        session_id: getSessionId(),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
        utm_source,
        utm_medium,
        utm_campaign,
        metadata: params || {},
      },
    })
    .catch(() => {});
};

export const trackEvent = (eventName: string, params?: TrackingParams) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  } else if (window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...params });
  }

  persistConversionEvent(eventName, params);
};

export {};
