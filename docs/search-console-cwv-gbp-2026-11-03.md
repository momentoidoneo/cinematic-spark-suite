# Search Console, Core Web Vitals y Google Business Profile — 2026-11-03

## Goal
Auditar y corregir las comprobaciones externas pendientes de silviocosta.net, sin modificar Ads ni la medición de conversiones.

## Instructions
Proyecto aislado cinematic-spark-suite / worktree supabase-migration. Sin nuevas pruebas de leads, envíos de correo, costes, permisos o automatizaciones.

## Discoveries
- Identidad Search Console: momentoidoneo@gmail.com. Propiedad URL-prefix accesible https://silviocosta.net/. La propiedad de dominio sc-domain:silviocosta.net no está disponible con esta sesión: no se ha creado ni solicitado acceso.
- Sitemap previo: registrado como índice, enviado/leído 27 julio 2026, 0 páginas. El recurso actual es un urlset HTTP200 con 66 URL.
- Después del reenvío: tipo Sitemap, enviado y leído 3 noviembre 2026, Correcto, **66 páginas descubiertas**. No equivale a 66 indexadas.
- Informe de indexación actualizado 23 octubre 2026 (anterior a la migración y al SEO publicado): 17 indexadas, 14 excluidas. Las cifras no miden los cambios del 3 de noviembre.
- Exclusiones: 5 no encontradas, 4 redirecciones, 2 noindex, 1 robots, 1 canónica alternativa, 1 rastreada sin indexar.
- 404: /servicios sin sustitución; dos viejos artículos de dron/tours redirigían mediante wildcard a /blog con slugs inexistentes. /profile/krys6mdenise/blog-likes es un perfil Wix desaparecido; /single-post/fotografía-de-arquitectura no tiene artículo editorial equivalente publicado. Se mantienen 404 reales para retirados sin sustituto, no se redirigen todos a la portada.
- noindex histórico: /servicios-1 ya responde 301 a /servicios/fotografia HTTP200; /demo responde 404. Robots: /login (privado), correcto, no se desbloquea.
- Galería /portafolio/fotografia/real-estate-e-interiorismo: rastreada 21 octubre 2026 22:13:28; rastreo/indexación permitidos, obtención correcta, canónica propia; no indexada. La versión con HTML público completo se publicó el 3 noviembre.
- Google Business Profile con momentoidoneo@gmail.com muestra 0 empresas. Se preguntó al titular por la cuenta gestora; no crear duplicado ni cambiar información de otra empresa.

## Rendimiento de laboratorio inicial
Informe https://pagespeed.web.dev/analysis/https-silviocosta-net/nwxi9qh28d — 3 noviembre 2026 08:49 CET, Lighthouse 13.6.0. Inicio, una carga emulada; no promedio de usuarios reales.

| Métrica | Móvil | Ordenador |
|---|---:|---:|
| Rendimiento | 86 | 96 |
| Accesibilidad / prácticas / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| FCP | 1,9 s | 0,3 s |
| LCP | 1,9 s | 1,1 s |
| TBT | 360 ms | 60 ms |
| CLS | 0 | 0,089 |
| Speed Index | 4,9 s | 0,5 s |

CrUX no tiene datos suficientes. No declarar Core Web Vitals aprobados, INP medido, accesibilidad completa ni posicionamiento garantizado por Lighthouse100.
- Tareas largas móvil: Google Ads/GA4/GTM 737 ms, código propio 216 ms. No se retiran ni retrasan etiquetas para mejorar artificialmente la puntuación.
- Cambios visuales escritorio: fuentes DM Sans italic / Inter y logo de Footer sin dimensiones. Se reserva la proporción real del logo (556x432), lazy/async. No se cambia identidad visual.
- Caché de imágenes Supabase: 1 hora, modificables desde Admin. No imponer immutable a URLs no garantizadas inmutables. Matterport es proveedor externo.
- JS propio ~184,7 KiB transferidos y SDK Supabase: posible optimización arquitectónica futura, no se arriesga autenticación/cotizador en esta corrección.

## Accomplished
- Sitemap reenviado y lectura confirmada con 66 URL.
- Tres rutas antiguas con sustituto válido, más dos alias /blog generados por la antigua regla, corregidas mediante 301 exactas. El wildcard /single-post/* se sustituye por el catálogo explícito de artículos publicados.
- Validador de build comprueba que cada 301 apunta a una página pública en sitemap y que las imágenes del footer tienen dimensiones.
- Prueba regresión para slugs Wix; actualización de la expectativa antigua de wildcard (era precisamente el defecto).

## Preflight
- Cloudflare CLI confirma momentoidoneo@gmail.com, cuenta 0e75bd5bb4b7456e4338216af1657482, release a3f176fe-53e1-4a3a-a6a1-b206b671fef3.
- Bundle vivo index-BRLTmdH0.js SHA256 a698426ef46fa2385490fcd64ede3d0b2734a84cda6dfc2e00821cd75a9e1479, backend independiente sffgaplkqmmnikqhhftx, sin referencia antigua.
- Cloudflare UI actual: Git repository Connect; sin cron, colas o triggers email. Sin workflows locales. Git main remoto d56bd73 coincide con HEAD inicial. No se reconecta Git ni se modifica backend.
- 192 pruebas / 27 archivos, TypeScript app/node, diff --check, build y validación de 66 páginas correctos.

## Next Steps
- Completar inspección publicada e indexación selectiva, seguridad/manual actions y otras exclusiones.
- Publicar y verificar el parche; contrastar Lighthouse posterior sin atribuir variaciones de una sola muestra exclusivamente al cambio.
- GBP pendiente de identificar la cuenta con acceso a la ficha real.

## Relevant Files
- scripts/prerender-seo.mjs — 301 exactas con destinos comprobables.
- scripts/validate-prerender.mjs — garantías de destinos públicos y dimensiones.
- scripts/smoke-site.mjs — prueba HTTP de las tres redirecciones reparadas.
- src/components/Footer.tsx — dimensiones reales del logo.
- src/test/seoInfrastructure.test.ts — regresión del wildcard.
- docs/search-console-2026-11-03/sitemap-correcto-66.png — evidencia de lectura del sitemap.

## Key Learnings:
1. Una redirección genérica de Wix a /blog puede ocultar enlaces rotos si también cambiaron los slugs; usar correspondencias explícitas y comprobar el HTTP final.
2. Páginas descubiertas, indexadas y métricas de laboratorio son estados distintos; Search Console conserva retraso de procesamiento.
