> Historical checkpoint. Backend access and pending corrections were subsequently resolved; see [verified follow-up](backend-corrections-verified-2026-09-09.md). Lovable prohibitions revoked by owner on 2026-09-09.

# Backend follow-up — 2026-09-09

Scope: cinematic-spark-suite / silviocosta.net only. No Lovable operations or Google Ads mutations.

## Verified today
- Direct management read for Supabase edpqywwtgoiktotxrqrz / track-conversion-event remains permission denied. No bypass attempted.
- Read-only OPTIONS for generate-quote returned HTTP 200 and X-Quote-Catalog-Version: 2026-07-30. This is an advertised version, not independent verification of running source. Pending local multiservice code advertises 2026-08-04-multiservice.
- Public site smoke passed pages, sitemap, admin shells, GTM presence, robots, redirects and intentional error statuses. These checks do not prove lead receipt or Ads attribution.
- Reviewed local packs/multiservice tests. Full suite: 84 passing tests across 16 suites.

## Local correction, NOT deployed
The unit-price matcher previously used the largest number in the entire scope. Regression cases reproduced overpricing for 5 people with a 48-hour deadline, 3 reels of 90 seconds, and 10 photos for campaign 2026. Quantity matching now requires an adjacent billing-unit name. Three new regression cases pass alongside existing pack/multiservice cases. Original pending backend changes were preserved.

Files: supabase/functions/generate-quote/pricing.ts; src/test/quotePricingMatcher.test.ts.
Evidence: /tmp/sc-sep9-tests.log; /tmp/sc-sep9-pricing-final.log; /tmp/sc-sep9-build.log.

## Still blocked
Need the user's identification or authenticated session for the actual postmigration backend administration. Without that, do not publish pending backend edits, claim packs corrected in production, or claim the residual legacy diagnostic allowlist is reconciled. Detailed persisted abandonment/error telemetry and final E2E conversion/receipt verification remain open. No new commercial test requests were submitted today. Git automatic deployments remain intentionally disconnected.

## Admin follow-up
Authenticated existing Admin session confirmed silvio@silviocosta.net. Product-photo plan had no included service, although its description specified product photography by type/volume. Saved one scope-consistent included-service line, preserved 3 EUR/photo, and verified persistence after reload. No landing selection, price or added deliverable changed.

Live Admin API Keys still directed operators to the legacy platform. Reviewed frontend correction removes those directions, makes credential presence distinct from actual usage, gives unknown status on failed/missing lookup, and changes misleading Configure/Update controls to Copy name. Migration page now displays a read-only warning rather than obsolete DNS steps; existing checklist records are untouched. Three-file Git commit c6a5f9cc50a0321da40bbe4650cc7f65623a5287, clean release tests79/17suites and build66routes passed. Local source mirrored into original checkout without overwriting pending backend/pricing changes.

Business Admin access is functional. Its secrets page reads status and copies names; it is not a backend-function deployment interface. Direct deployment permission for the running functions remains unresolved. Do not assert that UI text cleanup migrates the actual AI/email services or resolves conversion delivery.
