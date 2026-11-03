# Auditoría SEO, GEO y AEO — silviocosta.net

Fecha: 2026-11-03. Proyecto: `cinematic-spark-suite`.

## Goal

Comprobar si el contenido público está optimizado para búsqueda orgánica (SEO), motores generativos (GEO) y respuestas directas (AEO). Dictamen: **base técnica presente, optimización incompleta**. Esta revisión no demuestra posiciones, indexación efectiva ni citaciones por asistentes.

## Instructions

- Revisión de solo lectura de producción; sin cambios en web, base de datos, integraciones o Google Ads.
- Checkout de referencia: `supabase-migration`, rama `codex/supabase-independent-20261102`.
- No confundir las primeras respuestas HTML con el contenido que aparece después de cargar JavaScript y los datos públicos.

## Accomplished

- Rastreadas las 66 URLs del sitemap público: 66 respuestas HTTP 200; todas con título, descripción, canonical y un H1 en el HTML inicial. Canonical único por URL.
- Verificados `robots.txt`, `llms.txt`, `llms-full.txt`, `ai-sitemap.json` y la guía Markdown de IA: 5 respuestas HTTP 200 adicionales.
- Contrastadas en Chrome siete páginas: inicio, casos de estudio, tour virtual, fotografía inmobiliaria Madrid, artículo de vídeo corporativo, guía audiovisual y fotografía de producto.
- Revisados el prerender, las etiquetas SEO, el portafolio y los textos comerciales relevantes en el código local.

## Discoveries

### 1. Prioridad alta: el prerender entrega un resumen, no la página completa

En las 66 páginas, el HTML inicial no contiene H2 ni elementos `img`; 60 contienen menos de 150 palabras. No se interpreta ese número como un umbral de Google. La portada entrega 72 palabras inicialmente frente a 808 en la muestra renderizada, con siete H2 y 16 imágenes.

`scripts/prerender-seo.mjs` construye un resumen con H1, párrafo y enlaces básicos. Los textos completos, imágenes, FAQs y gran parte del marcado estructurado dependen del renderizado posterior. Google puede ejecutar JavaScript; otros consumidores pueden no hacerlo. Esto limita la información disponible en la primera respuesta, pero **no demuestra que Google no indexe las páginas**.

Acción propuesta: prerenderizar/servir el contenido real de cada ruta, con estructura, imágenes y metadatos coherentes antes y después de React.

### 2. Prioridad alta: títulos de portafolio duplicados y pérdida de especificidad

Cinco pares de títulos iniciales duplicados (10 URLs): Video, Streaming, Eventos, Publicidad y Producto. Ejemplo: `/portafolio/fotografia/producto` y `/portafolio/video/producto` comparten «Producto | Portafolio de Silvio Costa».

Después de cargar React, la página de fotografía de producto pasa a «Portafolio — Fotografía | Silvio Costa Photography», con una descripción genérica de todo el portafolio. La subcategoría desaparece del título. El código de `Portfolio.tsx` confirma ese comportamiento.

Acción propuesta: título, descripción, H1 y texto introductorio propios por categoría/subcategoría; misma información en prerender y navegador.

### 3. Prioridad media-alta: imágenes y prueba de experiencia

La galería de fotografía de producto **sí carga ocho imágenes**. El mensaje inicial de categoría vacía era transitorio y no se considera un fallo de contenido. Sin embargo, sus textos alternativos son nombres de archivo, por ejemplo `1R9A9369.jpg`, no descripciones útiles de las fotografías.

`/casos-estudio` mantiene el mensaje «Próximamente publicaremos los primeros casos». No se encontraron URLs de casos individuales en el sitemap. Falta esta prueba editorial de trabajos, contexto y resultados verificables.

Acción propuesta: descripciones fieles de las imágenes; publicar casos reales con autorización y resultados documentados, sin inventar clientes ni métricas.

### 4. Prioridad media-alta: afirmaciones sin fuentes y condiciones divergentes

El artículo `/blog/video-corporativo-empresa-necesita-2025` muestra título de 2026 y estadísticas como 82% del tráfico, retención 95% frente al 10%, y 53 veces más probabilidades de primera página. No se observaron enlaces externos de respaldo en el artículo. Esta auditoría no ha demostrado que las cifras sean falsas: deben verificarse, contextualizarse y citarse o retirarse. El año antiguo del slug, por sí solo, no justifica cambiar la URL.

La FAQ general indica 48–72 horas para fotografía inmobiliaria; la landing inmobiliaria indica 24–48. `llms-full.txt` presenta 12 meses de hosting Matterport incluidos, mientras la guía para IA lo condiciona al presupuesto. Hay que concretar qué condiciones son correctas y sincronizarlas.

### 5. Prioridad media: datos estructurados y respuestas visibles

Existen esquemas de negocio, persona, servicios, FAQs y artículos después del renderizado. También hay guía audiovisual y glosario. No falta toda la preparación AEO.

En tour virtual, cinco preguntas se incluyen en `FAQPage`, pero el componente solo utiliza `tourVirtualFAQs` para el marcado: no muestra un bloque equivalente de preguntas y respuestas. Por ejemplo, la pregunta sobre el plazo de entrega no aparece en el texto renderizado. Mostrar esas respuestas al visitante o ajustar el marcado a lo realmente visible.

### 6. GEO no equivale a tener un archivo llms.txt

Los archivos de ayuda para IA existen y permiten acceso a varios rastreadores. No prueban que una IA los utilice o cite. Google indica que sus funciones de IA no requieren archivos de IA ni marcado especial adicionales; siguen siendo importantes el contenido útil, accesible, fiable y coherente.

La web comunica Madrid como base y dispone de páginas de cobertura. No se auditó la ficha Google Business Profile ni la consistencia de menciones externas.

## Next Steps

1. Corregir el contenido HTML inicial y la coherencia de títulos/descripciones del portafolio.
2. Mejorar los textos alternativos y alinear FAQ visible con marcado estructurado.
3. Unificar plazos/hosting, verificar estadísticas y desarrollar casos reales.
4. Contrastar indexación e inspección de URLs en Search Console, Core Web Vitals reales, Google Business Profile y menciones/citas externas. Estas comprobaciones siguen pendientes.

No se ha auditado editorialmente cada frase de las 66 páginas ni toda su experiencia móvil. No se han enviado formularios, solicitado presupuestos, generado conversiones ni alterado campañas. Solo se añade este informe local.

## Relevant Files

- `scripts/prerender-seo.mjs` — HTML inicial resumido y metadatos.
- `src/components/SEOHead.tsx` — metadatos y esquemas después del renderizado.
- `src/pages/Portfolio.tsx` — título/descripción genéricos y galería.
- `src/pages/ServicioTourVirtual.tsx` — FAQ declarada solo en el esquema.
- `src/pages/CasosEstudio.tsx` — listado público de casos.
- `src/content/landingFaq.ts` y `src/content/adsLandingConfigs.ts` — condiciones comerciales.
- `public/llms-full.txt` y `public/ai-context/servicios-audiovisuales.md` — información para consumidores de IA.
- Evidencia temporal local: `/tmp/silviocosta-seo-audit-20261103/{raw,analysis,rendered}.json`.

## Fuentes oficiales de interpretación

- [Google: funciones de IA y tu sitio web](https://developers.google.com/search/docs/appearance/ai-features).
- [Google: fundamentos de SEO con JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Key Learnings:

1. El HTML público inicial es mucho más limitado que la página renderizada; ambos estados deben verificarse por separado.
2. La galería de producto carga datos de forma asíncrona: no diagnosticar ausencia de imágenes desde el estado inicial vacío.
