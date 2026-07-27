export type RegionalCoverageKey = "madrid" | "castilla-la-mancha";

export const priorityServiceCitySlugs = ["madrid"] as const;

export type RegionalCoverageConfig = {
  name: string;
  shortName: string;
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  lead: string;
  operations: string;
  sectors: string[];
  zones: string[];
  areaServed: {
    name: string;
    containedInPlace: string;
  };
};

export const regionalCoverage: Record<
  RegionalCoverageKey,
  RegionalCoverageConfig
> = {
  madrid: {
    name: "Comunidad de Madrid",
    shortName: "Madrid",
    path: "/servicios-audiovisuales-madrid",
    title: "Producción audiovisual en Madrid para empresas | Silvio Costa",
    description:
      "Fotografía, vídeo, dron, Matterport y renders 3D para empresas, inmobiliarias, arquitectura y eventos en Madrid. Propuesta en menos de 24 horas.",
    eyebrow: "Cobertura prioritaria · Comunidad de Madrid",
    headline: "Producción audiovisual en Madrid orientada a resultados",
    lead:
      "Coordinamos fotografía, vídeo, dron, tours virtuales Matterport y visualización 3D para empresas y espacios que necesitan presentar mejor su proyecto, captar clientes o acelerar una decisión comercial.",
    operations:
      "Trabajamos con un alcance definido antes de producir: localización, fecha, permisos, entregables, derechos de uso y calendario. Para proyectos dentro de la Comunidad de Madrid agrupamos desplazamientos y recursos para evitar costes innecesarios.",
    sectors: [
      "Inmobiliarias y promotoras",
      "Arquitectura e interiorismo",
      "Hoteles, restauración y espacios comerciales",
      "Empresas y comunicación corporativa",
      "Congresos, ferias y eventos",
      "Construcción y seguimiento de obra",
    ],
    zones: [
      "Madrid capital",
      "Alcobendas y San Sebastián de los Reyes",
      "Pozuelo, Majadahonda y Las Rozas",
      "Getafe, Leganés y Alcorcón",
      "Alcalá de Henares y Corredor del Henares",
      "Resto de la Comunidad de Madrid",
    ],
    areaServed: {
      name: "Comunidad de Madrid",
      containedInPlace: "España",
    },
  },
  "castilla-la-mancha": {
    name: "Castilla-La Mancha",
    shortName: "Castilla-La Mancha",
    path: "/servicios-audiovisuales-castilla-la-mancha",
    title:
      "Producción audiovisual en Castilla-La Mancha | Silvio Costa",
    description:
      "Fotografía, vídeo, dron, Matterport y renders 3D para empresas, fincas, industria, turismo, inmobiliarias y eventos en Castilla-La Mancha.",
    eyebrow: "Cobertura prioritaria · Castilla-La Mancha",
    headline:
      "Fotografía y producción audiovisual en Castilla-La Mancha",
    lead:
      "Planificamos producciones para empresas, inmuebles, fincas, alojamientos, industria, arquitectura y eventos en toda Castilla-La Mancha, combinando en un único equipo los recursos visuales que realmente necesita cada proyecto.",
    operations:
      "La amplitud del territorio hace especialmente importante preparar bien cada desplazamiento. Antes de confirmar revisamos localización, tiempos, accesos, restricciones de dron y lista de entregables para concentrar la producción y evitar viajes o jornadas innecesarias.",
    sectors: [
      "Fincas, bodegas y turismo rural",
      "Industria, logística y construcción",
      "Inmobiliarias y promociones residenciales",
      "Hoteles, restaurantes y espacios de eventos",
      "Administraciones, cultura y patrimonio",
      "Empresas y comunicación corporativa",
    ],
    zones: [
      "Toledo y Talavera de la Reina",
      "Guadalajara y Corredor del Henares",
      "Cuenca",
      "Ciudad Real",
      "Albacete",
      "Resto de Castilla-La Mancha",
    ],
    areaServed: {
      name: "Castilla-La Mancha",
      containedInPlace: "España",
    },
  },
};
