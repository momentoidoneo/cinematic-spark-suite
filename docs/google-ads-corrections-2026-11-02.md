# Correcciones Ads y medición — 2 noviembre 2026

## Goal
Corregir medición y aplicar mejoras autorizadas por el usuario sin pausar la campaña ni aumentar presupuesto.

## Instructions
- Proyecto exclusivo cinematic-spark-suite; release worktree supabase-migration.
- Identidad verificada en Google Ads: momentoidoneo@gmail.com, cliente 725-747-3398. Campaña Search Landing general 24091355671.
- Mantener habilitada, 9,70 EUR/día, Maximizar clics, CPC máximo 2,50 EUR. Sin monitorización recurrente.
- No confundir clics, solicitudes guardadas, recepción de etiqueta y atribución de clientes reales.

## Discoveries
- GTM publicado v7, GTM-NCPZ56K2: lead_conversion activa Ads AW-11017209497/ss0VCISFlIAbEJmNtYUp y GA4 generate_lead con transaction_id. WhatsApp y teléfono tienen etiquetas independientes secundarias.
- El formulario además emitía generate_lead directamente por gtag, duplicando la señal GA4 de cada contacto. No era un segundo evento de conversión Ads.
- El bootstrap estático ya marca GTM activo antes de cargar React/Supabase; no se ha demostrado una carrera de inicialización en producción y no se cambia ese mecanismo.
- El aviso de falta de pings recientes no demuestra por sí solo un fallo de la etiqueta actual. Persiste la necesidad de verificar una solicitud real atribuida; no inventar conversiones para retirar el aviso.
- Los eventos first-party respetan el consentimiento. Hasta esta corrección no llevaban el ID guardado del contacto/cotización; ahora se incluye transaction_id y lead_source en metadata para unirlos explícitamente, sin añadir identidad del cliente.

## Incidente de prueba técnica (no es un cliente)
- Un probe manual de dataLayer usó transaction_id/order ID `SC-DIAGNOSTIC-NOT-A-LEAD-20261102`, event_label `sc_diagnostic_intercepted`, value 0. No se envió formulario, creó fila de cliente ni hizo clic en un anuncio.
- Se había bloqueado pagead/conversion y pagead/1p-conversion, pero el bloqueo inicial omitió `/ccm/conversion/`. Una petición a googleadservices.com por esa ruta recibió HTTP200. Las dos rutas pagead y el generate_lead de GA4 fueron bloqueados por el inspector.
- No equivale a una conversión atribuida: el navegador tenía consentimiento/cookies anteriores y no se puede garantizar ausencia de atribución. No presentar un nuevo ping derivado de esta prueba como éxito comercial. El usuario fue informado en el chat.
- Se ampliaron inmediatamente los bloqueos a los dominios completos de Ads/Analytics solo en la pestaña diagnóstica. No continuar con conversiones sintéticas en producción. Cerrar esa pestaña al concluir elimina los bloqueos temporales.
- Excluir este order ID en cualquier conciliación. Si aparece contado, solicitar retractación de ese único order ID/acción, no un ajuste global. Google recomienda realizar ajustes al menos 24h después de la conversión original: https://support.google.com/google-ads/answer/7686280?hl=es . No se ha enviado ni verificado una retractación todavía.

## Accomplished
- Añadidas y verificadas dos negativas **exactas**, a nivel de esta campaña: [luis serrano fotografía], [dollhouse productora direccion]. Antes 403, ahora dos nuevas; otras negativas intactas.
- Captura: /tmp/silviocosta-ads-negativas-20261102.png.
- Corrección local: reportSavedLead centraliza contacto/cotizador, deduplica por ID guardado durante la página y deja a GTM como propietario único de generate_lead. Fallback directo emite una vez sin GTM.
- Añadida defensa contra identificadores SC-DIAGNOSTIC y SC-ADS; no se modifica el consentimiento ni se añade envío de nombre/email a Google.
- 37 pruebas focalizadas y TypeScript app pasan. En este worktree usar `node node_modules/vitest/vitest.mjs run --config vitest.migration.config.ts`; node_modules compartido necesita rutas absolutas de esta configuración existente.

## Next Steps
- Ejecutar batería completa, build y comprobar cadena de despliegue antes de publicar el frontend.
- Revisar enlaces de sitio y pertinencia del grupo General sin cambios de presupuesto ni pausas.
- Verificar publicación, conservar rollback y registrar el alcance exacto de los cambios.
- Confirmación de atribución real y, si procede, retractación del único probe quedan separadas de pruebas sintéticas/locales.

## Relevant Files
- src/lib/trackingEvents.ts — centralización, deduplicación y recibos first-party con ID.
- src/lib/leadSubmission.ts — exclusión de pruebas diagnósticas explícitas.
- src/components/CTASection.tsx, src/components/SmartQuoter.tsx — una notificación de lead tras guardado.
- src/test/trackingEvents.test.ts, src/test/contactPersistenceGate.test.tsx, src/test/SmartQuoterLeadGate.test.tsx — pruebas sin envíos reales.

