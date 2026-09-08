import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { isLikelyDemoLead } from "@/lib/analytics";
describe("Test lead exclusion", () => {
  it.each(["PRUEBA CODEX — NO CONTACTAR", "PRUEBA TÉCNICA AUTORIZADA", "SC-ADS-20260906-03 — NO CONTACTAR"])("excludes explicit controlled marker %s", name => {
    expect(isLikelyDemoLead({name, email: "silvio@silviocosta.net", message:"Presupuesto"})).toBe(true);
  });
  it("keeps genuine requests mentioning a product test", () => {
    expect(isLikelyDemoLead({name:"Ana García", email:"ana@empresa.es", message:"Necesito fotografía para una prueba de producto. No contactar por teléfono."})).toBe(false);
  });
});
