# silviocosta.net — independent Supabase migration checkpoint

**Status: data staging verified; NOT cut over; NOT yet independent in production.**

Checkpoint: 2026-11-02, Europe/Madrid. Scope: cinematic-spark-suite only.

## Authorization and safeguards

- User confirmed the one-time Lovable payment was completed. Billing showed 50 credits; no duplicate purchase made.
- New independent Supabase project in momentoidoneo approved, including the quoted additional USD 10/month.
- Preserve data and backups. Do not pause or modify Google Ads. No automatic monitoring was created.
- Do not reconnect Git automatic deployments (disconnected 2026-09-08).
- Google Ads remains outside this migration's write scope.

## Verified systems

| Component | Verified identifier / state |
| --- | --- |
| Site | https://silviocosta.net |
| Repository | momentoidoneo/cinematic-spark-suite |
| Live frontend | Cloudflare worker silviocosta-net |
| Cloudflare account | 0e75bd5bb4b7456e4338216af1657482 |
| Live worker version before changes | fcab550c-6443-43d4-8297-a64e8962e84e (100%) |
| Live deployment | 0490e99d-b0e8-4724-9cac-2c03a0a524da |
| Source Lovable project | fe5fb065-a82f-4e14-9e41-abf41661d2fd |
| Source Supabase | edpqywwtgoiktotxrqrz (Ireland) |
| Independent destination | sffgaplkqmmnikqhhftx / silviocosta-net |
| Destination organization | momentoidoneo / owfsetbfxrcwpikkwnbg |
| Destination region | eu-central-1 (Frankfurt) |
| Registrar / DNS | IONOS SE / Cloudflare |

The frontend still points at the source. No frontend, DNS, production code, campaign, budget, or bidding changes have been deployed during this checkpoint.

## Recovery verified against the source

After the top-up/wake, DNS, Auth health, public settings, and function endpoints responded.

Two expressly marked technical tests, submitted directly to backend endpoints (not through an ad click):

- Contact `SC-ADS-20261102-01`: HTTP 200, persisted ID `00f4502d-e781-4f48-b853-ee32290deaed`, created 12:04:29 UTC.
- Quote `SC-ADS-20261102-02`: HTTP 200, persisted ID `2c2ac93a-9ecc-4564-9b74-3341c28f157a`, created 12:04:39 UTC. Response source `ai`, estimate EUR 160–250.
- Both notification messages located in the verified owner Gmail account at 13:04 local. Both were already labelled Trash when inspected; no move/delete/restore action was taken.
- These are technical fixtures, not commercial leads or sales. Direct HTTP tests do not emit the frontend Google Ads conversion event. This does not prove advertising attribution or new-backend E2E readiness.

## Backups retained (private, excluded from Git)

Directory: `/Users/silviocosta_m5/Documents/Silvio Projects/cinematic-spark-suite/.migration-private/2026-11-02`

Permissions: parent directory 0700; sensitive files 0600. Never publish this directory: database exports include customer records and authentication material.

- Source export: `cinematic-spark-suite_261102.backup`, 7,370,216 bytes.
  SHA256: `dc729f412fb7b7219f92db217dca1826421297ebe9b27974471cc00f9d87c076`.
- Fully extracted SQL: `database-full.sql`, 164,725,904 bytes.
- Frontend rollback: `cloudflare-live-dist-rollback.tgz`.
  SHA256: `977b06bee79198a3e4f6c092fc2f972c51986d5b5e9f22f9901d0cf5e24a06d1`.
- Live bundle `index-BGbkShSD.js` matched the retained pack-alignment artifact.
  SHA256: `92589f4bd481930526dd8f9dcd4a2dea25bd91aa4fbcbad768fc9e57f8f7648b`.
- Portfolio originals: `storage/portfolio/`, 157 files, 276,907,094 bytes.
- Signed download URL was temporary and removed after download. Temporary local copy of the target Storage API credential was removed after verified transfers; the provider key itself was not revoked or changed.

Source export used PostgreSQL archive format 1.16 with zstd. Existing pg_restore was incompatible; a local official PostgreSQL 18.6 pg_restore was built with zstd solely for offline extraction. No database server installed or restarted.

## Destination database staging

