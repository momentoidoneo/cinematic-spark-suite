# Incident recovery — 2026-09-08

## Cause (verified)
An erroneous request to legacy Lovable generated merge a1883b3bd3d4cfd860c7200b112f5a5fc7760620. Cloudflare Git builds automatically deployed version 0d499444-71e2-4b08-b07d-629180d8fc3d at 21:54 CEST, replacing the tested Madrid frontend. GitHub showed four changed files, not the one reported by the legacy service.

## Recovery performed with user authorization
- Rolled Cloudflare back to 01eb4345-79a7-4f74-887d-e37a65a49ee9 at 100% traffic.
- Disconnected Git from this worker's Builds settings; reload shows Connect. Future pushes no longer automatically publish this worker. No global GitHub integration or unrelated worker was altered.
- Reverted remote main without force/history rewriting using b9fbe8b8ff709c40a65f749e5d0c4e1dae5a173a, parent a1883b3, tree identical to pre-incident 4ab54dc.
- Preserved all main-checkout local changes. A separate .incident-repair worktree contains equivalent local revert d4a66be; shell push failed, GitHub connector completed remote revert.
- Live public UI once again shows Desde Madrid / Equipo con base en Madrid. Restored artifact was mobile-tested before incident: contact and quote HTTP 200, both owner email notifications received. No additional commercial requests submitted during recovery.
- Campaigns, budget, DNS, mail records, database rows and stored credentials were not changed during recovery.

## Remaining explicit limits
The extra eight accepted diagnostic event names in the running Supabase track-conversion-event function were reported deployed by the legacy service before the stop. Git reversal does NOT itself roll back that deployed function. Runtime rollback remains unverified/pending an approved direct management path; do NOT use Lovable to remove them. They must not be represented as lead conversions. The restored frontend does not persist the newly added diagnostics to that endpoint.

Local additional telemetry persistence/admin counters are newer than the restored artifact and NOT deployed. Existing multi-service backend edits predate this incident. Direct backend migration and legacy AI/mail gateway references in local source still need reconciliation with the actual deployed backend. Main is intentionally pre-incident source while the reviewed Madrid changes remain locally preserved; do not reconnect auto-build until changes are committed/reviewed in the correct source.

## Prevention
Follow the project AGENTS.md. Validate source SHA, deployed version, backend destination and trigger chain before any change. Never use a legacy platform merely because its connector is accessible.

## Controlled release completed — 2026-09-08 22:42 CEST
This status supersedes the earlier source/publication status above. Reviewed Madrid frontend, lead filtering, tests and guards are committed on remote main at `6aed0ec40f7cbfaaa1756997fd6a95b449457a26`. Clean build from the renamed `release-checkout` worktree passed 77 tests in 16 suites, generated 66 public routes, and was manually deployed to Cloudflare version `e01518b4-9899-4b91-9852-ac79d5dbd348` at 100% traffic. The production smoke script passed pages, sitemap, Admin, GTM, robots, redirects, 404 and intentional 410 checks. Chrome verified Madrid copy and the four-step multiselect cotizador after publication.

Git automatic builds remain disconnected. No Ads settings changed. Original dirty checkout and preexisting backend/pricing edits remain preserved and were not included in this release. Test runner in the nested worktree required an absolute setupFiles/root override; product source was not altered for that workaround. Evidence: `/tmp/sc-release-absolute-tests.log`, `/tmp/sc-clean-build.log`, `/tmp/sc-controlled-deploy.log`.

Backend limits above remain OPEN: direct management access is denied, actual deployed source/provider independence and the residual event allowlist are not verified. Await the user's identification/open session for the migrated backend; never fall back to Lovable. Contact/quote owner notification E2E evidence predates this final source-coherence release; no additional submissions were made during it.
