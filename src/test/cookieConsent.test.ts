import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_UPDATED_EVENT,
  getStoredCookieConsent,
  initializeConsentMode,
  saveCookieConsent,
} from "@/lib/cookieConsent";

describe("cookie consent", () => {
  beforeEach(() => {
    let values: Record<string, string> = {};
    const storage: Storage = {
      get length() {
        return Object.keys(values).length;
      },
      clear: () => {
        values = {};
      },
      getItem: (key) => values[key] ?? null,
      key: (index) => Object.keys(values)[index] ?? null,
      removeItem: (key) => {
        delete values[key];
      },
      setItem: (key, value) => {
        values[key] = value;
      },
    };
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storage,
    });
    window.localStorage.clear();
    window.dataLayer = [];
    window.gtag = vi.fn();
    window.__consent_mode_initialized = false;
  });

  it("starts Google Consent Mode denied until the visitor decides", () => {
    expect(initializeConsentMode()).toBeNull();
    expect(window.gtag).toHaveBeenCalledWith(
      "consent",
      "default",
      expect.objectContaining({
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }),
    );
  });

  it("stores the choice and updates Google consent signals", () => {
    const listener = vi.fn();
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, listener);

    saveCookieConsent({ analytics: true, marketing: false });

    expect(getStoredCookieConsent()).toEqual({
      analytics: true,
      marketing: false,
    });
    expect(window.gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "granted",
        ad_storage: "denied",
      }),
    );
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: COOKIE_CONSENT_UPDATED_EVENT,
        consent_analytics: true,
        consent_marketing: false,
      }),
    );

    window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, listener);
  });

  it("rejects invalid or expired stored preferences", () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "not-json");
    expect(getStoredCookieConsent()).toBeNull();

    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        analytics: true,
        marketing: true,
        updatedAt: "2020-01-01T00:00:00.000Z",
      }),
    );
    expect(getStoredCookieConsent()).toBeNull();
  });
});