- Empty target preflight checked before import.
- Imported 47 public tables, 3,886 public rows, and 524 auth rows across 26 auth tables (provider schema_migrations excluded).
- Schema includes enum, indexes, constraints, public functions/triggers, auth-user trigger, and the relevant realtime publication membership.
- RLS enabled on all 47 public tables; 139 public policies copied.
- `cost_events` schema/functions retained, with public execution revoked. Legacy inactive cron not activated; no scheduled business actions initiated by import.
- Source-only Lovable platform roles/ACLs omitted. Initial missing-role error rolled the entire schema transaction back; verified no partial tables before successful retry.
- Data imported in 56 recorded chunks, with transaction-local trigger suppression only. Normal trigger behavior restored at transaction end.
- Auth refresh-token sequence reset to 832 (source maximum).
- Authoritative same-query source/destination comparison: **73 tables checked, zero mismatches** in `live-data-verification.json`.
- The earlier `data-verification.json` compared noncanonical COPY text to PostgreSQL-rendered values, producing false differences for booleans/network types. Do not treat those as data loss; use the live comparison instead.
- Historical cron/realtime/provider metadata is retained in the full source archive, not injected into active target internals. Source migration-history rows have not yet been reconciled/imported.

**The source remained writable and the recovery tests occurred AFTER the staging comparison. A final delta sync is mandatory before cutover. Do not treat the staged copy as current production.**

## Storage staging

- Source buckets portfolio and social-media-assets reproduced with source visibility/settings (both public; latter empty).
- 157 portfolio files copied. All source/destination content hashes match (`target-storage-verification.json`).
- API-created object IDs can differ; bucket names, paths, MIME metadata and file bytes preserved.
- Seven source storage.objects policies copied.
- Rate limiting was handled with serial retries and read-before-upload verification. No blind overwrite.
- Private database export was NOT uploaded to a public destination bucket.
- Stored content URLs still reference the source host: scoped replacement is pending.

## Local-only correction and tests

Isolated checkout:
`/Users/silviocosta_m5/Documents/Silvio Projects/cinematic-spark-suite/supabase-migration`

Branch: `codex/supabase-independent-20261102`.
Base: `bd055fe2bdba55381f1c59564f430d22f9173561` plus the exact existing pack-alignment patch.
Existing root and other worktrees were preserved. No commit/push/frontend deployment. Target-only `submit-contact` v1 deployment is recorded below.

- `src/lib/leadSubmission.ts`: validate successful persistence response; explicit diagnostic-test detection.
- `src/components/CTASection.tsx`: require saved contact ID before success/conversion; exclude marked technical tests.
- `src/components/SmartQuoter.tsx`: require valid quote plus saved request ID; exclude marked technical tests.
- `supabase/functions/generate-quote/index.ts`: return 503 if persistence failed, before follow-on drafts/notifications/success response.
- Regression tests cover incomplete/null success responses, saved-ID propagation, technical-test exclusion and quote lead gate.
- Vitest: 19 files / 109 tests passed (re-run 13:14 local). TypeScript checks for tsconfig.app.json and tsconfig.node.json passed; git diff --check passed. These are local tests, not proof of target functions or advertising attribution.

## Remaining blockers / work, in safe order

1. User selected an OpenClaw agent on silvio-server for AI, NOT direct Gemini. User approved direct Gmail and authorizing the independent backend in Google. Resend is not selected. Do not accept new costs.
2. Source AI and email currently depend on Lovable gateways. Source secrets are write-only: cannot be exported. Do not create a secret-exfiltration function. Reconnect authorized independent providers through their secure configuration surfaces.
3. Inventory and securely configure any auxiliary providers needed by admin functions (Search Console, invoicing, image/video services). Do not reuse sibling-project keys.
4. Implement provider-independent functions, visible/retriable notification failures, and test against the destination. Target `submit-contact` v1 deployed and real Gmail notification verified; quote and other functions remain pending.
5. Configure target auth URL/redirects and required auth provider behavior. Retained auth records alone do not establish functional admin login.
6. Resolve or explicitly assess security advisors (public security-definer function exposure and leaked-password protection). Do not blindly revoke has_role: RLS and admin service-role calls depend on it.
7. Reconcile migration history and source-host references after verified storage copy.
8. Recheck live source/worker/trigger chain; final consistent delta sync including contacts, quotes, client/ERP rows and events created since the backup. Design handoff so requests in flight cannot be lost; no Ads pause.
9. Test new backend form, true AI response, owner notification delivery, admin, consent and conversion event safeguards before switching production. Technical tests must never count as real leads.
10. Manual reviewed Cloudflare cutover only after all gates pass. Keep original backend and rollback artifact available.
11. Post-cutover production E2E, reconcile late-arriving source writes, verify real lead metrics without inventing Ads attribution. Do not declare migration complete until this passes.

## OpenClaw preference and read-only preflight (13:20 local, approximate)

