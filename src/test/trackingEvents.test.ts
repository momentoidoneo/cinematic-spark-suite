import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

import {
  fireGoogleAdsConversion,
  setGoogleAdsConversion,
} from "@/lib/trackingEvents";

describe("Google Ads conversion events", () => {
  beforeEach(() => {
    window.dataLayer = [];
    window.gtag = vi.fn();
    window.__gtm_active = false;
    window.__gads_conversion_id = undefined;
    window.__gads_conversion_label = undefined;
  });

  it("does not emit an incomplete conversion", () => {
    expect(fireGoogleAdsConversion()).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
  });

  it("pushes one success event for GTM instead of firing a page conversion", () => {
    setGoogleAdsConversion("AW-11017209497", "conversion-label");
    window.__gtm_active = true;

    expect(
      fireGoogleAdsConversion({
        eventLabel: "contact_form",
        transactionId: "lead-123",
      }),
    ).toBe(true);

    expect(window.gtag).not.toHaveBeenCalled();
    expect(window.dataLayer).toContainEqual({
      event: "lead_conversion",
      conversion_id: "AW-11017209497",
      conversion_label: "conversion-label",
      event_label: "contact_form",
      transaction_id: "lead-123",
    });
  });

  it("uses the direct Google tag only when GTM is disabled", () => {
    setGoogleAdsConversion("AW-11017209497", "conversion-label");

    expect(fireGoogleAdsConversion({ eventLabel: "contact_form" })).toBe(true);
    expect(window.gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: "AW-11017209497/conversion-label",
      event_label: "contact_form",
      transaction_id: undefined,
    });
  });
});
