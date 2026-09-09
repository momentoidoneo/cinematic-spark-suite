import { describe, expect, it } from "vitest";
import {
  defaultPricingPlans,
  defaultPricingServices,
} from "../lib/defaultPricing";
import {
  getCatalogBaseRange,
  reconcileMultiserviceRange,
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

const catalogWithPlans: PricingReference[] = [
  ...defaultPricingPlans.map((plan) => ({
    name: plan.name,
    category: "Plan",
    description: [plan.description, ...plan.features].join(". "),
    price: plan.price,
    priceSuffix: plan.price_suffix,
    source: "plan" as const,
  })),
  ...catalog,
];

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
  it.each([
    ["Retrato corporativo y equipos", "5 personas, entrega en 48 horas", "/persona", 50, 250],
    ["Reels y contenido para redes", "3 reels de 90 segundos", "/pieza", 100, 300],
    ["Fotografía de producto y ecommerce", "10 fotos para la campaña 2026", "/foto", 20, 200],
  ])("uses the quantity of the billing unit, not unrelated numbers: %s", (service, scope, priceSuffix, price, expected) => {
    const body = request({ service, scope });
    const reference: PricingReference = { name: service, category: "Servicio", description: "", priceSuffix, price, source: "service" };
    expect(getCatalogBaseRange(body, [reference])?.[0]).toBe(expected);
  });

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

  it("does not treat a streaming plan as event photography", () => {
    const body = request({
      service: "Fotografía de eventos",
      scope: "Congreso corporativo de 4 horas",
    });
    const references: PricingReference[] = [
      {
        name: "Streaming - Video",
        category: "Plan",
        description:
          "Transmite en vivo tu evento y recibe el vídeo del streaming",
        price: 300,
        priceSuffix: "/proyecto",
        source: "plan",
      },
      {
        name: "Fotografía de eventos 4 horas",
        category: "Fotografía",
        description: "Cobertura fotográfica de congresos y eventos",
        price: 400,
        priceSuffix: "/evento",
        source: "service",
      },
    ];

    expect(matchPricingReferences(body, references).map((item) => item.name))
      .toEqual(["Fotografía de eventos 4 horas"]);
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

  it("matches every requested service and prioritizes a plan covering the combination", () => {
    const body = request({
      service:
        "Fotografía corporativa y de empresa + Vídeo corporativo",
      services: [
        "Fotografía corporativa y de empresa",
        "Vídeo corporativo",
      ],
      serviceScopes: {
        "Fotografía corporativa y de empresa":
          "Retratos del equipo e instalaciones",
        "Vídeo corporativo": "Vídeo de presentación de 90 segundos",
      },
      scope:
        "Fotografía corporativa y de empresa: Retratos del equipo e instalaciones\nVídeo corporativo: Vídeo de presentación de 90 segundos",
    });
    const references = matchPricingReferences(body, catalogWithPlans);
    const names = references.map((item) => item.name);

    expect(names[0]).toBe("Producción Empresa");
    expect(names).toContain("Fotografía corporativa media jornada");
    expect(names).toContain("Vídeo corporativo");
    expect(getCatalogBaseRange(body, references)).toEqual([800, 1080]);
  });

  it("adds the individual bases when no pack covers all selected services", () => {
    const body = request({
      service: "Fotografía de producto y ecommerce + Reels y contenido para redes",
      services: [
        "Fotografía de producto y ecommerce",
        "Reels y contenido para redes",
      ],
      serviceScopes: {
        "Fotografía de producto y ecommerce": "Una sesión de producto",
        "Reels y contenido para redes": "Una pieza vertical",
      },
      scope:
        "Fotografía de producto y ecommerce: Una sesión de producto\nReels y contenido para redes: Una pieza vertical",
    });
    const references: PricingReference[] = [
      {
        name: "Fotografía de producto y ecommerce",
        category: "Fotografía",
        description: "Sesión para catálogo y tienda online",
        price: 250,
        priceSuffix: "/sesión",
        source: "service",
      },
      {
        name: "Reels y piezas para redes",
        category: "Vídeo y dron",
        description: "Pieza vertical para redes sociales",
        price: 350,
        priceSuffix: "/pieza",
        source: "service",
      },
    ];
    const matches = matchPricingReferences(body, references);

    expect(matches.map((item) => item.name)).toEqual([
      "Fotografía de producto y ecommerce",
      "Reels y piezas para redes",
    ]);
    expect(getCatalogBaseRange(body, matches)).toEqual([600, 812.5]);
  });

  it("uses the event photo and video pack instead of pricing both separately", () => {
    const body = request({
      service: "Fotografía de eventos + Vídeo corporativo",
      services: ["Fotografía de eventos", "Vídeo corporativo"],
      serviceScopes: {
        "Fotografía de eventos": "Congreso corporativo de 4 horas",
        "Vídeo corporativo": "Vídeo resumen highlight del evento",
      },
      scope:
        "Fotografía de eventos: Congreso corporativo de 4 horas\nVídeo corporativo: Vídeo resumen highlight del evento",
    });
    const references = matchPricingReferences(body, catalogWithPlans);

    expect(references[0].name).toBe("Pack evento foto + vídeo resumen");
    expect(getCatalogBaseRange(body, references)).toEqual([1100, 1485]);
  });
});


describe("live pack regression", () => {
  it("keeps ecommerce out and uses the least expensive covering property pack", () => {
    const body = request({
      service: "Fotografía inmobiliaria + Tour Virtual Matterport",
      services: ["Fotografía inmobiliaria", "Tour Virtual Matterport"],
      serviceScopes: {"Fotografía inmobiliaria": "Una vivienda de 80 m2, 20 fotografías",
        "Tour Virtual Matterport": "La misma vivienda de 80 m2, un tour virtual"},
      scope: "Una vivienda de 80 m2, 20 fotografías y un tour virtual",
    });
    const refs: PricingReference[] = [
      {name: "Inmobiliario Esencial", category: "Plan", description: "Vivienda estándar. 15-25 fotografías editadas. Tour Virtual Matterport",price:150,priceSuffix:"/inmueble",source:"plan"},
      {name: "Inmobiliario Premium", category: "Plan", description: "Fotografía inmobiliaria premium. Vídeo, dron y Tour Virtual Matterport",price:350,priceSuffix:"/inmueble",source:"plan"},
      {name: "Pack ecommerce hasta 20 productos", category: "Fotografía",description:"20 productos con fotografías para tienda online",price:280,priceSuffix:"/sesión",source:"service"},
    ];
    const matches = matchPricingReferences(body, refs);
    expect(matches.map((r) => r.name)).not.toContain("Pack ecommerce hasta 20 productos");
    expect(getCatalogBaseRange(body, matches)).toEqual([150, 240]);
  });
  it("does not let AI replace a covering pack with individual prices", () => {
    expect(reconcileMultiserviceRange(["Foto", "Matterport"],
      {min:370,max:420},{min:150,max:240})).toEqual({min:150,max:240});
  });
});