- User explicitly chose an OpenClaw agent on silvio-server for the website AI and requested an explanation before selecting the email delivery method. Gemini direct was not approved.
- Existing configured SSH alias `silvio-server` works over Tailscale as kevin. Direct LAN BatchMode authentication failed; no password/key changed, and no credential was copied. Use the existing alias rather than asking for new credentials.
- Verified host name silvio-server. CLI reports OpenClaw 2026.10.9; gateway service is active/running. The service description still labels an older version; do not infer actual gateway runtime version solely from that label.
- Scoped agent inventory: 25 configured agents, none explicitly matching silviocosta / cinematic-spark / Silvio Costa. No sibling agent workspace, prompt or conversation was read or changed. Do not silently reuse a default or unrelated agent.
- Gateway is loopback-only on port 18789, token auth, OpenAI-compatible chat endpoint disabled. No settings changed and no inference request sent.
- Proposed integration: project-specific restricted agent and a narrow authenticated quote bridge; preserve gateway private access. Never expose the shared operator token to the public site or put a general-purpose agent behind an unauthenticated public endpoint.
- Backend should pass only necessary project/service/pricing facts, not customer email/phone/tax identifiers, to AI; save leads and send notifications independently of AI availability. Catalog fallback must be identified honestly as a fallback.
- Direct Gmail can use the narrow gmail.send OAuth scope rather than granting mailbox read/delete. Resend requires its own sending-domain verification and would not replace the existing Google inbox or root-domain inbound MX. At this preflight point no choice or email configuration had been performed; see the completed Gmail setup update below.

## Email decision update

User selected direct Gmail on 2026-11-02 and completed the Google Cloud identity challenge. See `gmail-direct-setup-2026-11-02.md` for the current setup gates. OAuth is now authorized and installed in the target. Target-only `submit-contact` v1 saved test `SC-ADS-20261102-03` (ID `a05422be-1238-4d6e-b0d3-b8bf43c7a7c3`) and delivered its email to the verified owner Inbox at 14:02 local. The browser verified receipt without granting the backend Gmail read access. Local transient OAuth credential files were removed after verification. This does not change the live backend and does not finish the broader migration. Persistent delivery state/provider message ID, quote integration and OpenClaw remain pending.

## Session checkpoint — Gmail authorization and first target delivery

### Goal
Complete direct Gmail authorization for the independent backend without changing Ads or prematurely switching production.

### Instructions
Use the exact owner account, Gmail send-only plus identity, OpenClaw for AI. Preserve the source and all backup artifacts.

### Discoveries
- The local passkey prompt did not invalidate OAuth: signed identity and exact scopes were verified.
- Supabase secrets persisted, and a target function successfully refreshed authorization and sent to the owner Inbox.
- Existing contact notification handling still lacks a durable delivery state and retained Gmail message ID; fix before cutover.

### Accomplished
- Internal dedicated Google OAuth client authorized by the user and installed in the target only.
- Target contact endpoint deployed, one marked contact persisted, and Gmail Inbox receipt independently verified.
- No Ads writes, production cutover or frontend conversion events.

### Next Steps
- Implement persistent notification failure visibility and controlled recovery without blind resend of uncertain sends.
- Configure dedicated restricted OpenClaw integration; finish target functions, authentication, final data delta and production acceptance gates.

### Relevant Files
- `docs/gmail-direct-setup-2026-11-02.md`: current OAuth and delivery evidence.
- `scripts/authorize-gmail.mjs`: one-time narrow authorization helper.
- `supabase/functions/_shared/gmailDirect.ts`: server-only Gmail transport.
- `supabase/functions/submit-contact/index.ts`: deployed only to target, saves contact before notification.
- `supabase/functions/generate-quote/index.ts`: local preparation; AI provider migration pending.

## Continuación 14:30 local — destino solamente

- Aplicada migración `independent_backend_delivery`: cola durable de avisos (trigger atómico con contacto/cotización), estados pending/sending/sent/failed/unknown e identificador Gmail; cola de trabajos IA restringida al backend; límites por email/global. Sin permiso anónimo de lectura de colas ni acceso al token del trabajador.
- Desplegadas en destino: submit-contact v2; generate-quote, owner-notification-status, ai-quote-worker, conversion-summary, track-page-view, track-conversion-event y list-secrets-status v1. No corte de frontend.
- Decisión: trabajador de IA que consulta la cola por HTTPS desde silvio-server; no abrir puertos ni exponer token del gateway. Endpoint restringido por credencial de alcance exclusivo, solo hash en destino.
- Ruta de servidor nueva y exclusiva: `/home/kevin/apps/silviocosta-net/openclaw-quote-worker`, con marcador `.codex-project`. Token 0600 en servidor; nunca en frontend/repositorio.
- UI local de admin preparada para consultar estado y reintentar solamente avisos pending/failed. Envíos ambiguos no se repiten automáticamente.
- Deno check de cuatro funciones pasa; 125 pruebas previas pasan; tsc app/node pasan. Pruebas nuevas y verificación real de cola/IA pendientes.
- Descubrimiento OpenClaw: wrapper del servidor fuerza perfiles separados a 2026.8.1; runtime principal real 2026.10.9. No se modificó el wrapper ni se reinició el gateway. Headless `agent exec` con config aislada no consigue usar la autorización existente, aunque `models status` la marca válida. No usar otra cuenta ni fingir IA: el cotizador devuelve respaldo de catálogo si trabajador no está disponible.

