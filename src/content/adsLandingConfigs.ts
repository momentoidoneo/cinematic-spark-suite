import {
  Building2,
  Camera,
  Clapperboard,
  Megaphone,
  Plane,
  Store,
  UtensilsCrossed,
  Video,
} from "lucide-react";
import type { AdsLandingConfig } from "@/components/ads/AdsLandingBody";
import corporativo from "@/assets/ads/corporativo.avif";
import eventos from "@/assets/ads/eventos.avif";
import gastronomia from "@/assets/ads/gastronomia.avif";
import realEstateDetail from "@/assets/ads/real-estate-detail.avif";
import realEstateHero from "@/assets/ads/real-estate-hero.avif";
import realEstateWide from "@/assets/ads/real-estate-wide.avif";
import portfolioDron from "@/assets/portfolio-dron.jpg";
import portfolioVideo from "@/assets/portfolio-video.jpg";

const photographyFaqs = [
  {
    question: "¿Cuándo recibiré las fotografías?",
    answer:
      "La entrega habitual es de 24 a 48 horas en sesiones inmobiliarias y de 48 a 72 horas en producciones más amplias. Si tienes una fecha límite, la dejamos acordada antes de reservar.",
  },
  {
    question: "¿La edición está incluida?",
    answer:
      "Sí. La propuesta detalla selección, corrección de luz y color, retoque y formatos finales. En inmobiliaria también corregimos perspectiva y verticales.",
  },
  {
    question: "¿Os desplazáis fuera de Madrid?",
    answer:
      "La cobertura prioritaria está en la Comunidad de Madrid y Castilla-La Mancha. También trabajamos en otras zonas de España y Portugal cuando el proyecto lo requiere.",
  },
  {
    question: "¿Puedo usar las imágenes en web, redes y publicidad?",
    answer:
      "Sí. Definimos los usos necesarios en la propuesta para que recibas los archivos y la licencia adecuados a tus canales.",
  },
];

const realEstateFaqs = [
  {
    question: "¿Cuántas fotografías incluye una sesión inmobiliaria?",
    answer:
      "El pack Esencial incluye normalmente entre 15 y 25 fotografías editadas. En propiedades grandes o premium ajustamos el número de imágenes al recorrido y a los espacios clave.",
  },
  {
    question: "¿Cuándo están listas para publicar?",
    answer:
      "La entrega habitual es de 24 a 48 horas, con archivos optimizados para portales, web y redes. Podemos valorar entrega urgente si la publicación no puede esperar.",
  },
  {
    question: "¿Incluís vídeo, dron o tour virtual?",
    answer:
      "Se pueden combinar en una misma producción. El pack Premium contempla fotografía, vídeo, tomas de dron cuando la ubicación lo permite y tour virtual Matterport.",
  },
  {
    question: "¿Trabajáis con agencias y promotoras de forma recurrente?",
    answer:
      "Sí. Podemos organizar un flujo continuo con reserva de fechas, criterios visuales comunes y entregas preparadas para cada canal comercial.",
  },
];

const videoFaqs = [
  {
    question: "¿Qué incluye una producción de vídeo?",
    answer:
      "Definimos objetivo, guion o escaleta, rodaje, edición, color y versiones finales. La propuesta deja claro el equipo, las jornadas y los formatos incluidos.",
  },
  {
    question: "¿Gestionáis los permisos de dron?",
    answer:
      "Sí. Revisamos la zona de vuelo, la operativa y las autorizaciones necesarias. Los vuelos se realizan con piloto certificado y seguro de responsabilidad civil.",
  },
  {
    question: "¿Entregáis versiones para redes sociales?",
    answer:
      "Sí. Podemos preparar versiones horizontal, vertical y cuadrada, además de cortes cortos para campañas, web, LinkedIn, Instagram, TikTok o YouTube.",
  },
  {
    question: "¿Cuánto tarda la entrega?",
    answer:
      "Una producción estándar suele completarse entre una y dos semanas. El calendario exacto depende del guion, las jornadas de rodaje y las rondas de revisión.",
  },
];

