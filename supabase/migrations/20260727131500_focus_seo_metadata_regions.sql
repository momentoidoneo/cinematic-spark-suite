-- Keep editable SEO metadata aligned with the business regions that currently
-- generate qualified work. Existing OG images are preserved on update.
INSERT INTO public.seo_metadata (page_path, title, description)
VALUES
  (
    '/',
    'Producción audiovisual en Madrid y Castilla-La Mancha | Silvio Costa',
    'Fotografía, vídeo, dron, Matterport y renders 3D para empresas en Madrid y Castilla-La Mancha, con cobertura en España y Portugal.'
  ),
  (
    '/servicios/fotografia',
    'Fotografía profesional en Madrid y Castilla-La Mancha | Silvio Costa',
    'Fotografía profesional para inmobiliaria, arquitectura, producto, gastronomía, empresas y eventos en Madrid y Castilla-La Mancha.'
  ),
  (
    '/servicios/video-dron',
    'Vídeo profesional y dron en Madrid y Castilla-La Mancha | Silvio Costa',
    'Vídeo corporativo, contenido de marca y grabación con dron para empresas en Madrid y Castilla-La Mancha. Producción 4K y gestión de la operativa aérea.'
  ),
  (
    '/servicios/tour-virtual',
    'Tours virtuales 360° Matterport en Madrid y Castilla-La Mancha | Silvio Costa',
    'Tours virtuales Matterport, gemelos digitales, planos y publicación en Google Street View para espacios de Madrid y Castilla-La Mancha.'
  ),
  (
    '/servicios/eventos',
    'Fotografía y vídeo de eventos en Madrid y Castilla-La Mancha | Silvio Costa',
    'Cobertura coordinada de fotografía, vídeo, streaming y sonido para eventos corporativos, congresos y celebraciones en Madrid y Castilla-La Mancha.'
  ),
  (
    '/servicios/renders',
    'Renders 3D y visualización arquitectónica | Silvio Costa',
    'Renders fotorrealistas, animaciones y home staging virtual para arquitectura, inmobiliaria e interiorismo en Madrid, Castilla-La Mancha, España y Portugal.'
  ),
  (
    '/servicios-audiovisuales-madrid',
    'Producción audiovisual en Madrid para empresas | Silvio Costa',
    'Fotografía, vídeo, dron, Matterport y renders 3D para empresas, inmobiliarias, arquitectura y eventos en Madrid. Propuesta en menos de 24 horas.'
  ),
  (
    '/servicios-audiovisuales-castilla-la-mancha',
    'Producción audiovisual en Castilla-La Mancha | Silvio Costa',
    'Fotografía, vídeo, dron, Matterport y renders 3D para empresas, fincas, industria, turismo, inmobiliarias y eventos en Castilla-La Mancha.'
  ),
  (
    '/portafolio',
    'Portafolio de fotografía, vídeo, dron y Matterport | Silvio Costa',
    'Trabajos profesionales de fotografía, vídeo, dron, tours virtuales 360°, eventos y renders 3D realizados por Silvio Costa Photography.'
  ),
  (
    '/blog',
    'Blog de fotografía y producción audiovisual | Silvio Costa',
    'Guías sobre fotografía profesional, vídeo, drones, tours virtuales Matterport y comunicación visual para empresas.'
  ),
  (
    '/guia-servicios-audiovisuales',
    'Guía de servicios audiovisuales | Silvio Costa',
    'Guía para elegir entre fotografía profesional, vídeo, dron, tour virtual Matterport, eventos o renders 3D según el objetivo del proyecto.'
  ),
  (
    '/glosario',
    'Glosario audiovisual: fotografía, vídeo, dron y tours 360° | Silvio Costa',
    'Diccionario de términos profesionales de fotografía, vídeo, operaciones con dron, tours Matterport y renders 3D.'
  ),
  (
    '/precios',
    'Precios de fotografía y servicios audiovisuales | Silvio Costa',
    'Precios orientativos de fotografía profesional, vídeo, dron, tours virtuales Matterport, renders 3D, streaming y eventos.'
  ),
  (
    '/casos-estudio',
    'Casos de estudio audiovisuales | Silvio Costa Photography',
    'Proyectos audiovisuales reales para inmobiliaria, arquitectura, hostelería, empresa y eventos, con objetivos, proceso y resultados.'
  )
ON CONFLICT (page_path) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();