### Verificación 14:50 local
- 6 pruebas Deno adicionales pasan: doble envío concurrente, timeout ambiguo, recuperación OAuth, fallo al persistir resultado, escape HTML y etiqueta de respaldo.
- Prueba real SC-ADS-20261102-04: contacto `ae893158-33f1-483f-96c0-3f5ec53c9de3`, HTTP200, owner_notifications state=sent, attempts=1, provider_message_id presente, last_error=null. Recibidos verificado en Gmail 14:42. No evento Ads.
- APIs administrativas y las cuatro tablas nuevas niegan acceso anónimo (HTTP401).
- Copia incremental intermedia: seis registros nuevos/actualizados en commercial_clients, commercial_quotes, contact_messages, erp_settings, page_views y quote_requests. Conservados los contactos de prueba exclusivos del destino. Triggers desactivados solo en la transacción para evitar avisos históricos duplicados. Repetir comparación final antes del corte.
- Autenticación destino: Site URL configurado a https://silviocosta.net; registro público deshabilitado como el origen, login por email conservado y protección contra contraseñas filtradas habilitada. Sin cambio de contraseña.
- Preview privado local http://127.0.0.1:5187/admin preparado con destino; usuario debe comprobar su login.
- Agente OpenClaw dedicado silviocosta-net registrado con workspace/agentDir exclusivos; herramientas denegadas y perfil OpenAI del propietario seleccionado. No reinicio realizado. Gateway no admite la ejecución y señala actualización pendiente de plugin; solicitado permiso para reparación/reinicio compartido. No usar doctor --fix antes de la respuesta del usuario.

### Continuación autorizada — 15:16 local
- El usuario respondió «Sigue con todo lo que falta» tras explicar la reparación/reinicio compartido; se anunció expresamente la continuación de ese paso.
- Copia recuperable del JSON, unidad de servicio y snapshot SQLite consistente en `/home/kevin/.openclaw/backups/silviocosta-pre-repair-20261102-141550` (permisos privados). No exportada fuera del servidor.
- Reinicio único del gateway ejecutado. Proceso activo, pero el arranque todavía estaba preparando su estado y no escuchaba en loopback al primer test; no confundir `active` con servicio listo. No se ha modificado la unidad personalizada, credenciales, puertos o agentes de otros proyectos.
- Iniciada reparación oficial no interactiva, sin `--force` ni mantenimiento global de sesiones, con `OPENCLAW_SERVICE_REPAIR_POLICY=external` para conservar la definición/activación del servicio. Resultado pendiente.
- Admin de preview sigue en login; no se introdujo ni cambió ninguna contraseña. Producción y Ads permanecen sin cambios.

### Funciones auxiliares y control de acceso — 15:24 local
- Core destino actualizado a submit-contact v3, generate-quote v2, owner-notification-status v2. Última incluye CORS para el preview autorizado; autenticación/rol admin siguen siendo obligatorios.
- Desplegadas 11 auxiliares en destino: weoinvoice-bridge, fetch-social-analytics, indexnow-key, runway-video, runware-image, publish-social, publish-scheduled-posts, optimize-images, validate-vies, indexnow, send-newsletter. Desplegado no significa proveedor configurado o envío/publicación verificado. No se ejecutaron publicaciones, newsletter, facturas ni generación de pago.
- Se detectó que nueve funciones locales privilegiadas no comprobaban admin dentro del handler. Añadido requireAdmin antes de cualquier operación (también en generadores todavía no desplegados). La fuente Lovable no se modifica.
- Corregidos cinco errores de tipos preexistentes en optimize-images, publish-social y weoinvoice-bridge. Deno check de las 11 auxiliares pasa.
- Inventario destino: cero conexiones sociales, newsletters, suscriptores y contenido social. No se han inventado ni conectado proveedores para llenar estos módulos vacíos.
- La reparación oficial OpenClaw necesitaba el gateway detenido; se ejecutó con reinicio garantizado al terminar. No se forzó la propiedad SQLite. El primer ciclo había tardado 93 segundos en escuchar; se debe validar disponibilidad real, no únicamente systemd.

