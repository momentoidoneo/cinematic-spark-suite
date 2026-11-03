# SEO/GEO/AEO — correcciones del 3 de noviembre de 2026

## Goal
Aplicar la recomendación aprobada, conservando la web comercial, el backend independiente y Google Ads.

## Instructions
- Proyecto aislado cinematic-spark-suite, worktree supabase-migration. Sin Ads, presupuesto, pujas ni monitorización.
- Confirmación expresa del titular: fotografía inmobiliaria **24–48 h**; tour Matterport **12 meses de hosting incluidos**.
- No inventar clientes, cifras de negocio, casos de éxito o detalles de fotografías.

## Discoveries
- El prerender anterior era una segunda página resumida, distinta del componente real. React y el HTML inicial daban títulos distintos.
- Las tarjetas del portafolio eran botones sin URL de navegación: se convierten en enlaces rastreables, conservando galerías y lightbox.
- Vite preview sin barra final devuelve el shell de inicio para rutas anidadas; para comprobar el HTML prerenderizado local usar barra final. Cloudflare usa drop-trailing-slash con archivos index por ruta.
- El trigger de programación del blog solo actúa en INSERT/DELETE o UPDATE de status/scheduled_at. Esta edición cambia content/excerpt/updated_at: no programa ni envía comunicaciones.

## Accomplished
- Renderer estático con los mismos componentes React públicos, sin App de seguimiento, autenticación ni administración; React no ejecuta effects durante el build.
- Snapshot de contenido público por ruta, consultas anónimas y campos explícitos; sin secretos, sesiones, solicitudes, suscriptores ni tablas privadas. Fallo de consulta detiene la publicación; no se degrada silenciosamente a una web vacía.
- Contenido, imágenes, enlaces, preguntas y esquemas disponibles antes de JavaScript. Estado inicial compartido con el cliente y refresco normal desde Supabase.
- Metadatos y H1 específicos por galería; prioridad consistente para ajustes SEO del Admin. Enlaces reales hacia categorías y subcategorías.
- Filtro de nombres de archivo como alt; ocho alternativas de fotografía de producto descritas tras inspección visual. En las demás imágenes sin descripción editorial se usa contexto de la galería, sin inventar detalles visuales.
- FAQs de tours, renders y eventos visibles mediante details/summary, con el mismo contenido que FAQPage.
- Plazos y hosting sincronizados con las condiciones confirmadas. Retiradas afirmaciones estadísticas sin soporte de la página de tours.
- Cuatro artículos actualizados en el Supabase independiente: vídeo, fotografía inmobiliaria, tours y drones. Retirados porcentajes/garantías sin fuente; enlaces internos y fuentes oficiales Google/AESA/ENAIRE; conservados slugs y fechas originales de publicación. dateModified usa updated_at real.
- Actualización SQL atómica a las 08:32:38 de Madrid: 4 artículos, 8 alt y 1 descripción SEO. Comparación contra valores previos y aborto completo si concurren cambios. Copias y transacción en docs/seo-2026-11-03/.
- Casos de estudio sin inventar: explicación honesta y enlace al portafolio existente. Para publicar casos completos faltan datos verificables del titular.

## Next Steps
- Completar pruebas finales, revisión visual y publicación controlada; registrar release y verificación pública debajo.
- Search Console, Core Web Vitals reales y Google Business Profile son comprobaciones externas pendientes; el build no demuestra indexación, ranking ni recomendaciones de IA.
- Los cambios editoriales posteriores del Admin aparecen al refrescar los datos del navegador; **también requieren rebuild y publicación manual para actualizar el HTML estático**. No se han reconectado despliegues Git automáticos. Revisar una automatización de invalidación/publicación por separado si el titular la solicita.

## Relevant Files
- src/seo/PublicContent.tsx, renderPublicPage.tsx, portfolioMetadata.ts — contenido público, renderer y metadatos.
- scripts/public-content.mjs, prerender-seo.mjs, validate-prerender.mjs — consultas explícitas, HTML completo y controles de publicación.
- vite.prerender.config.ts — renderer de build, nunca se publica .prerender.
- src/pages/Portfolio.tsx, BlogPost.tsx, Legal.tsx y componentes públicos — datos iniciales compartidos.
- src/components/ServiceFAQ.tsx — respuestas visibles sin JavaScript.
- docs/seo-2026-11-03/ — copia previa y edición editorial exacta.

