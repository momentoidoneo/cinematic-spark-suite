-- Standard editable pricing catalog.
-- These rows provide a complete starting point for the public pricing page.
-- Admins can edit, hide or delete every row from Admin > Precios.

INSERT INTO public.pricing_plans (
  name,
  description,
  price,
  price_suffix,
  features,
  is_highlighted,
  is_visible,
  show_from,
  "order"
)
SELECT
  seed.name,
  seed.description,
  seed.price,
  seed.price_suffix,
  seed.features,
  seed.is_highlighted,
  seed.is_visible,
  seed.show_from,
  seed.display_order
FROM (
  VALUES
    (
      'Inmobiliario Esencial',
      'Sesión ágil para vivienda estándar, alquiler o venta con entrega rápida para portales.',
      180::numeric,
      '/inmueble',
      ARRAY[
        '15-25 fotografías editadas',
        'Corrección de color, luz y perspectiva',
        'Entrega habitual en 48-72 horas',
        'Licencia para web, portales y redes propias'
      ]::text[],
      false,
      true,
      true,
      10
    ),
    (
      'Inmobiliario Premium',
      'Pack recomendado para propiedades con mayor valor visual, exteriores o necesidad de destacar.',
      350::numeric,
      '/inmueble',
      ARRAY[
        'Fotografía inmobiliaria premium',
        'Tomas de dron si la ubicación lo permite',
        'Selección ampliada y edición avanzada',
        'Material preparado para portales, web y redes'
      ]::text[],
      true,
      true,
      true,
      20
    ),
    (
      'Producción Empresa',
      'Producción visual para empresas, hoteles, restaurantes, campañas o comunicación corporativa.',
      800::numeric,
      '/proyecto',
      ARRAY[
        'Briefing y recomendación de alcance',
        'Rodaje de fotografía, vídeo o contenido mixto',
        'Edición profesional y versiones para canales digitales',
        'Plan de entregables orientado a conversión'
      ]::text[],
      false,
      true,
      true,
      30
    )
) AS seed(
  name,
  description,
  price,
  price_suffix,
  features,
  is_highlighted,
  is_visible,
  show_from,
  display_order
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.pricing_plans existing
  WHERE lower(existing.name) = lower(seed.name)
);

INSERT INTO public.pricing_services (
  name,
  description,
  price,
  price_suffix,
  category,
  is_visible,
  show_from,
  "order"
)
SELECT
  seed.name,
  seed.description,
  seed.price,
  seed.price_suffix,
  seed.category,
  true,
  true,
  seed.display_order
