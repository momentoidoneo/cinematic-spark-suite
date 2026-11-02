import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CTASection from "@/components/CTASection";
import { fireGoogleAdsConversion, trackEvent } from "@/lib/trackingEvents";
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: () => ({ select: () => ({ maybeSingle: async () => ({ data: null }) }) }),
  functions: { invoke },
} }));
vi.mock("@/lib/trackingEvents", () => ({ fireGoogleAdsConversion: vi.fn(), trackEvent: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const submit = (name="Ana Costa") => {
  fireEvent.change(screen.getByLabelText("Nombre *"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "ana@example.com" } });
  fireEvent.change(screen.getByPlaceholderText("Cuéntanos sobre tu proyecto..."), { target: { value: "Fotografía para mi vivienda" } });
  fireEvent.click(screen.getByRole("button", { name: "Solicitar propuesta" }));
};

describe("contact persistence gate", () => {
  beforeEach(() => vi.clearAllMocks());
  it.each([null, {}, { success: true }, { success: false, id: "id" }])("rejects an incomplete success without converting", async data => {
    invoke.mockResolvedValueOnce({ data, error: null }); render(<CTASection />); submit();
    await waitFor(() => expect(trackEvent).toHaveBeenCalledWith("contact_form_error", { event_category: "funnel", event_label: "server" }));
    expect(fireGoogleAdsConversion).not.toHaveBeenCalled();
    expect(screen.queryByText("¡Mensaje enviado!")).not.toBeInTheDocument();
  });
  it("uses the persisted ID for the real success event", async () => {
    invoke.mockResolvedValueOnce({ data: { success: true, id: "contact-1" }, error: null }); render(<CTASection />); submit();
    expect(await screen.findByText("¡Mensaje enviado!")).toBeInTheDocument();
    expect(fireGoogleAdsConversion).toHaveBeenCalledExactlyOnceWith({ eventLabel: "contact_form", transactionId: "contact-1" });
  });
  it("does not send a controlled test to advertising", async () => {
    invoke.mockResolvedValueOnce({ data: { success: true, id: "contact-qa" }, error: null }); render(<CTASection />); submit("SC-ADS-20261102-01");
    expect(await screen.findByText("¡Mensaje enviado!")).toBeInTheDocument();
    expect(fireGoogleAdsConversion).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalledWith("generate_lead", expect.anything());
  });
});
