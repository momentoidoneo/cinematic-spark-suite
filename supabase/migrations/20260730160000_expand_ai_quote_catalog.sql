-- Expand the editable catalog used by the AI quote assistant.
-- Existing prices are preserved: only services whose name is absent are inserted.

UPDATE public.pricing_services
SET category = 'Fotografía'
WHERE category IN ('Fofografía', 'Fotografía de producto');

UPDATE public.pricing_services
SET category = 'Renders y 3D'
WHERE category = 'Rendets';

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
      'Fotografía inmobiliaria para alquiler vacacional',
      'Reportaje optimizado para Airbnb, Booking y alojamientos turísticos, con énfasis en amplitud, luz y servicios.',
      220::numeric,
      '/inmueble',
      'Fotografía',
      115
    ),
    (
      'Fotografía de hotel y alojamientos',
      'Cobertura de habitaciones, zonas comunes, restauración, exteriores y detalles para web, OTAs y campañas.',
      550::numeric,
      '/sesión',
      'Fotografía',
      125
    ),
    (
      'Pack ecommerce hasta 20 productos',
      'Fotografía homogénea de hasta 20 productos sobre fondo sencillo, con edición y entrega para tienda online.',
      280::numeric,
      '/sesión',
      'Fotografía',
      132
    ),
    (
      'Pack ecommerce hasta 50 productos',
      'Producción eficiente de catálogo para hasta 50 productos con iluminación y edición consistentes.',
      480::numeric,
      '/sesión',
      'Fotografía',
      135
    ),
    (
      'Fotografía gastronómica de carta completa',
      'Producción de una selección amplia de platos, ambiente y detalles para carta, web, delivery y redes.',
      520::numeric,
      '/sesión',
      'Fotografía',
      145
    ),
    (
      'Headshots de equipo hasta 10 personas',
      'Retratos coherentes de hasta 10 personas en las instalaciones del cliente o localización acordada.',
      450::numeric,
      '/sesión',
      'Fotografía',
      165
    ),
    (
      'Fotografía corporativa media jornada',
      'Cobertura de equipo, instalaciones, procesos y retratos durante una producción de hasta media jornada.',
      450::numeric,
      '/media jornada',
      'Fotografía',
      172
    ),
    (
      'Fotografía corporativa jornada completa',
      'Producción corporativa extendida para varias localizaciones, departamentos o necesidades de comunicación.',
      750::numeric,
      '/jornada',
      'Fotografía',
      174
    ),
    (
      'Fotografía de eventos 2 horas',
      'Cobertura breve para presentaciones, inauguraciones, encuentros de empresa o pequeños actos.',
      220::numeric,
      '/evento',
      'Fotografía',
      175
    ),
    (
      'Vídeo inmobiliario vertical para redes',
      'Recorrido vertical breve de una propiedad, editado para Reels, Stories, TikTok o campañas sociales.',
      350::numeric,
      '/inmueble',
      'Vídeo y dron',
      305
    ),
    (
      'Entrevista o testimonio corporativo',
      'Grabación y edición de una entrevista, testimonio de cliente, caso de éxito o pieza de liderazgo.',
      550::numeric,
      '/pieza',
      'Vídeo y dron',
      312
    ),
    (
      'Vídeo de producto o demostración',
      'Pieza audiovisual para explicar, lanzar o demostrar un producto o servicio en web, ventas o campañas.',
      650::numeric,
      '/proyecto',
      'Vídeo y dron',
      314
    ),
    (
      'Pack de 4 reels',
      'Producción coordinada de cuatro piezas cortas para redes con grabación y edición consistente.',
      900::numeric,
      '/pack',
      'Vídeo y dron',
      332
    ),
    (
      'Pack de 8 reels',
      'Producción mensual o por campaña de ocho piezas verticales optimizadas para redes sociales.',
      1600::numeric,
      '/pack',
      'Vídeo y dron',
      334
    ),
    (
      'Fotografía aérea con dron',
      'Serie de fotografías aéreas editadas para inmobiliaria, turismo, industria, obra o comunicación corporativa.',
      300::numeric,
      '/sesión',
      'Vídeo y dron',
      342
    ),
    (
      'Pack foto y vídeo con dron',
      'Captura combinada de fotografía y clips 4K en una misma operación, sujeta a viabilidad de vuelo.',
      450::numeric,
      '/sesión',
      'Vídeo y dron',
      344
    ),
    (
      'Inspección visual con dron',
      'Captura técnica visual de cubiertas, fachadas, instalaciones u obra para revisión y documentación.',
      450::numeric,
      '/operación',
      'Vídeo y dron',
      346
    ),
    (
      'Grabación íntegra de conferencia',
      'Registro completo de una ponencia, conferencia o formación con edición básica y entrega digital.',
      550::numeric,
      '/evento',
      'Vídeo y dron',
      372
    ),
    (
      'Pack evento foto + vídeo resumen',
      'Cobertura combinada de fotografía y vídeo highlight para eventos corporativos, ferias o presentaciones.',
      1100::numeric,
      '/evento',
      'Vídeo y dron',
      374
    ),
    (
      'Podcast de vídeo multicámara',
      'Grabación de videopodcast o entrevista larga con varias cámaras, audio cuidado y edición del episodio.',
      550::numeric,
      '/sesión',
      'Vídeo y dron',
      376
    ),
    (
      'Etiquetado y personalización de tour Matterport',
      'Alta de etiquetas, textos, enlaces, identidad visual y puntos informativos dentro de un tour existente.',
      120::numeric,
      '/tour',
      'Tours virtuales y 360',
      560
    ),
    (
      'Panorámica 360 fotorrealista',
      'Imagen panorámica 3D navegable para presentar interiores, promociones o espacios todavía no construidos.',
      320::numeric,
      '/imagen',
      'Renders y 3D',
      730
    ),
    (
      'Home staging virtual',
      'Amueblado y estilismo digital de una estancia vacía o desactualizada para mejorar su presentación comercial.',
      80::numeric,
      '/imagen',
      'Renders y 3D',
      740
    ),
    (
      'Webinar o formación online',
      'Realización y soporte audiovisual para webinar, masterclass o formación retransmitida online.',
      450::numeric,
      '/evento',
      'Streaming y eventos',
      930
    ),
    (
      'Streaming multicámara premium',
      'Realización avanzada con varias cámaras, grafismo, contenidos remotos y soporte técnico ampliado.',
      1800::numeric,
      '/evento',
      'Streaming y eventos',
      940
    ),
    (
      'Operador adicional de cámara o fotografía',
      'Segundo operador para producciones que requieren cobertura simultánea, más ángulos o equipos separados.',
      300::numeric,
      '/jornada',
      'Extras',
      1160
    ),
    (
      'Asistente de producción',
      'Apoyo en iluminación, equipo, coordinación de escena y logística durante la producción.',
      180::numeric,
      '/jornada',
      'Extras',
      1170
    ),
    (
      'Maquillaje y estilismo',
      'Profesional de maquillaje y retoque de imagen para retrato, moda, entrevista o producción publicitaria.',
      250::numeric,
      '/sesión',
      'Extras',
      1180
    ),
    (
      'Subtítulos y adaptación de idioma',
      'Creación e integración de subtítulos o adaptación básica de una pieza a otro idioma.',
      90::numeric,
      '/pieza',
      'Extras',
      1190
    ),
    (
      'Locución profesional',
      'Grabación de voz profesional para vídeo corporativo, spot, presentación o contenido digital.',
      180::numeric,
      '/pieza',
      'Extras',
      1200
    ),
    (
      'Licencia musical',
      'Licencia orientativa de música para una pieza audiovisual y sus canales de publicación acordados.',
      90::numeric,
      '/pieza',
      'Extras',
      1210
    ),
    (
      'Entrega de material bruto',
      'Preparación y entrega organizada de los archivos originales cuando se acuerde expresamente.',
      150::numeric,
      '/proyecto',
      'Extras',
      1220
    ),
    (
      'Ronda adicional de cambios',
      'Ronda de revisión posterior a las incluidas inicialmente en el alcance del proyecto.',
      75::numeric,
      '/ronda',
      'Extras',
      1230
    ),
    (
      'Adaptación a formato adicional',
      'Versión adicional de una pieza para otra relación de aspecto, duración o canal de publicación.',
      50::numeric,
      '/pieza',
      'Extras',
      1240
    ),
    (
      'Trabajo nocturno o fin de semana',
      'Suplemento orientativo por producción fuera del horario habitual, sujeto a disponibilidad.',
      150::numeric,
      '/proyecto',
      'Extras',
      1250
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
