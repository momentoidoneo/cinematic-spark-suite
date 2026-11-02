import { describe, expect, it } from "vitest";
import { isSavedContact, isSavedQuote, isControlledTestLead } from "@/lib/leadSubmission";

describe("persisted lead success gate", () => {
  it.each([null, undefined, {}, { success: true }, { success: false, id: "lead" }, { success: true, id: " " }, { success: true, id: "lead", error: "failed" }])("rejects contact response without a saved lead: %j", value => {
    expect(isSavedContact(value)).toBe(false);
  });
  it("accepts a confirmed contact with its database ID", () => {
    expect(isSavedContact({ success: true, id: "lead-1" })).toBe(true);
  });
  const quote = { requestId: "quote-1", min: 150, max: 240, summary: "Pack", includes: [] };
  it("requires a saved and valid quote", () => {
    expect(isSavedQuote(quote)).toBe(true);
    for (const invalid of [null, {}, { ...quote, requestId: null }, { ...quote, min: NaN }, { ...quote, max: 1 }, { ...quote, includes: null }]) {
      expect(isSavedQuote(invalid)).toBe(false);
    }
  });
  it("recognizes controlled diagnostics without passing customer data to analytics", () => {
    expect(isControlledTestLead("SC-ADS-20261102-01", "Fotografía")).toBe(true);
    expect(isControlledTestLead("Control", "Prueba técnica autorizada")).toBe(true);
    expect(isControlledTestLead("Ana", "Necesito fotos de mi vivienda")).toBe(false);
  });
});
