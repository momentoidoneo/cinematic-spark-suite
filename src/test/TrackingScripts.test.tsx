import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TrackingScripts from "@/components/TrackingScripts";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  saveCookieConsent,
} from "@/lib/cookieConsent";

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(() => ({
    select: () => ({
      in: async () => ({
        data: [
          { key: "meta_pixel_enabled", value: "true" },
          { key: "meta_pixel_id", value: "12345678" },
        ],
      }),
    }),
  })),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: fromMock,
  },
}));

const installLocalStorage = () => {
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
};

describe("TrackingScripts", () => {
  beforeEach(() => {
    installLocalStorage();
    fromMock.mockClear();
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    window.dataLayer = [];
    window.gtag = vi.fn();
    window.fbq = undefined;
    window.__consent_mode_initialized = false;
    document.getElementById("sc-meta-pixel-12345678")?.remove();
  });

  it("does not load Meta Pixel until marketing consent is granted", async () => {
    render(<TrackingScripts />);

    await waitFor(() => expect(fromMock).toHaveBeenCalledTimes(1));
    expect(document.getElementById("sc-meta-pixel-12345678")).toBeNull();

    act(() => saveCookieConsent({ analytics: false, marketing: true }));

    await waitFor(() =>
      expect(document.getElementById("sc-meta-pixel-12345678")).not.toBeNull(),
    );
  });
});