### Referencias de medios — 15:27 local
- Reescritas solamente 144 URLs de Storage del portfolio en cinco columnas públicas verificadas: blog_posts.cover_image (6), portfolio_categories.cover_image (6), portfolio_images.image_url (93), portfolio_subcategories.cover_image (34) y seo_metadata.og_image (5). Todas apuntaban al bucket portfolio previamente copiado y verificado.
- Comprobación posterior: cero referencias antiguas en esas columnas y los 144 destinos nuevos. Sin alterar textos de clientes ni eventos históricos. Timestamps preservados mediante desactivación de triggers solo dentro de la transacción.
- Repetir esta sustitución idempotente tras el delta final: los registros fuente siguen conteniendo URLs antiguas. Para comparación de hash, normalizar únicamente estos prefijos; no presentar diferencias intencionales de URLs como pérdida de datos.
- Verificadas por HTTP las diez auxiliares administrativas publicadas: todas responden 401 sin autorización. indexnow-key es un endpoint público de lectura por diseño.

### OpenClaw y cotización real — 15:34 local
- Reparación oficial registró `Deferred state migration completed for plugin codex`. El comando global no terminó limpiamente (exit137); no declarar que todos sus diagnósticos estén resueltos. Se recuperó el gateway tras el límite de arranques y se esperó su arranque completo: healthz HTTP200 y agente dedicado respondió correctamente.
- Verificado contra backup: configuración gateway, unidad del servicio y configuración de todos los demás agentes sin cambios. Solo agente silviocosta-net actualizado, sin skills ni herramientas, sin modelos alternativos y con autorización ordenada únicamente openai:momentoidoneo@gmail.com.
- Plantillas automáticas del nuevo workspace guardadas y sustituidas por instrucciones mínimas del cotizador, sin tareas autónomas. No se modificaron otros workspaces.
- Instalado y activo servicio de usuario silviocosta-quote-worker, cola HTTPS de alcance exclusivo, heartbeat y sesión distinta por trabajo. No token de gateway en Supabase, no puertos nuevos. El trabajador rechaza resultados sin recibo de modelo esperado, reroute o herramientas.
- SC-ADS-20261102-05 respondió HTTP200 en 22,92s, source=ai; solicitud e851f9b3-b6ca-49a4-8fba-a861e4082fdb, un borrador comercial, aviso Gmail state=sent/attempts=1/receipt presente. Job cdd8fa9b-2a23-4611-ae4f-b60a19e0a5fd completo y prompt borrado de la cola. Recepción Inbox pendiente de comprobar en navegador.
- La prueba detectó un texto IA con 150–250 EUR mientras el rango numérico reconciliado era 150–240. Corregida presentación: precios solo en campos numéricos; textos con moneda se sustituyen por descripción segura y enlace WhatsApp determinista. Cuatro nuevas pruebas cubren EUR, euros, símbolo y cantidades no monetarias. Generate-quote actualizado a v3.
- 125 pruebas de web y seis Deno de notificaciones vuelven a pasar. Se necesitan `--node-modules-dir=auto --no-lock` para la resolución Deno actual. No cutover ni Ads.

## Session checkpoint — 15:52 local, independent backend acceptance

### Goal
Finish the Lovable-independent migration without losing data or changing Ads. Current production still points to the source; do not declare the entire migration finished.

### Instructions
OpenClaw on silvio-server for AI, direct Gmail for owner notifications, exact silviocosta.net project only. No new provider purchases or reuse of sibling credentials. No Engram session writes: host runtime registration remains unavailable.

### Discoveries
- Official OpenClaw repair migrated the Codex plugin, but its broad doctor run exited137 before the full report completed. Gateway startup takes more than three minutes including state admission; early RPC failures were not evidence that its listener would never become ready. Recovered start-limit, then verified healthz HTTP200 and two actual quote jobs. Do not retry the broad repair unnecessarily.
- Only the new agent config/workspace changed; gateway config, service definition and other agent configs compared equal to backup. Agent has zero tool schemas and an explicit single owner auth profile, no fallback models/skills.
- Old initial HTML loaded production tags even on localhost. During the controlled contact test, observed only page_view/scroll plus tag loads, no lead/conversion request. Two GA4 IDs appeared (G-50T1T9EJSD and G-WV6RE96PHY); their intended relationship still needs a read-only GTM/GA review, not an assumed duplication fix.
- Added production-host gating in initial HTML and TrackingScripts. After reload, CDP observed 164 requests, zero external measurement requests, no dropped/truncated events. Production host behavior is retained. No more test submissions are needed merely to recheck this gate.
- Source migration history timestamps often differ by one or two seconds from repository filenames. Copied all 36 source history records, without rerunning their SQL. Target now has37 including the new independent delivery migration. Renamed that new local migration to its actual applied version20261102132954. Do not blindly run `db push` over the remaining historical filename mismatch.