FROM (
  VALUES
    (
      'Fotografía inmobiliaria estándar',
      'Sesión para vivienda estándar con interiores, exteriores principales y edición para portales.',
      180::numeric,
      '/inmueble',
      'Fotografía',
      100
    ),
    (
      'Fotografía inmobiliaria premium',
      'Cobertura ampliada para inmuebles de alto valor, viviendas turísticas o espacios con más detalle visual.',
      280::numeric,
      '/inmueble',
      'Fotografía',
      110
    ),
    (
      'Fotografía de arquitectura e interiorismo',
      'Reportaje cuidado para estudios, arquitectos, interioristas, hoteles y espacios comerciales.',
      350::numeric,
      '/sesión',
      'Fotografía',
      120
    ),
    (
      'Fotografía de producto y ecommerce',
      'Imágenes de producto para catálogo, tienda online, campañas o marketplaces.',
      250::numeric,
      '/sesión',
      'Fotografía',
      130
    ),
    (
      'Fotografía gastronómica',
      'Sesión para restaurantes, cartas, delivery, hoteles y campañas de hostelería.',
      280::numeric,
      '/sesión',
      'Fotografía',
      140
    ),
    (
      'Fotografía de moda y lookbook',
      'Producción para lookbooks, catálogo, editorial, ecommerce o marca personal.',
      450::numeric,
      '/sesión',
      'Fotografía',
      150
    ),
    (
      'Retrato corporativo y headshots',
      'Retratos profesionales para equipos, directivos, LinkedIn, web corporativa y prensa.',
      220::numeric,
      '/sesión',
      'Fotografía',
      160
    ),
    (
      'Fotografía industrial y corporativa',
      'Reportaje de instalaciones, procesos, equipos y comunicación empresarial.',
      450::numeric,
      '/jornada',
      'Fotografía',
      170
    ),
    (
      'Fotografía de eventos 4 horas',
      'Cobertura fotográfica para presentaciones, congresos, ferias, inauguraciones o actos de empresa.',
      400::numeric,
      '/evento',
      'Fotografía',
      180
    ),
    (
      'Fotografía de eventos día completo',
      'Cobertura extendida con selección editada para comunicación, prensa, web y redes.',
      800::numeric,
      '/evento',
      'Fotografía',
      190
    ),
    (
      'Reportaje de boda esencial',
      'Cobertura fotográfica de boda con estilo documental y edición profesional.',
      900::numeric,
      '/evento',
      'Fotografía',
      200
    ),
    (
      'Vídeo inmobiliario',
      'Pieza audiovisual para venta o alquiler de inmuebles, alojamientos turísticos y propiedades premium.',
      450::numeric,
      '/inmueble',
      'Vídeo y dron',
      300
    ),
    (
      'Vídeo corporativo',
      'Vídeo para presentar empresa, equipo, instalaciones, servicio, marca o caso de éxito.',
      800::numeric,
      '/proyecto',
      'Vídeo y dron',
      310
    ),
    (
      'Vídeo publicitario o spot',
      'Producción con mayor planificación creativa para campañas, lanzamientos o publicidad digital.',
      1200::numeric,
      '/proyecto',
      'Vídeo y dron',
      320
    ),
    (
      'Reels y piezas para redes',
      'Pieza corta vertical u horizontal para Instagram, TikTok, LinkedIn, YouTube Shorts o campañas.',
      350::numeric,
      '/pieza',
      'Vídeo y dron',
      330
    ),
    (
      'Grabación aérea con dron',
      'Tomas aéreas profesionales en 4K, sujetas a viabilidad técnica y normativa de vuelo.',
      350::numeric,
      '/sesión',
      'Vídeo y dron',
      340
    ),
    (
      'Timelapse o seguimiento de obra',
      'Documentación de procesos, construcción, montaje o transformación de espacios.',
      600::numeric,
      '/jornada',
      'Vídeo y dron',
      350
    ),
    (
      'Fotogrametría y modelado 3D con dron',
      'Captura aérea para modelos 3D, documentación técnica o visualización de terreno y edificios.',
      750::numeric,
      '/proyecto',
      'Vídeo y dron',
      360
    ),
    (
      'Vídeo resumen de eventos',
      'Highlight audiovisual de congresos, ferias, presentaciones, bodas o eventos corporativos.',
      700::numeric,
      '/evento',
      'Vídeo y dron',
      370
    ),
    (
      'Tour virtual Matterport hasta 200 m²',
      'Escaneo Matterport para inmueble, comercio, oficina o espacio pequeño con tour navegable.',
      250::numeric,
      '/espacio',
      'Tours virtuales y 360',
      500
    ),
    (
      'Tour virtual Matterport 200-500 m²',
      'Recorrido virtual 360 para espacios medianos, hoteles, restaurantes, oficinas o locales comerciales.',
      450::numeric,
      '/espacio',
      'Tours virtuales y 360',
      510
    ),
    (
      'Tour virtual Matterport gran espacio',
      'Escaneo de espacios amplios, promociones, museos, coworkings, gimnasios o complejos turísticos.',
      750::numeric,
      '/espacio',
      'Tours virtuales y 360',
      520
    ),
    (
      'Plano de planta y mediciones',
      'Plano orientativo y herramientas de medición asociadas al tour o al levantamiento del espacio.',
      120::numeric,
      '/espacio',
      'Tours virtuales y 360',
      530
    ),
    (
      'Publicación en Google Street View',
      'Preparación y publicación de recorrido compatible para mejorar visibilidad local en Google.',
      150::numeric,
      '/espacio',
      'Tours virtuales y 360',
      540
    ),
    (
      'Hosting o renovación Matterport',
      'Renovación anual orientativa del alojamiento del tour cuando no esté incluido en el proyecto.',
      90::numeric,
      '/año',
      'Tours virtuales y 360',
      550
    ),
    (
      'Render 3D fotorrealista',
      'Imagen 3D para arquitectura, interiorismo, promoción inmobiliaria o producto no construido.',
      180::numeric,
      '/imagen',
      'Renders y 3D',
      700
    ),
    (
      'Pack renders promoción inmobiliaria',
      'Conjunto de vistas 3D para presentar una promoción, vivienda piloto o propuesta comercial.',
      900::numeric,
      '/proyecto',
      'Renders y 3D',
      710
    ),
    (
      'Visualización de producto 3D',
      'Modelado y render para producto, catálogo, web, campaña o presentación comercial.',
      350::numeric,
      '/modelo',
      'Renders y 3D',
      720
    ),
    (
      'Streaming profesional básico',
      'Retransmisión sencilla para eventos, charlas, presentaciones o reuniones con una realización ligera.',
      600::numeric,
      '/evento',
      'Streaming y eventos',
      900
    ),
    (
      'Streaming multicámara',
      'Realización en directo con varias cámaras para congresos, eventos corporativos o conferencias.',
      1200::numeric,
      '/evento',
      'Streaming y eventos',
      910
    ),
    (
      'Grabación de conferencia o presentación',
      'Registro audiovisual de ponencia, formación, charla o presentación para uso posterior.',
      500::numeric,
      '/evento',
      'Streaming y eventos',
      920
    ),
    (
      'Preproducción y guion',
      'Definición de concepto, estructura narrativa, necesidades de rodaje y lista de entregables.',
      250::numeric,
      '/proyecto',
      'Extras',
      1100
    ),
    (
      'Edición avanzada o retoque extra',
      'Trabajo adicional de postproducción, retoque complejo, montaje o adaptación de piezas.',
      60::numeric,
      '/hora',
      'Extras',
      1110
    ),
    (
      'Entrega urgente 24-48h',
      'Prioridad de edición y entrega cuando el calendario del proyecto lo permita.',
      120::numeric,
      '/proyecto',
      'Extras',
      1120
    ),
    (
      'Desplazamiento fuera de zona base',
      'Coste orientativo de desplazamiento según distancia, tiempos, peajes, dietas o alojamiento.',
      60::numeric,
      '/desplazamiento',
      'Extras',
      1130
    ),
    (
      'Licencia de uso ampliada',
      'Ampliación de derechos para campañas, medios pagados, terceros o usos no previstos inicialmente.',
      150::numeric,
      '/proyecto',
      'Extras',
      1140
    ),
    (
      'Gestión de permisos de dron',
      'Estudio de viabilidad, coordinación básica y preparación de permisos cuando sean necesarios.',
      120::numeric,
      '/operación',
      'Extras',
      1150
    )
) AS seed(
  name,
  description,
  price,
  price_suffix,
  category,
  display_order
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.pricing_services existing
  WHERE lower(existing.name) = lower(seed.name)
);
