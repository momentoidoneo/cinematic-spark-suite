export interface PricingRequest {
  service: string;
  services?: string[];
  serviceScopes?: Record<string, string>;
  scope: string;
  urgency: string;
  location?: string;
  details?: string;
}

export interface PricingReference {
  name: string;
  category: string | null;
  description: string | null;
  price: number;
  priceSuffix: string | null;
  source: "plan" | "service" | "default";
}

type ServiceFamily =
  | "architecture"
  | "corporate-photo"
  | "corporate-video"
  | "drone"
  | "event"
  | "fashion"
  | "food"
  | "matterport"
  | "postproduction"
  | "product"
  | "property-photo"
  | "property-video"
  | "render"
  | "social-video"
  | "streaming"
  | "portrait";

const FAMILY_TERMS: Record<ServiceFamily, string[]> = {
  "architecture": [
    "arquitectura",
    "interiorismo",
    "interiores",
    "hotel",
    "alojamiento",
    "espacio comercial",
    "local comercial",
  ],
  "corporate-photo": [
    "fotografia corporativa",
    "fotografia industrial",
    "produccion visual",
    "empresa",
    "instalaciones",
    "proceso industrial",
    "equipo de trabajo",
  ],
  "corporate-video": [
    "video corporativo",
    "produccion visual",
    "contenido mixto",
    "video highlight",
    "entrevista",
    "testimonio",
    "caso de exito",
    "video de empresa",
    "video de producto",
    "demostracion",
  ],
  "drone": [
    "dron",
    "aereo",
    "aerea",
    "fotogrametria",
    "inspeccion",
    "levantamiento",
  ],
  "event": [
    "evento",
    "congreso",
    "feria",
    "boda",
    "conferencia",
    "ponencia",
    "presentacion",
    "inauguracion",
  ],
  "fashion": ["moda", "lookbook", "editorial", "modelo"],
  "food": [
    "gastronomia",
    "gastronomica",
    "restaurante",
    "comida",
    "plato",
    "carta",
    "delivery",
  ],
  "matterport": [
    "matterport",
    "tour virtual",
    "recorrido 360",
    "street view",
    "plano de planta",
    "gemelo digital",
  ],
  "postproduction": [
    "edicion",
    "retoque",
    "subtitulo",
    "locucion",
    "musica",
    "material bruto",
    "cambios",
    "formato adicional",
    "maquillaje",
    "estilismo",
    "operador adicional",
    "asistente",
    "licencia",
    "derechos",
    "urgente",
    "fin de semana",
    "nocturno",
    "desplazamiento",
    "permiso",
  ],
  "product": [
    "producto",
    "ecommerce",
    "e commerce",
    "catalogo",
    "packshot",
    "marketplace",
    "bodegon",
  ],
  "property-photo": [
    "fotografia inmobiliaria",
    "inmueble",
    "vivienda",
    "propiedad",
    "apartamento",
    "alquiler vacacional",
    "airbnb",
  ],
  "property-video": [
    "video inmobiliario",
    "video de inmueble",
    "video de vivienda",
    "video de propiedad",
  ],
  "render": [
    "render",
    "3d",
    "fotorrealista",
    "visualizacion",
    "home staging",
    "panoramica 360",
  ],
  "social-video": [
    "reel",
    "redes",
    "instagram",
    "tiktok",
    "short",
    "contenido mensual",
    "video vertical",
  ],
  "streaming": [
    "streaming",
    "directo",
    "multicamara",
    "webinar",
    "videopodcast",
    "video podcast",
    "podcast",
  ],
  "portrait": [
    "retrato",
    "headshot",
    "linkedin",
    "directivo",
    "marca personal",
    "personas",
  ],
};

const STOP_WORDS = new Set([
  "audiovisual",
  "cobertura",
  "con",
  "de",
  "del",
  "el",
  "en",
  "esta",
  "este",
  "fotografia",
  "para",
  "profesional",
  "proyecto",
  "servicio",
  "sesion",
  "una",
  "video",
]);

const EXTRA_CATEGORY = /extra|postproduccion/i;