## Key Learnings:
1. Compartir componentes y contenido público entre build y navegador elimina la divergencia entre el resumen SEO y la web real.
2. El HTML estático necesita reconstrucción tras cambios del Admin; permitir que React consulte datos nuevos no actualiza automáticamente los archivos servidos a rastreadores.

## Preflight y pruebas finales
- Cloudflare verificado en momentoidoneo@gmail.com, cuenta 0e75bd5bb4b7456e4338216af1657482, worker silviocosta-net. Release previa 5cd06a71-c33d-416d-97fd-f4f615fbe60e, código b4cd1b2 (HEAD cbea951 añade documentación).
- UI Cloudflare: Git repository / Connect; ningún cron, consumidor de cola o regla de email. Git main remoto cbea951; no workflows locales en el mismo árbol. No se reconecta ninguna automatización.
- Supabase de destino sffgaplkqmmnikqhhftx verificado ACTIVE_HEALTHY. No migraciones de esquema, Edge Functions, OAuth ni credenciales en esta intervención.
- 191 tests/27 archivos correctos, TypeScript app/node y git diff --check correctos. ESLint focalizado: sin errores; avisos de Fast Refresh para módulos que exportan componentes y helpers.
- Validador de HTML: 66 páginas, cero títulos repetidos, 65 con H2 y 66 con imágenes; H1/canonical/esquemas/FAQ/activos locales y ausencia de tablas privadas comprobados. Inicio: siete H2, 16 imágenes y 815 palabras incluyendo navegación y aviso sin JavaScript.
- Guard de formularios sin JavaScript: campos deshabilitados en HTML estático y alternativa de email; React los sustituye por el formulario validado. Evita enviar datos personales mediante el GET predeterminado del navegador. Comprobación local: siete campos activos, botón enviar y sin guard tras cargar React. No se ha enviado ningún formulario.
- Navegador: galería y FAQs comprobadas; pantalla móvil emulada de 390px sin desbordamiento horizontal en la galería. Se restauró el tamaño normal. No equivale a Core Web Vitals de usuarios reales.

## Publicación verificada
- Publicado manualmente el 3 noviembre de 2026: versión Cloudflare **a3f176fe-53e1-4a3a-a6a1-b206b671fef3**, commit de aplicación **b15a098**. Rollback anterior **5cd06a71-c33d-416d-97fd-f4f615fbe60e** conservado. Las copias editoriales permiten revertir selectivamente datos, sin tocar leads ni estados de publicación.
- Rastreo posterior: **66/66 HTTP200**, 66 títulos únicos, todos los HTML coinciden byte a byte con el build probado. JS principal `/assets/index-BRLTmdH0.js`, SHA256 `a698426ef46fa2385490fcd64ede3d0b2734a84cda6dfc2e00821cd75a9e1479`, coincide con build; contiene backend independiente y no el backend antiguo.
- Smoke correcto: sitemap, páginas comerciales, rutas Admin, GTM, robots, 301, 404 y retiradas 410. Se actualizó el smoke para reconocer el HTML completo con snapshot público, en vez de depender exclusivamente del marcador del antiguo resumen.
- Navegador de producción confirma FAQ visible y desplegable, 12 meses de hosting y metadatos correctos. Evidencia `docs/seo-2026-11-03/faq-publicada.png` y `live-validation.json`.
- Sin envíos de formulario, emails, generación IA, eventos sintéticos ni modificaciones de Google Ads. La prueba de formularios/cotizador de esta intervención es automatizada/local y de disponibilidad de UI, no una nueva entrega E2E real.
- Trabajo técnico y editorial descrito publicado; pendientes únicamente datos verificables para casos completos, descripciones individuales del resto de fotografías si se desea mayor precisión, y verificación externa Search Console/Core Web Vitals/Business Profile. No se declara garantizado el posicionamiento ni la aparición en respuestas IA.
