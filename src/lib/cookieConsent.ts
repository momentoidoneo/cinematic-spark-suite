export const COOKIE_CONSENT_STORAGE_KEY = "sc_cookie_consent";
export const COOKIE_CONSENT_UPDATED_EVENT = "cookie-consent-updated";
export const OPEN_COOKIE_SETTINGS_EVENT = "open-cookie-settings";

const COOKIE_CONSENT_VERSION = 1;
const COOKIE_CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

export type CookieConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
};

type StoredCookieConsent = CookieConsentPreferences & {
  version: number;
  updatedAt: string;
};

declare global {
  interface Window {
    __consent_mode_initialized?: boolean;
  }
}

const isStoredCookieConsent = (
  value: unknown,
): value is StoredCookieConsent => {
  if (!value || typeof value !== "object") return false;
  const consent = value as Partial<StoredCookieConsent>;
  return (
    consent.version === COOKIE_CONSENT_VERSION &&
    typeof consent.analytics === "boolean" &&
    typeof consent.marketing === "boolean" &&
    typeof consent.updatedAt === "string"
  );
};

export const getStoredCookieConsent = (): CookieConsentPreferences | null => {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredCookieConsent(parsed)) {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      return null;
    }

    const updatedAt = Date.parse(parsed.updatedAt);
    if (
      !Number.isFinite(updatedAt) ||
      Date.now() - updatedAt > COOKIE_CONSENT_MAX_AGE_MS
    ) {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      return null;
    }

    return {
      analytics: parsed.analytics,
      marketing: parsed.marketing,
    };
  } catch {
    return null;
  }
};

const ensureConsentDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      // Google Consent Mode expects the native arguments object in dataLayer.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
};

const applyGoogleConsent = (
  command: "default" | "update",
  preferences: CookieConsentPreferences,
) => {
  ensureConsentDataLayer();
  const consent = {
    analytics_storage: preferences.analytics ? "granted" : "denied",
    ad_storage: preferences.marketing ? "granted" : "denied",
    ad_user_data: preferences.marketing ? "granted" : "denied",
    ad_personalization: preferences.marketing ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    ...(command === "default" ? { wait_for_update: 500 } : {}),
  };
  window.gtag?.("consent", command, consent);
};

export const initializeConsentMode = () => {
  const stored = getStoredCookieConsent();
  const preferences = stored || { analytics: false, marketing: false };

  if (!window.__consent_mode_initialized) {
    applyGoogleConsent("default", preferences);
    window.__consent_mode_initialized = true;
  }

  return stored;
};

export const saveCookieConsent = (preferences: CookieConsentPreferences) => {
  const value: StoredCookieConsent = {
    ...preferences,
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    // The consent update still applies to the current page when storage is blocked.
  }

  applyGoogleConsent("update", preferences);
  window.dataLayer?.push({
    event: COOKIE_CONSENT_UPDATED_EVENT,
    consent_analytics: preferences.analytics,
    consent_marketing: preferences.marketing,
  });
  window.dispatchEvent(
    new CustomEvent<CookieConsentPreferences>(COOKIE_CONSENT_UPDATED_EVENT, {
      detail: preferences,
    }),
  );
};

export const openCookieSettings = () =>
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