export const normalizePricingText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getRequestedServices = (body: PricingRequest) => {
  const requested = Array.isArray(body.services)
    ? body.services
    : [];
  const values = requested.length > 0 ? requested : [body.service];
  const unique = new Map<string, string>();

  values.forEach((service) => {
    if (typeof service !== "string") return;
    const clean = service.trim();
    const key = normalizePricingText(clean);
    if (clean && key && !unique.has(key)) unique.set(key, clean);
  });

  return [...unique.values()];
};

const scopeForService = (body: PricingRequest, service: string) => {
  const direct = body.serviceScopes?.[service]?.trim();
  if (direct) return direct;

  const normalizedService = normalizePricingText(service);
  const matchingEntry = Object.entries(body.serviceScopes || {}).find(
    ([key, value]) =>
      normalizePricingText(key) === normalizedService && value.trim(),
  );
  return matchingEntry?.[1].trim() || body.scope;
};

const requestForService = (body: PricingRequest, service: string) => ({
  ...body,
  service,
  services: [service],
  scope: scopeForService(body, service),
});

const includesTerm = (text: string, term: string) =>
  text.includes(normalizePricingText(term));

export const detectServiceFamilies = (value: string): ServiceFamily[] => {
  const text = normalizePricingText(value);
  return (Object.entries(FAMILY_TERMS) as Array<
    [ServiceFamily, string[]]
  >)
    .filter(([, terms]) => terms.some((term) => includesTerm(text, term)))
    .map(([family]) => family);
};

const broadFamily = (value: string) => {
  const text = normalizePricingText(value);
  if (
    text.includes("matterport") || text.includes("tour") ||
    text.includes("360")
  ) return "matterport";
  if (text.includes("stream") || text.includes("directo")) return "streaming";
  if (text.includes("render") || text.includes("3d")) return "render";
  if (
    text.includes("dron") || text.includes("aereo") || text.includes("aerea")
  ) return "drone";
  if (text.includes("evento")) return "event";
  if (text.includes("video")) return "video";
  return "photo";
};

const itemBroadFamily = (item: PricingReference) => {
  const text = normalizePricingText(
    `${item.name} ${item.category || ""} ${item.description || ""}`,
  );
  if (
    text.includes("matterport") || text.includes("tour") ||
    text.includes("360")
  ) return "matterport";
  if (text.includes("stream") || text.includes("directo")) return "streaming";
  if (text.includes("render") || text.includes("3d")) return "render";
  if (
    text.includes("dron") || text.includes("aereo") || text.includes("aerea")
  ) return "drone";
  if (text.includes("evento") || text.includes("boda")) return "event";
  if (
    text.includes("video") || text.includes("reel") ||
    text.includes("grabacion")
  ) return "video";
  return "photo";
};

type MediaKind =
  | "photo"
  | "video"
  | "drone"
  | "matterport"
  | "render"
  | "streaming";

const detectMediaKinds = (value: string) => {
  const text = normalizePricingText(value);
  const kinds = new Set<MediaKind>();
  if (/fotografia|foto|retrato|headshot|imagen/.test(text)) {
    kinds.add("photo");
  }
  if (/video|reel|grabacion|spot|highlight/.test(text)) kinds.add("video");
  if (/dron|aereo|aerea|fotogrametria|inspeccion/.test(text)) {
    kinds.add("drone");
  }
  if (/matterport|tour virtual|recorrido 360|street view/.test(text)) {
    kinds.add("matterport");
  }
  if (/render|3d|home staging|fotorrealista/.test(text)) {
    kinds.add("render");
  }
  if (/stream|directo|webinar|podcast/.test(text)) kinds.add("streaming");
  return kinds;
};

const mediaKindsAreCompatible = (requested: string, reference: string) => {
  const requestedKinds = detectMediaKinds(requested);
  if (requestedKinds.size === 0) return true;
  const referenceKinds = detectMediaKinds(reference);
  const specialized: MediaKind[] = [
    "drone",
    "matterport",
    "render",
    "streaming",
  ];
  const requiredSpecialized = specialized.filter((kind) =>
    requestedKinds.has(kind)
  );
  if (requiredSpecialized.length > 0) {
    return requiredSpecialized.some((kind) => referenceKinds.has(kind));
  }
  return [...requestedKinds].some((kind) => referenceKinds.has(kind));
};

const meaningfulTokens = (value: string) =>
  normalizePricingText(value)
    .split(" ")
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

