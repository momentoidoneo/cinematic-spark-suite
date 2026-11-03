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
- Comprobaciones técnicas, inspección, solicitud selectiva, publicación y verificación terminadas (ver resultados debajo).
- Google debe procesar las nuevas URL; volver a comprobar cuando lo pida el titular, sin monitor automático.
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

## Resultado externo y publicación
- Prueba en tiempo real de Google, galería inmobiliaria, 3 noviembre 09:00: **URL disponible para Google, se puede indexar, un breadcrumb válido**. Solicitud de indexación aceptada y añadida a cola prioritaria. No declaramos que ya esté indexada.
- Search Console Core Web Vitals, actualizado 1 noviembre: ambos tipos de dispositivo sin datos de uso suficientes; el mensaje de la interfaz se refiere a los últimos 90 días. No se interpreta como fallo ni como aprobado.
- Acciones manuales y problemas de seguridad: ambos **No se ha detectado ningún problema**.
- Las 4 exclusiones por redirección son /contacto, /tour-virtual, /portfolio, /trabajos-realizados. Todas están en el catálogo de 301 y sus destinos responden 200. Son exclusiones esperadas.
- Publicación manual: **fd0f5e14-6971-40e2-9348-822379ec396a**, commit **41ea60d**, rollback **a3f176fe-53e1-4a3a-a6a1-b206b671fef3**. No cambia backend ni automatizaciones.
- Verificación viva 09:03 Madrid: 66/66 HTML HTTP200, idénticos al build, 66 títulos únicos. 17/17 redirecciones exactas HTTP301 hacia destinos HTTP200. Smoke completo correcto (Admin, GTM, robots, 301, 404, 410).
- JS /assets/index-DutgWD6E.js, SHA256 1946f89e5f3be8c90966982f8d2a3be00708895fab41265acfe7939c3003174d, idéntico al build, solo backend independiente. Footer real del navegador confirma dimensiones 556x432 y carga correcta. Sin envíos de formularios ni eventos de lead.

## Laboratorio posterior
https://pagespeed.web.dev/analysis/https-silviocosta-net/xhyf7wr6cj — 3 noviembre 09:02 CET.
- Móvil: **99/100**, FCP/LCP 0,9s, TBT110ms, CLS0,007, SpeedIndex1,1s.
- Escritorio: **97/100**, FCP/LCP0,3s, TBT90ms, CLS0,093, SpeedIndex0,4s.
- Accesibilidad, buenas prácticas y SEO automatizado100 en ambos. Ya no figura el diagnóstico de imágenes sin width/height.
- Las muestras varían: no atribuir el salto de 86 a99 al pequeño ajuste del footer. Las fuentes siguen explicando parte del CLS de escritorio; margen estrecho respecto a0,1. No se garantiza idéntica puntuación ni CWV real. Etiquetas Ads/GA4/consentimiento preservadas.
- Potenciales mejoras no urgentes: reducir SDK/JS público sin romper auth, ajustar métricas de fuentes y mejorar política de imágenes versionadas. No hay necesidad de tocar medición o forzar caché inmutable en contenido mutable.

## Última exclusión: plantilla de buscador inexistente
- Alternativa canónica histórica: /blog?q={search_term_string}. HTTP200 y canonical actual https://silviocosta.net/blog: la consolidación es correcta.
- Se encontró un SearchAction en el schema WebSite de inicio anunciando esa búsqueda, pero Blog no implementa filtro q ni buscador. Se retira la declaración falsa, sin tocar el catálogo ni inventar una función. No se solicita indexar la URL de plantilla.
- Nueva regresión específica; **193 pruebas/27 archivos**, TypeScript y build66 correctos tras retirar el schema.


## Cierre técnico final
- Última publicación de esta intervención: **9dbd643b-fb79-4d1a-aad9-2b2ff1b6d821**, app **0a7b4f6**, posterior a retirar SearchAction. Rollback inmediato fd0f5e14-6971-40e2-9348-822379ec396a; baseline anterior a la auditoría a3f176fe-53e1-4a3a-a6a1-b206b671fef3.
- Comprobación final 09:07 Madrid: 66/66 HTML idénticos al build y HTTP200; 17/17 reglas exactas301 con destino200; sin plantilla search_term_string en HTML público ni bundle. JS index-Bbxp6YKD.js SHA256 4d4972ee75a7d8ea255548285a269e0f8a22e9a661b793ac76b1a4bbebaef31d; backend independiente; smoke completo correcto.
- El informe Lighthouse09:02 corresponde al parche anterior al último cambio exclusivo de metadatos; no se ha vuelto a muestrear después de retirar SearchAction. No se presenta como prueba de un aumento causado por ese cambio.
- Único bloqueo de acceso: cuenta gestora de Google Business Profile pendiente de confirmar. Ficha no modificada ni duplicada. Pendiente externo: procesamiento e indexación por Google y acumulación suficiente de datos de usuarios reales.
- No se han pausado, activado ni editado campañas; sin presupuesto/pujas/objetivos, sin cambios de etiquetas o consentimiento, sin leads sintéticos ni envíos de prueba.
