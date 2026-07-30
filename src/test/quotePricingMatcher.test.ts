import { describe, expect, it } from "vitest";
import { defaultPricingServices } from "../lib/defaultPricing";
import {
  getCatalogBaseRange,
  matchPricingReferences,
  type PricingReference,
  type PricingRequest,
} from "../../supabase/functions/generate-quote/pricing";

const catalog: PricingReference[] = defaultPricingServices.map((service) => ({
  name: service.name,
  category: service.category,
  description: service.description,
  price: service.price,
  priceSuffix: service.price_suffix,
  source: "service",
}));

const request = (
  overrides: Partial<PricingRequest>,
): PricingRequest => ({
  service: "Fotografía profesional",
  scope: "Una sesión",
  urgency: "Este mes",
  details: "",
  ...overrides,
});

const matchedNames = (body: PricingRequest) =>
  matchPricingReferences(body, catalog).map((item) => item.name);

describe("AI quote pricing matcher", () => {
  it("prioritizes ecommerce references without mixing real-estate photography", () => {
    const names = matchedNames(request({
      service: "Fotografía de producto y ecommerce",
      scope: "50 productos para una tienda online",
    }));

    expect(names[0]).toMatch(/ecommerce|producto/i);
    expect(names).toContain("Pack ecommerce hasta 50 productos");
    expect(names).not.toContain("Fotografía inmobiliaria estándar");
  });

  it("selects the specific corporate interview reference", () => {
    const names = matchedNames(request({
      service: "Vídeo corporativo",
      scope: "Una entrevista y testimonio de cliente",
    }));

    expect(names[0]).toBe("Entrevista o testimonio corporativo");
    expect(names).not.toContain("Vídeo inmobiliario");
  });

  it("selects drone inspection references without unrelated video services", () => {
    const names = matchedNames(request({
      service: "Vídeo con dron",
      scope: "Inspección visual de cubierta y fachada",
    }));

    expect(names[0]).toBe("Inspección visual con dron");
    expect(names).not.toContain("Vídeo corporativo");
  });

  it("keeps event references within the event family", () => {
    const names = matchedNames(request({
      service: "Fotografía de eventos",
      scope: "Congreso corporativo de 4 horas",
    }));

    expect(names).toContain("Fotografía de eventos 4 horas");
    expect(names).not.toContain("Fotografía gastronómica");
  });

  it("adds extras only when the request asks for them directly", () => {
    const withoutExtras = matchedNames(request({
      service: "Vídeo corporativo",
      scope: "Una pieza de presentación de empresa",
    }));
    const withSubtitles = matchedNames(request({
      service: "Vídeo corporativo",
      scope: "Una pieza de presentación de empresa",
      details: "Necesitamos subtítulos en inglés",
    }));

    expect(withoutExtras).not.toContain("Subtítulos y adaptación de idioma");
    expect(withSubtitles).toContain("Subtítulos y adaptación de idioma");
  });

  it("multiplies per-unit references by the requested quantity", () => {
    const body = request({
      service: "Fotografía de producto y ecommerce",
      scope: "50 productos, una foto por producto",
    });
    const unitReference: PricingReference = {
      name: "Fotografía de producto por unidad",
      category: "Fotografía",
      description: "Fotografía de catálogo y ecommerce",
      price: 3,
      priceSuffix: "/foto",
      source: "service",
    };

    expect(getCatalogBaseRange(body, [unitReference])).toEqual([150, 240]);
  });

  it("avoids false precision for a vague generic photography request", () => {
    const body = request({
      service: "Fotografía profesional",
      scope: "Una sesión pequeña",
    });
    const references = matchPricingReferences(body, catalog);

    expect(getCatalogBaseRange(body, references)).toBeNull();
  });
});