const hasQuantity = (value: string) => /\d/.test(value);

const unitScore = (input: string, item: PricingReference) => {
  const suffix = normalizePricingText(item.priceSuffix || "");
  if (!suffix) return 0;
  const quantified = hasQuantity(input);

  if (
    suffix.includes("foto") || suffix.includes("imagen") ||
    suffix.includes("pieza") || suffix.includes("persona") ||
    suffix.includes("ronda")
  ) {
    return quantified ? 2 : -3;
  }
  if (suffix.includes("hora")) {
    return input.includes("hora") && quantified ? 2 : -2;
  }
  return 0;
};

const isDirectExtraMatch = (input: string, item: PricingReference) => {
  if (!EXTRA_CATEGORY.test(normalizePricingText(item.category || ""))) {
    return false;
  }
  const itemText = normalizePricingText(
    `${item.name} ${item.description || ""}`,
  );
  return meaningfulTokens(input).some((token) => itemText.includes(token));
};

export const scorePricingReference = (
  body: PricingRequest,
  item: PricingReference,
) => {
  const input = normalizePricingText(
    `${body.service} ${body.scope} ${body.urgency} ${body.location || ""} ${
      body.details || ""
    }`,
  );
  const itemText = normalizePricingText(
    `${item.name} ${item.category || ""} ${item.description || ""}`,
  );
  const inputFamilies = detectServiceFamilies(input);
  const itemFamilies = detectServiceFamilies(itemText);
  const itemIsExtra = EXTRA_CATEGORY.test(
    normalizePricingText(item.category || ""),
  );

  if (itemIsExtra && !isDirectExtraMatch(input, item)) return 0;
  if (!itemIsExtra && !mediaKindsAreCompatible(body.service, itemText)) {
    return 0;
  }

  let score = 0;
  const matchingFamilies = inputFamilies.filter((family) =>
    itemFamilies.includes(family)
  );
  score += matchingFamilies.length * 12;

  if (broadFamily(body.service) === itemBroadFamily(item)) score += 5;

  meaningfulTokens(input).forEach((word) => {
    if (itemText.includes(word)) score += 3;
  });

  const serviceName = normalizePricingText(body.service);
  const scopeText = normalizePricingText(
    `${body.scope} ${body.details || ""}`,
  );
  const itemName = normalizePricingText(item.name);
  meaningfulTokens(scopeText).forEach((word) => {
    if (itemName.includes(word)) score += 6;
  });

  const requestedNumbers: string[] = scopeText.match(/\d+/g) ?? [];
  const itemNumbers: string[] = itemName.match(/\d+/g) ?? [];
  if (requestedNumbers.some((number) => itemNumbers.includes(number))) {
    score += 18;
  }

  if (serviceName.length > 5 && itemName.includes(serviceName)) score += 6;
  if (input.includes(itemName)) score += 8;

  score += unitScore(input, item);
  if (item.source === "service") score += 1;
  if (item.source === "plan" && !/pack|plan/.test(input)) score -= 2;
  return Math.max(0, score);
};