### Accomplished
- Target has27 active functions (16 core/SEO plus11 auxiliary). Admin-only auxiliary HTTP checks all401 anonymously. Third-party publishing/invoicing/newsletter/generation were not executed.
- 144 public Storage references rewritten to independently verified target copies. Browser rendered portfolio images from the new host.
- OpenClaw gateway healthy; dedicated quote-worker installed/enabled, idle polling5s, heartbeat10s. Private token stays server-side, only its hash in target. Project service may be restarted independently; never restart shared gateway without a fresh need.
- SC-ADS-20261102-05 API quote: HTTP200,22.92s, trueAI, one persisted request/commercial draft, one Gmail notification, actual Inbox receipt verified15:34.
- SC-ADS-20261102-06 full four-step browser quote: request62b8a6b8-72e8-43fa-bbd2-05288c07bda1, ai_provider=openclaw-silvio-server, result source=ai, final numeric range150–240EUR and coherent prose. Gmail sent once and independently received15:43. No WhatsApp message was sent.
- SC-ADS-20261102-07 full browser contact: idf456b581-baa5-4b7a-bb46-2d3edbc54ed1, success displayed only after persistence. Gmail sent once and independently received15:46.
- Fixed AI monetary prose contradicting the final reconciled range. Four regression tests and an actual browser quote validate the correction.
- Latest:137 Vitest tests /22files pass; six durable Gmail Deno tests pass; app/node TypeScript checks pass;11auxiliary functions Deno check pass; build/prerender passes66public routes,33private shells,12legacy redirects. No commit/push/frontend deployment.
- Evidence: `/tmp/silviocosta-cotizador-openclaw-verificado-20261102.png`, `/tmp/silviocosta-formulario-destino-verificado-20261102.png`, `/tmp/silviocosta-gmail-avisos-e2e-20261102.png`, `/tmp/silviocosta-portfolio-backend-independiente-20261102.png`.

### Next Steps
1. User must sign into `http://127.0.0.1:5187/admin` with existing owner credentials. Preview still on login; no password changed or guessed. Async request pending. Verify actual admin authorization, contacts, quotes, delivery-state UI and absence of test leads in real metrics after login.
2. Nine AI admin functions remain unported/undeployed: generate-covers, generate-gallery, generate-thumbnail, generate-social-content, generate-social-from-portfolio, generate-seo-meta, repurpose-content, prospect-instagram, track-competitor. Quote queue accepts quote schema only, not general text/images. Do not relabel them migrated. Independent provider credentials for optional Runware/Runway/Firecrawl/invoicing/newsletters also need verification if those modules are to be enabled; there are no configured social connections/newsletters/subscribers/content in copied data. No new costs assumed.
3. Review two GA4 destinations and verify configured primary/secondary labels via authorized accounts, without altering Ads or claiming end-to-end advertising attribution from technical tests.
4. Fresh final data delta with source writes still live. Preserve destination-only test/admin state, avoid replaying Gmail triggers; normalize/reapply only the five intentional media-prefix changes. Reconcile late source writes after cutover. Do not overwrite new target auth sessions with source session records.
5. Recheck actual Cloudflare version, git SHA/worktree, account and disconnected deploy triggers. Manual cutover only after acceptance gates, rollback artifact retained. Then production acceptance without fake Ads conversions. Update project marker only after actual cutover.

### Relevant Files
- `server/openclaw-quote-worker/worker.mjs`: narrow outbound-only worker with receipt verification and unique job sessions.
- `supabase/functions/ai-quote-worker/index.ts`: v2 queue actions/heartbeat, scoped token.
- `supabase/functions/generate-quote/presentation.ts`: prevent contradictory AI price prose.
- `src/lib/trackingHost.ts`, `src/components/TrackingScripts.tsx`, `index.html`: no external tags on diagnostic hosts.
- `scripts/migrate-media-references.sql`: idempotent target-only URL mapping after data delta.
- `supabase/migrations/20261102132954_independent_backend_delivery.sql`: actual applied migration version.

