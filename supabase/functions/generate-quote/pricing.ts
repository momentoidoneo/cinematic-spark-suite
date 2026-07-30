export interface PricingRequest {
  service: string;
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
    "empresa",
    "instalaciones",
    "proceso industrial",
    "equipo de trabajo",
  ],
  "corporate-video": [
    "video corporativo",
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

  const requestedNumbers = scopeText.match(/\d+/g) || [];
  const itemNumbers = itemName.match(/\d+/g) || [];
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

export const matchPricingReferences = (
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

const extractQuantity = (value: string) => {
  const numbers = [...value.matchAll(/(\d+(?:[.,]\d+)?)/g)]
    .map((match) => {
      const raw = match[1];
      const separator = raw.includes(",") ? "," : ".";
      const [whole, fraction] = raw.split(separator);
      if (!fraction) return Number(whole);
      return fraction.length === 3
        ? Number(`${whole}${fraction}`)
        : Number(`${whole}.${fraction}`);
    })
    .filter((number) => Number.isFinite(number) && number > 0);
  return numbers.length ? Math.max(...numbers) : null;
};

const estimatedReferencePrice = (
  body: PricingRequest,
  item: PricingReference,
) => {
  const suffix = normalizePricingText(item.priceSuffix || "");
  const scope = normalizePricingText(`${body.scope} ${body.details || ""}`);
  const quantity = extractQuantity(scope);
  if (!quantity) return item.price;

  const unitMatches =
    (suffix.includes("foto") &&
      /foto|imagen|producto|packshot/.test(scope)) ||
    (suffix.includes("imagen") && /imagen|render|vista/.test(scope)) ||
    (suffix.includes("pieza") && /pieza|reel|video|formato/.test(scope)) ||
    (suffix.includes("persona") && /persona|retrato|headshot|equipo/.test(scope)) ||
    (suffix.includes("hora") && /hora/.test(scope)) ||
    (suffix.includes("ronda") && /ronda|revision|cambio/.test(scope));

  return unitMatches ? item.price * quantity : item.price;
};

export const getCatalogBaseRange = (
  body: PricingRequest,
  pricingReferences: PricingReference[] = [],
): [number, number] | null => {
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