const matchSinglePricingReferences = (
  body: PricingRequest,
  catalog: PricingReference[],
) => {
  const sourceRank: Record<PricingReference["source"], number> = {
    service: 0,
    plan: 1,
    default: 2,
  };
  const scored = catalog
    .map((item) => ({ item, score: scorePricingReference(body, item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) =>
      b.score - a.score ||
      sourceRank[a.item.source] - sourceRank[b.item.source] ||
      a.item.price - b.item.price
    );

  const core = scored.filter(({ item }) =>
    !EXTRA_CATEGORY.test(normalizePricingText(item.category || ""))
  );
  const extras = scored.filter(({ item }) =>
    EXTRA_CATEGORY.test(normalizePricingText(item.category || ""))
  );
  const bestCoreScore = core[0]?.score || 0;
  const scoreFloor = Math.max(4, bestCoreScore - 10);

  const unique = new Map<string, PricingReference>();
  core
    .filter(({ score }) => score >= scoreFloor)
    .slice(0, 8)
    .forEach(({ item }) => {
      const key = normalizePricingText(item.name);
      if (!unique.has(key)) unique.set(key, item);
    });

  extras.slice(0, 2).forEach(({ item }) => {
    const key = normalizePricingText(item.name);
    if (!unique.has(key)) unique.set(key, item);
  });

  return [...unique.values()].slice(0, 10);
};

const isBundleReference = (item: PricingReference) => {
  const text = normalizePricingText(
    `${item.name} ${item.priceSuffix || ""}`,
  );
  return item.source === "plan" || /\bpack\b|\bplan\b/.test(text);
};

const referenceMatchesService = (
  body: PricingRequest,
  service: string,
  item: PricingReference,
) => {
  const serviceBody = requestForService(body, service);
  const serviceText = normalizePricingText(
    `${service} ${serviceBody.scope} ${body.details || ""}`,
  );
  const itemText = normalizePricingText(
    `${item.name} ${item.category || ""} ${item.description || ""}`,
  );
  const requestedFamilies = detectServiceFamilies(serviceText);
  const itemFamilies = detectServiceFamilies(itemText);
  const score = scorePricingReference(serviceBody, item);
  const sharesSpecificFamily = requestedFamilies.some((family) =>
    itemFamilies.includes(family)
  );

  if (score === 0) return false;
  if (sharesSpecificFamily) return true;
  return broadFamily(service) === itemBroadFamily(item) &&
    score >= 8;
};

const bundleCoverage = (
  body: PricingRequest,
  item: PricingReference,
) => getRequestedServices(body).filter((service) =>
  referenceMatchesService(body, service, item)
).length;

export const matchPricingReferences = (
  body: PricingRequest,
  catalog: PricingReference[],
) => {
  const services = getRequestedServices(body);
  if (services.length <= 1) {
    return matchSinglePricingReferences(
      services.length === 1 ? requestForService(body, services[0]) : body,
      catalog,
    );
  }

  const unique = new Map<string, PricingReference>();
  const add = (item: PricingReference) => {
    const key = normalizePricingText(item.name);
    if (!unique.has(key)) unique.set(key, item);
  };

  catalog
    .filter(isBundleReference)
    .map((item) => ({
      item,
      coverage: bundleCoverage(body, item),
      score: services.reduce(
        (total, service) =>
          total + scorePricingReference(requestForService(body, service), item),
        0,
      ),
    }))
    .filter(({ coverage }) => coverage >= 2)
    .sort((a, b) =>
      b.coverage - a.coverage || b.score - a.score ||
      a.item.price - b.item.price
    )
    .slice(0, 3)
    .forEach(({ item }) => add(item));

  services.forEach((service) => {
    matchSinglePricingReferences(requestForService(body, service), catalog)
      .filter((item) =>
        !EXTRA_CATEGORY.test(normalizePricingText(item.category || ""))
      )
      .slice(0, 3)
      .forEach(add);
  });

  matchSinglePricingReferences(body, catalog)
    .filter((item) =>
      EXTRA_CATEGORY.test(normalizePricingText(item.category || ""))
    )
    .slice(0, 2)
    .forEach(add);

  return [...unique.values()].slice(0, 12);
};

// Quantities must belong to the billed unit, never to deadlines, years or duration.
const extractUnitQuantity = (scope: string, suffix: string) => {
  const unit = suffix.includes("foto") ? "fotos?|fotografias?|imagen(?:es)?|productos?|packshots?"
    : suffix.includes("imagen") ? "imagen(?:es)?|renders?|vistas?"
    : suffix.includes("pieza") ? "piezas?|reels?|videos?|formatos?"
    : suffix.includes("persona") ? "personas?|retratos?|headshots?"
    : suffix.includes("hora") ? "horas?"
    : suffix.includes("ronda") ? "rondas?|revision(?:es)?|cambios?"
    : null;
  if (!unit) return null;
  const pattern = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(?:${unit})\\b`, "g");
  const quantities = [...scope.matchAll(pattern)].map((match) => {
    const [whole, fraction] = match[1].split(/[.,]/);
    return fraction?.length === 3
      ? Number(`${whole}${fraction}`)
      : Number(match[1].replace(",", "."));
  }).filter((number) => Number.isFinite(number) && number > 0);
  return quantities.length ? Math.max(...quantities) : null;
};

const estimatedReferencePrice = (
  body: PricingRequest,
  item: PricingReference,
) => {
  const suffix = normalizePricingText(item.priceSuffix || "");
  const scope = normalizePricingText(`${body.scope} ${body.details || ""}`);
  const quantity = extractUnitQuantity(scope, suffix);
  return quantity ? item.price * quantity : item.price;
};

const findFullBundleReference = (
  body: PricingRequest,
  pricingReferences: PricingReference[],
) => {
  const services = getRequestedServices(body);
  if (services.length <= 1) return null;

  return pricingReferences
    .filter(isBundleReference)
    .map((item) => ({
      item,
      coverage: bundleCoverage(body, item),
      score: services.reduce(
        (total, service) =>
          total + scorePricingReference(
            requestForService(body, service),
            item,
          ),
        0,
      ),
    }))
    .filter(({ coverage }) => coverage === services.length)
    .sort((a, b) => b.score - a.score || a.item.price - b.item.price)[0]
    ?.item || null;
};

export const getCatalogPricingBreakdown = (
  body: PricingRequest,
  pricingReferences: PricingReference[] = [],
) => {
  const services = getRequestedServices(body);
  const bundle = findFullBundleReference(body, pricingReferences);
  if (bundle) {
    return [{
      service: services.join(" + "),
      referenceName: bundle.name,
      amount: estimatedReferencePrice(body, bundle),
      isBundle: true,
    }];
  }

  return services.map((service) => {
    const serviceBody = requestForService(body, service);
    const reference = matchSinglePricingReferences(
      serviceBody,
      pricingReferences,
    ).find((item) =>
      !isBundleReference(item) &&
      !EXTRA_CATEGORY.test(normalizePricingText(item.category || ""))
    );
    return {
      service,
      referenceName: reference?.name || null,
      amount: reference
        ? estimatedReferencePrice(serviceBody, reference)
        : null,
      isBundle: false,
    };
  });
};

export const getCatalogBaseRange = (
  body: PricingRequest,
  pricingReferences: PricingReference[] = [],
): [number, number] | null => {
  const services = getRequestedServices(body);
  if (services.length > 1) {
    const fullBundle = findFullBundleReference(body, pricingReferences);

    if (fullBundle) {
      const price = estimatedReferencePrice(body, fullBundle);
      return [price, Math.max(price + 90, price * 1.35)];
    }

    const selectedPrices = services.map((service) => {
      const serviceBody = requestForService(body, service);
      const reference = matchSinglePricingReferences(
        serviceBody,
        pricingReferences,
      ).find((item) =>
        !isBundleReference(item) &&
        !EXTRA_CATEGORY.test(normalizePricingText(item.category || ""))
      );
      return reference
        ? estimatedReferencePrice(serviceBody, reference)
        : null;
    });

    if (selectedPrices.some((price) => price === null)) return null;

    const extras = pricingReferences.filter((item) =>
      EXTRA_CATEGORY.test(normalizePricingText(item.category || "")) &&
      isDirectExtraMatch(
        normalizePricingText(`${body.scope} ${body.details || ""}`),
        item,
      )
    );
    const extrasTotal = extras.reduce(
      (total, item) => total + estimatedReferencePrice(body, item),
      0,
    );
    const min = selectedPrices.reduce<number>(
      (total, price) => total + (price || 0),
      extrasTotal,
    );
    const max = selectedPrices.reduce<number>(
      (total, price) =>
        total + Math.max((price || 0) + 90, (price || 0) * 1.35),
      extrasTotal,
    );
    return min > 0 ? [min, Math.max(min + 90, max)] : null;
  }

  const specificFamilies = detectServiceFamilies(
    `${body.service} ${body.scope} ${body.details || ""}`,
  );
  const core = pricingReferences.filter((item) =>
    !EXTRA_CATEGORY.test(normalizePricingText(item.category || ""))
  );
  if (core.length === 0 || specificFamilies.length === 0) return null;

  const prices = core
    .slice(0, 4)
    .map((item) => estimatedReferencePrice(body, item))
    .filter((price) => Number.isFinite(price) && price > 0);
  if (prices.length === 0) return null;

  const anchor = prices[0];
  const nearby = prices.filter((price) =>
    price >= anchor * 0.55 && price <= anchor * 2.25
  );
  const min = Math.min(anchor, ...nearby);
  const max = Math.max(anchor * 1.35, ...nearby);
  return [min, Math.max(min + 90, max)];
};