### Continuación 16:50 local — textos administrativos e imagen OAuth
- Usuario confirmó expresamente OpenClaw con OpenAI OAuth también para imágenes; no volver a preguntar por otro proveedor. La documentación instalada 2026.10.9 admite `infer image generate/edit --agent` con OAuth y gpt-image-2. No usar defaults de otro agente, claves API o proveedores hermanos.
- Prueba privada nativa `infer image generate --agent silviocosta-net --model openai/gpt-image-2`: exit0, PNG real 1.760.116 bytes, 1536×1024. Registro de autenticación confirma mode=oauth/transport=codex-responses; sin OPENAI_API_KEY ni override de proveedor. La dimensión efectiva difiere de 1024×1024 solicitado; no prometer tamaño exacto sin validar/normalizar. Imagen no publicada ni añadida al portfolio.
- Migración admin_ai_lanes aplicada versión20261102154158: tipo quote/admin_text con RPCs y consumidores separados para no poner redacción administrativa delante del cotizador. Token mantiene alcance exclusivo, autorización de handlers admin obligatoria.
- Desplegadas cinco funciones de texto sin Lovable: generate-seo-meta, repurpose-content, generate-social-content (imagen en integración), prospect-instagram y track-competitor (Firecrawl separado todavía sin confirmar). ai-quote-worker v3.
- Worker del proyecto actualizado/reiniciado, gateway compartido sin cambios. Workspace exclusivo admite texto administrativo además de presupuestos, sigue sin herramientas/acciones externas.
- 152 Vitest/23archivos y Deno de siete funciones pasan. E2E de admin y migración de imágenes aún pendientes. No frontend público ni Ads modificados.

### Checkpoint 17:09 local — imágenes independientes verificadas
- El usuario confirmó OpenClaw/OpenAI OAuth para imágenes. Implementadas y desplegadas las cuatro funciones de imagen restantes, más social mixto texto/imagen, estado de operación administrativa y API de trabajador v4. Total37 funciones en destino. list-secrets-status v2 ya no solicita credencial de Lovable.
- Cola separada para image, carga firmada limitada al fichero del trabajo, bucket privado ai-generated-private, validación PNG/tamaño y credencial exclusiva del trabajador. Sin clave de Supabase de servicio ni de gateway en el trabajador. Modelo fijo gpt-image-2, agente exclusivo silviocosta-net, perfil OAuth propietario, rechazo de rutas API explícitas. No puerto nuevo ni API de pago configurada.
- Operaciones administrativas largas: respuesta202 inmediata, progreso durable y sondeo autenticado; no repetir generación ante timeout ambiguo. Lotes frontend divididos en una imagen por operación; recuperación de última operación desde el panel. No se publicaron imágenes de prueba ni se sustituyeron portadas reales.
- Primera prueba de cola image dd6c26e8-7465-4126-84a2-ee4c3dccbf93 falló antes de obtener resultado. Diagnóstico reproducible de solo lectura: PrivateTmp=true del servicio impide a la CLI infer comprobar la propiedad del gateway y devuelve mensaje engañoso de namespace PID distinto. Con PrivateTmp=false y NoNewPrivileges=true la lectura de proveedores funciona; se conservó NoNewPrivileges, permisos0700/0600 y UMask0077. Solo unidad del trabajador de este proyecto modificada, gateway compartido intacto. No se forzó propiedad SQLite ni se usó doctor.
- Prueba de cola e0a2e8ed-c8ab-4375-9965-bb3c2b1f7f8b completa en77s: PNG1888574bytes, proveedor openclaw-openai-oauth, almacenado privado. MD5 local96546fa89faa4feac6737cd40bd1f3c3 coincide exactamente con ETag de Storage. Prompt borrado de la cola al completar. Esto prueba servidor/cola/almacenamiento, no todavía la UI autenticada completa ni la edición de referencia.
- Texto administrativo40505f5f-24e7-4385-8319-5ce9a7aadf6c completado con JSON SEO real. Diez nuevos endpoints administrativos niegan acceso anónimo HTTP401.167tests/25archivos y Deno7funciones pasan; build66rutas públicas/33privadas/12redirects pasa. Repetir build tras últimos textos de ApiKeys.
- Mig. admin_ai_lanes versión20261102154158; admin_image_delivery20261102155218. Historial/local de estas migraciones alineado.
- Cloudflare read-only: cuenta momentoidoneo@gmail.com /0e75bd5bb4b7456e4338216af1657482, versión pública todavíafcab550c-6443-43d4-8297-a64e8962e84e. HEADlocalbd055fe2bdba55381f1c59564f430d22f9173561, sin push/deploy. Verificar disparadores Git de nuevo antes del corte.
- Lovable connector falló internamente en consulta y estado; UI original verificada como silvio@silviocosta.net en proyecto correcto. SQL editor funciona en solo lectura:17:07local contactos24, presupuestos13,portfolio_images125,page_views3162. Los recuentos0de la lista inicial no eran datos reales; no inferir pérdidas de ese resumen UI.
- Admin nuevo aún sin sesión. Pestaña limpia2040869238 enhttp://127.0.0.1:5187/login preparada y marcada handoff; anterior2040869224 daba timeoutCDP. Se solicitó una vez más iniciar sesión, sin tocar contraseña. No declarar completada la migración ni cambiar frontend hasta verificar admin y delta final.