## Avance 21:10 Madrid
- Incidente diagnóstico: 2026-11-02T19:56:01.818Z (20:56:01 Madrid). Evidencia saneada en ads-diagnostic-sanitized.json; cerrada la pestaña diagnóstica, sin bloqueos persistentes en el navegador del usuario.
- Cuatro enlaces nuevos, solo en campaña 24091355671, guardados y verificados como Habilitado / Pendiente, En proceso de revisión: Precios y packs → /precios; Ver trabajos realizados → /portafolio; Vídeo y dron en Madrid → /servicios/video-dron; Tours 360 Matterport → /servicios/tour-virtual. No se han reactivado los nueve enlaces históricos pausados a nivel cuenta/campaña. No se modifica la URL final de los anuncios principales.
- Destinos comprobados con GET de escritorio y Android: ocho respuestas HTTP200, URL final y título correctos. Sin páginas retiradas 410. Captura /tmp/silviocosta-ads-enlaces-20261102.png.
- No se limita ni pausa el grupo General por una muestra todavía insuficiente: se corrigen las dos consultas inequívocamente ajenas, se refuerza intención profesional/Madrid en enlaces y se mantiene el resto para no reducir a ciegas la captación.
- 178 pruebas/26 archivos pasan, TypeScript app/node y ESLint de los siete archivos editados pasan. Build genera 66 páginas públicas, 33 shells privados y 12 redirecciones.
- Preflight: Wrangler autentica momentoidoneo@gmail.com, cuenta 0e75bd5bb4b7456e4338216af1657482. Última release 54f639dc-2a68-4121-9369-a6c8f71b29ad confirmada. Cloudflare UI worker exacto: Builds / Git repository / Connect, sin conexión Git; sin cron, queues ni email triggers. Remote main actualizado y verificado 34e054b674d11b10e303b196231e94383ab62ad1, sin workflows. La diferencia desde aplicación 44413b1 hasta HEAD era solo documentación/marcadores. Se preservan los cambios del checkout original.
- Backend .env y bundle apuntan a sffgaplkqmmnikqhhftx. Ningún cambio de Edge Functions, BD, OAuth, IA o notificaciones en esta corrección; no se envían más formularios reales.

## Publicación y cierre de esta intervención
- Publicado manualmente el frontend el **2 noviembre, 21:10:42 Madrid**, versión Cloudflare **5cd06a71-c33d-416d-97fd-f4f615fbe60e**, commit de aplicación **b4cd1b2**. Se conserva como rollback la release previa **54f639dc-2a68-4121-9369-a6c8f71b29ad**. Sin reiniciar backend ni pausar Ads.
- Smoke público correcto: páginas, sitemap, Admin, GTM, robots, redirecciones 301, 404 e intencionales 410. Bundle público `/assets/index-DqcHQzgD.js` coincide byte a byte con el build probado; SHA256 `2d4de6f6bc7b64072ecee08694070b107f01642899ba624d32b86f55008bee54`. Backend independiente presente; backend antiguo ausente; helper lead_source presente.
- Navegador de producción muestra web correcta y carga GTM, GA4 y Ads esperados. Una simple visita no genera ningún lead_conversion. No se repiten formularios, cotizaciones ni emails de prueba en esta intervención; los E2E comerciales previos constan en el informe de migración.
- Ads configuración de cuenta: etiquetado automático **Sí**; aplicación automática de recomendaciones **Desactivada**. Plantilla TrafficGuard y sufijo de seguimiento existentes conservados. No se hace petición sintética al endpoint de clics de TrafficGuard.
- Comprobación final de campaña: **Habilitada**, **9,70 EUR/día**, **Maximizar clics**, **CPC máximo 2,50 EUR**. Objetivo específico formularios. No se han cambiado anuncios principales, sus URLs finales, pujas, horarios, redes ni segmentación. WhatsApp/teléfono siguen siendo acciones secundarias, no clientes confirmados.

### Pendientes que no deben darse por resueltos artificialmente
1. Google debe revisar los cuatro enlaces nuevos antes de servirlos; guardados/habilitados no significa aprobados ni publicados en una subasta.
2. Confirmar la próxima solicitud auténtica y su atribución en Google Ads después del procesamiento. La corrección técnica y los 178 tests no demuestran por sí solos una conversión real.
3. El aviso adicional de conversiones mejoradas no se ha eliminado ni se ha ampliado la transmisión de datos de clientes a Google. La medición estándar usa la etiqueta comprobada; cualquier nueva transmisión de email/teléfono necesita consentimiento y alcance explícitos.
4. No contar el probe `SC-DIAGNOSTIC-NOT-A-LEAD-20261102`. Si Google lo atribuye, retractar únicamente ese order ID después de procesarlo; no se afirma que esté retractado. No hay seguimiento periódico programado.

## Key Learnings:
1. El formulario duplicaba generate_lead en GA4 por emitirlo directamente y mediante el evento publicado de GTM; no se debe confundir con duplicación de conversiones Ads.
2. El ID de la solicitud guardada puede enlazar el registro interno de embudo con el evento de conversión sin añadir nombre o email al payload analítico.
3. Bloquear solo rutas pagead es insuficiente para aislar pruebas de Google; existe también /ccm/conversion/. No enviar más pruebas sintéticas en producción y distinguir cualquier ping técnico de un cliente real.