const broadPhotographyOutcomes = [
  {
    icon: Building2,
    title: "Inmobiliaria y arquitectura",
    description:
      "Espacios luminosos, proporciones fieles y una presentación preparada para generar visitas.",
    bullets: [
      "Interiores, exteriores y detalle",
      "Perspectiva y verticales corregidas",
      "Archivos para portales, web y redes",
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "Producto y gastronomía",
    description:
      "Imágenes que explican textura, acabado y valor sin depender de fotografías genéricas.",
    bullets: [
      "E-commerce y catálogo",
      "Carta, delivery y campañas",
      "Fondo limpio o ambiente lifestyle",
    ],
  },
  {
    icon: Megaphone,
    title: "Empresa y eventos",
    description:
      "Retratos, equipo, instalaciones y cobertura editorial con una misma identidad visual.",
    bullets: [
      "Retrato corporativo",
      "Eventos y conferencias",
      "Banco de imágenes para comunicación",
    ],
  },
] as AdsLandingConfig["outcomes"];

const broadPhotographyProof = [
  {
    title: "Espacios e inmobiliaria",
    description:
      "Luz, composición y perspectiva pensadas para presentar cada espacio con claridad.",
    image: realEstateHero,
    alt: "Dormitorio fotografiado profesionalmente para un proyecto inmobiliario",
    href: "/portafolio/fotografia/real-estate-e-interiorismo",
  },
  {
    title: "Producto y gastronomía",
    description:
      "Producción controlada para catálogos, cartas, e-commerce y campañas.",
    image: gastronomia,
    alt: "Fotografía gastronómica profesional sobre fondo oscuro",
    href: "/portafolio/fotografia/gastronomia",
  },
  {
    title: "Empresa y eventos",
    description:
      "Personas, marca y momentos clave con una cobertura natural y consistente.",
    image: corporativo,
    alt: "Retrato corporativo profesional en unas oficinas",
    href: "/portafolio/fotografia/corporativa",
  },
] as AdsLandingConfig["proof"];

export const photographyServiceAdsConfig = {
  trackingLabel: "ads_servicios_fotografia",
  eyebrow: "Fotografía profesional · Madrid y Castilla-La Mancha",
  title: "Fotografía profesional",
  titleAccent: "pensada para vender mejor",
  description:
    "Creamos imágenes de inmobiliaria, producto, gastronomía, empresa y eventos que comunican valor y llegan listas para publicar.",
  heroImage: realEstateWide,
  heroAlt:
    "Fotografía profesional de un interior realizada por Silvio Costa Photography",
  primaryCta: "Pedir presupuesto",
  defaultService: "Fotografía profesional para empresas",
  trust: [
    "+10 años de experiencia",
    "Entrega acordada 24–72 h",
    "Madrid y Castilla-La Mancha",
    "Edición profesional incluida",
  ],
  proofHeading: "La calidad se comprueba antes de contratar",
  proofDescription:
    "Una selección de trabajo propio para que puedas valorar estilo, iluminación y acabado sin depender de promesas.",
  proof: broadPhotographyProof,
  outcomesHeading: "Elige el resultado que necesita tu negocio",
  outcomesDescription:
    "Definimos el tipo de producción, los entregables y los usos desde el principio.",
  outcomes: broadPhotographyOutcomes,
  deliverablesHeading: "Una entrega preparada para tus canales",
  deliverables: [
    "Planificación y recomendación de alcance",
    "Captura con iluminación y equipo profesional",
    "Selección, edición y retoque incluidos",
    "Alta resolución y versiones optimizadas para web",
    "Nombres y formatos de archivo ordenados",
    "Licencia de uso definida en la propuesta",
  ],
  priceEyebrow: "Referencia transparente",
  priceTitle: "Sesiones desde 200 €",
  priceDescription:
    "Disponemos de referencias desde 3 €/foto para producto y desde 200 € para sesiones de exterior. Te confirmamos el importe final según volumen, localización y usos.",
  faqs: photographyFaqs,
} satisfies AdsLandingConfig;

export const photographyMadridAdsConfig = {
  ...photographyServiceAdsConfig,
  trackingLabel: "ads_fotografia_madrid",
  eyebrow: "Fotógrafo profesional en Madrid",
  title: "Fotografía en Madrid",
  titleAccent: "que hace destacar tu proyecto",
  description:
    "Producción fotográfica para empresas, inmuebles, restaurantes, productos y eventos en Madrid, con dirección visual, edición y entrega lista para publicar.",
  heroImage: corporativo,
  heroAlt:
    "Retrato corporativo realizado por Silvio Costa Photography en Madrid",
  trust: [
    "+10 años de experiencia",
    "Respuesta en menos de 24 h",
    "Cobertura en toda la Comunidad",
    "Edición profesional incluida",
  ],
} satisfies AdsLandingConfig;

export const realEstateMadridAdsConfig = {
  trackingLabel: "ads_inmobiliaria_madrid",
  eyebrow: "Fotografía inmobiliaria en Madrid",
  title: "Haz que tu inmueble",
  titleAccent: "destaque desde la primera visita",
  description:
    "Fotografía HDR profesional con perspectiva corregida y entrega en 24–48 horas para agencias, promotoras, alquiler y venta de propiedades en Madrid.",
  heroImage: realEstateHero,
  heroAlt:
    "Dormitorio preparado para una sesión de fotografía inmobiliaria profesional en Madrid",
  primaryCta: "Reservar sesión",
  defaultService: "Fotografía inmobiliaria",
  trust: [
    "Desde 150 € por inmueble",
    "Entrega habitual 24–48 h",
    "Madrid y área metropolitana",
    "Edición y perspectiva incluidas",
  ],
  proofHeading: "Espacios reales, fotografiados para vender",
  proofDescription:
    "La sesión busca que distribución, luz y acabados se entiendan en segundos y mantengan una apariencia natural.",
  proof: [
    {
      title: "Dormitorios y zonas privadas",
      description:
        "Luz equilibrada, color fiel y encuadres que ayudan a entender el espacio.",
      image: realEstateHero,
      alt: "Dormitorio de vivienda fotografiado profesionalmente",
      href: "/portafolio/fotografia/real-estate-e-interiorismo",
    },
    {
      title: "Interiores y distribución",
      description:
        "Verticales corregidas y perspectivas amplias sin deformar las estancias.",
      image: realEstateDetail,
      alt: "Dormitorio principal fotografiado para un anuncio inmobiliario",
      href: "/portafolio/fotografia/real-estate-e-interiorismo",
    },
    {
      title: "Viviendas y promociones",
      description:
        "Una serie visual coherente para portales, dossier comercial, web y redes.",
      image: realEstateWide,
      alt: "Interior residencial fotografiado con iluminación profesional",
      href: "/portafolio/fotografia/real-estate-e-interiorismo",
    },
  ],
  outcomesHeading: "El formato adecuado para cada inmueble",
  outcomesDescription:
    "Puedes empezar con fotografía o combinarla con vídeo, dron y tour virtual en una única producción.",
  outcomes: [
    {
      icon: Building2,
      title: "Agencias y portales",
      description:
        "Una sesión ágil para publicar rápido y mantener un estándar visual consistente.",
      bullets: [
        "15–25 fotografías editadas",
        "Web, portales y redes propias",
        "Entrega habitual en 24–48 h",
      ],
    },
    {
      icon: Store,
      title: "Promoción y obra nueva",
      description:
        "Cobertura más amplia para materiales comerciales y campañas de lanzamiento.",
      bullets: [
        "Zonas comunes y exteriores",
        "Detalles y acabados",
        "Dossier y formatos publicitarios",
      ],
    },
    {
      icon: Video,
      title: "Pack audiovisual premium",
      description:
        "Fotografía, vídeo, dron cuando la ubicación lo permite y recorrido Matterport.",
      bullets: [
        "Una sola coordinación de producción",
        "Material para varios canales",
        "Presentación de mayor impacto",
      ],
    },
  ],
  deliverablesHeading: "Todo lo necesario para publicar",
  deliverables: [
    "15–25 fotografías editadas en pack Esencial",
    "Corrección de color, luz y perspectiva",
    "Archivos en alta resolución y versión web",
    "Licencia para portales, web y redes propias",
    "Tour virtual disponible en pack Premium",
    "Vídeo y dron disponibles según ubicación",
  ],
  priceEyebrow: "Precio orientativo publicado",
  priceTitle: "Desde 150 € / inmueble",
  priceDescription:
    "El pack Inmobiliario Esencial parte de 150 €. El Premium parte de 350 € e incorpora una producción audiovisual más completa.",
  faqs: realEstateFaqs,
} satisfies AdsLandingConfig;

export const videoDronAdsConfig = {
  trackingLabel: "ads_video_dron",
  eyebrow: "Vídeo y dron · Madrid y Castilla-La Mancha",
  title: "Producción de vídeo y dron",
  titleAccent: "con trabajo real que puedes ver",
  description:
    "Creamos piezas corporativas, publicitarias, inmobiliarias y de eventos en 4K, con planificación, rodaje, edición y versiones para cada canal.",
  heroImage: portfolioVideo,
  heroAlt:
    "Producción de vídeo profesional realizada por Silvio Costa Photography",
  primaryCta: "Pedir propuesta audiovisual",
  defaultService: "Vídeo y dron",
  trust: [
    "Producción y edición integral",
    "Piloto de dron certificado",
    "Madrid y Castilla-La Mancha",
    "Versiones para web y redes",
  ],
  proofHeading: "Mira el trabajo antes de pedir presupuesto",
  proofDescription:
    "Proyectos propios de vídeo, dron y eventos para valorar ritmo, imagen y acabado final.",
  showreel: {
    youtubeId: "-ZiwLZlG76o",
    title: "Vídeo con dron · Naves de Gamazo",
    description:
      "Una muestra real publicada en el portafolio de Silvio Costa: planificación aérea, movimiento de cámara, edición y color.",
  },
  proof: [
    {
      title: "Vídeo corporativo",
      description:
        "Piezas que presentan empresa, equipo, instalaciones o producto con un relato claro.",
      image: portfolioVideo,
      alt: "Cámara profesional durante una producción de vídeo corporativo",
      href: "/portafolio/video",
    },
    {
      title: "Tomas aéreas con dron",
      description:
        "Planos 4K con piloto certificado, evaluación de zona y gestión operativa.",
      image: portfolioDron,
      alt: "Dron profesional durante una grabación aérea",
      href: "/portafolio/dron",
    },
    {
      title: "Eventos y comunicación",
      description:
        "Cobertura multicámara, piezas resumen y materiales adaptados a redes.",
      image: eventos,
      alt: "Evento corporativo cubierto por Silvio Costa Photography",
      href: "/portafolio/eventos",
    },
  ],
  outcomesHeading: "Una producción diseñada para el canal final",
  outcomesDescription:
    "No grabamos material suelto: definimos objetivo, guion, formatos y entregables antes del rodaje.",
  outcomes: [
    {
      icon: Clapperboard,
      title: "Corporativo y publicidad",
      description:
        "Vídeos para explicar una propuesta, presentar una empresa o apoyar una campaña.",
      bullets: [
        "Concepto y escaleta",
        "Rodaje con equipo profesional",
        "Edición, color y grafismo",
      ],
    },
    {
      icon: Plane,
      title: "Dron e inmobiliario",
      description:
        "Perspectivas aéreas y recorridos que sitúan el proyecto y elevan su presentación.",
      bullets: [
        "Piloto certificado y seguro",
        "Evaluación de zona y permisos",
        "Tomas 4K estabilizadas",
      ],
    },
    {
      icon: Camera,
      title: "Eventos y redes",
      description:
        "Cobertura y versiones rápidas para prolongar el impacto después del evento.",
      bullets: [
        "Resumen principal",
        "Cortes verticales y horizontales",
        "Streaming disponible",
      ],
    },
  ],
  deliverablesHeading: "Del briefing a los archivos finales",
  deliverables: [
    "Recomendación de formato y alcance",
    "Guion, escaleta o plan de rodaje",
    "Grabación 4K y sonido según proyecto",
    "Edición, color y mezcla básica",
    "Versiones horizontal, vertical o cuadrada",
    "Calendario y rondas de revisión definidos",
  ],
  priceEyebrow: "Referencia para empresas",
  priceTitle: "Producción desde 800 €",
  priceDescription:
    "La referencia publicada para Producción Empresa parte de 800 € por proyecto. El presupuesto final depende de jornadas, equipo, localizaciones, permisos y versiones.",
  faqs: videoFaqs,
} satisfies AdsLandingConfig;

export const adsServiceCityConfigs: Record<string, AdsLandingConfig> = {
  "fotografia-madrid": photographyMadridAdsConfig,
  "fotografia-inmobiliaria-madrid": realEstateMadridAdsConfig,
};