### Checkpoint 17:29 local — integridad completa y acceso admin
- Comparación de 47 tablas públicas con las cinco sustituciones de URL normalizadas: 41 huellas completas iguales; seis tablas revisadas registro a registro (3329 origen, 3338 destino). Cero registros de origen ausentes. Nueve extras de destino son pruebas controladas: 2 presupuestos comerciales, 3 contactos, 2 visitas, 2 solicitudes IA.
- Dos filas compartidas difieren solo por el cliente de pruebas propietario SC-ADS y los contadores/fechas de prueba. erp_settings.next_quote_number=96 origen /98 destino: conservar 98 para no duplicar numeración, no sobrescribir. Cliente verificado de pruebas en ambos lados, sin revelar contenido. No escrituras de sincronización requeridas en esta revisión.
- auth.users e identities: 1 fila cada una; huellas coinciden exactamente con origen, incluida contraseña cifrada y estado de confirmación. Storage portfolio: 157 objetos; origen no cambió desde 2026-05-11. Nunca imprimir hashes de contraseñas ni copiar sesiones antiguas sobre sesiones nuevas.
- Evidencia privada: source-hashes-1710.json, source-row-hashes-1713.csv, target-row-hashes-1713.json, row-delta-report-1713.json, source-field-hashes-1720.json, source-auth-storage-1724.json. Todo excluido de Git y permisos restrictivos. Fuente sigue recibiendo escrituras: repetir comparación inmediatamente antes/después del corte.
- Sesión real del propietario en preview admin confirmada: Dashboard muestra propietario correcto y rol Admin, 20 leads reales/7 solicitudes reales; métricas recientes de formularios/solicitudes permanecen 0 excluyendo pruebas. No contraseña cambiada ni suplantación técnica.
- Revisión pública GTM: contenedor GTM-NCPZ56K2 incluye G-50T1T9EJSD y AW-11017209497; los ajustes destino conservan los mismos. No aparece G-WV6RE96PHY en código de aplicación ni en ese contenedor descargado; la relación de destinos externos aún no está demostrada. No modificar etiquetas por suposición. No hay .github/workflows local.

### Checkpoint 17:39 local — puertas de publicación verificadas
- Admin real: sesión del propietario, mensajes y solicitudes históricos accesibles; pruebas 07 y 06 muestran aviso aceptado por Gmail y presupuesto multisevicio con proveedor OpenClaw. Abrir pruebas las marcó leídas, sin tocar contactos reales. Recuperación de operación IA devolvió el resultado guardado sin regenerarlo.
- Dos miniaturas reales desde UI administrativa: operaciones 51ce9cbc-2c06-4920-a485-1e191bcf8f06 y db290941-03aa-4002-b1fe-c611dd3e0e5e completas, una imagen cada una; visibles y cargadas en navegador, 1672×941. Solo assets de prueba, ninguna publicación social ni incorporación al portfolio. Evidencia /tmp/silviocosta-admin-openclaw-imagenes-20261102.png.
- Edición nativa de la imagen privada de prueba también exitosa: gpt-image-2, OAuth/codex-responses confirmado, PNG1764585bytes. No se subieron fotos de clientes ni se publicaron resultados.
- Corregida carrera en AuthContext: espera la consulta de rol antes de resolver sesión/proteger rutas y descarta respuestas antiguas tras salir. Tres regresiones pasan; recargar /admin/quote-requests conserva la ruta. Validación final170tests/26archivos, TypeScript app/node y build pasan. Build66públicas/33privadas/12redirects; cero referencias al backend origen o gateway Lovable en bundle/HTML.
- Fuente revisada de nuevo17:34:47huellas sin cambio respecto17:10 (normalizando tipos numéricos); las únicas seis diferencias destino siguen siendo las ya conciliadas de pruebas. Evidencia source-hashes-precut.json. Repetir tras el corte y mantener fuente como recuperación, sin borrar.
- Cloudflare UI autenticada cuenta momentoidoneo y worker exacto: Builds muestra Git repository / Connect; desconectado. Sin cron, queues ni email routing para este worker. No .github/workflows ni en checkout ni en origin/main consultado. CLI confirma misma cuenta y versión fcab550c-6443-43d4-8297-a64e8962e84e como última pública.
- origin/main avanzó de bd055fe a b6bcb4459bbaf77874e32b2b12d5a323009b3bb8 solo por tres archivos de alineación de packs; esos archivos locales coinciden exactamente. Integrar historia sin descartar cambios ni reconectar Git automático. Copia rollback SHA256977b06bee79198a3e4f6c092fc2f972c51986d5b5e9f22f9901d0cf5e24a06d1 verificada.
- Próximo paso: cambio manual de frontend, pruebas técnicas finales sin conversiones Ads, conciliación de escrituras tardías. No declarar atribución publicitaria individual demostrada.
