# cinematic-spark-suite — production safeguards

Scope: this project only; production https://silviocosta.net.

- User explicitly revoked Lovable prohibitions on 2026-09-09 and authorized pending backend corrections. Lovable connectors/agents/backend deployment are permitted for exact project fe5fb065-a82f-4e14-9e41-abf41661d2fd. Do not infer a need to publish or migrate the production frontend.
- Production frontend: Cloudflare worker `silviocosta-net`, account `0e75bd5bb4b7456e4338216af1657482` (momentoidoneo@gmail.com).
- Git automatic deployments were disconnected on 2026-09-08 to contain an incident. Do not reconnect without explicit approval and source/deployment reconciliation.
- Before a deployment verify live worker version, repository SHA, working-tree changes, target backend and full automatic trigger chain. Never infer these from an old marker or successful login.
- Recovery baseline (historical, verify current release before operating): Cloudflare version `01eb4345-79a7-4f74-887d-e37a65a49ee9` was restored: Madrid-first frontend, four-step quoter, filtered test-lead metrics. Working tree is newer than this deployed artifact; do not blindly rebuild and publish.
- Backend Supabase `edpqywwtgoiktotxrqrz` is accessible through the exact Lovable project (owner silvio@silviocosta.net); direct Supabase connector permission is separate. Verify deployed function behavior, not just repository source.
- Google Ads: customer 725-747-3398, login momentoidoneo@gmail.com. No campaign activation or budget changes without specific approval.
- Preserve existing uncommitted work. See docs/incident-recovery-2026-09-08.md before further changes.

## Current production after independent migration (2026-11-02; supersedes historical backend notes)

- Production backend is independent Supabase `sffgaplkqmmnikqhhftx` in organization `momentoidoneo`. Old `edpqywwtgoiktotxrqrz` / Lovable project is recovery-only; do not use it for new deployments.
- Current code is in `/Users/silviocosta_m5/Documents/Silvio Projects/cinematic-spark-suite/supabase-migration`, branch `codex/supabase-independent-20261102`. The original root working copy was preserved; do not publish its older `.env` or overwrite its uncommitted work. Reconcile with the verified release first.
- Verified Cloudflare release `54f639dc-2a68-4121-9369-a6c8f71b29ad`, app commit `44413b128a4c4d9850586cc20b7995cb6e57c0f1`. Git builds remain disconnected. Verify live state again before a future release.
- AI text and images use dedicated OpenClaw agent `silviocosta-net` on silvio-server with OpenAI OAuth. Gmail direct sends owner notices. Never add API-key fallbacks or reuse sibling credentials.
- Source backup and rollback release remain intact. Reconcile late source writes and destination-only leads before rollback. Never replay historical notifications or overwrite the advanced quote counter.
- Read the migration report in the release worktree for evidence and limits. No Ads changes or recurring monitor were authorized by this migration.

## Measurement correction release (2026-11-02; newer than migration cutover)
- Current verified frontend release: `5cd06a71-c33d-416d-97fd-f4f615fbe60e`, app commit `b4cd1b2`. Rollback to the independent-backend cutover remains `54f639dc-2a68-4121-9369-a6c8f71b29ad`.
- Google Ads changes were explicitly authorized for this correction: two exact negatives and four campaign sitelinks; campaign 24091355671 remains enabled, 9.70 EUR/day, Maximize Clicks, max CPC 2.50 EUR. No ongoing monitoring authorized.
- Read docs/google-ads-corrections-2026-11-02.md for verification limits and the one identified diagnostic ping that must not be counted as a real lead. Do not claim real Ads attribution or enhanced-conversion warnings resolved from local tests.

## Full public SEO release (2026-11-03; newer than measurement correction)
- Current verified frontend: Cloudflare `a3f176fe-53e1-4a3a-a6a1-b206b671fef3`, app commit `b15a098`. Previous rollback: `5cd06a71-c33d-416d-97fd-f4f615fbe60e`. Verify live state before the next deployment.
- Build now renders real public React components with an explicit anonymous public-content snapshot; `.prerender` is build-only and must never be deployed. `npm run build` includes 66-route HTML validation. Never seed sessions, leads, secrets or admin data into public HTML.
- Public content edited later in Admin still needs a manual rebuild/deploy for static HTML to match the live client data. Git builds remain disconnected; do not reconnect them implicitly.
- Owner-confirmed commercial terms: property photography 24–48 hours; Matterport includes 12 months hosting. Preserve consistency across visible copy, FAQs and AI files.
- Four blog articles, eight product image alt texts and the cases-index SEO description changed with guarded SQL and backups. See docs/seo-geo-aeo-corrections-2026-11-03.md. No Ads changes or real lead tests in this release.

## Search Console repair release (2026-11-03; newer than full public SEO)
- Current verified frontend: Cloudflare `9dbd643b-fb79-4d1a-aad9-2b2ff1b6d821`, app commit `0a7b4f6`; immediate rollback `fd0f5e14-6971-40e2-9348-822379ec396a`, pre-audit baseline `a3f176fe-53e1-4a3a-a6a1-b206b671fef3`. Verify live before future deployment.
- Wix redirects are exact known mappings; do not restore `/single-post/* /blog/:splat`, which redirected changed slugs to404. Build validates all destinations against published sitemap. Retired profiles/articles without equivalent stay genuine404.
- Search Console URL-prefix property https://silviocosta.net/ is available to momentoidoneo@gmail.com. Sitemap successfully re-read 3November,66discovered URLs. Real-estate gallery index request accepted, not proof of indexing. GBP same account shows0businesses; need correct manager account, never create duplicate.
- See docs/search-console-cwv-gbp-2026-11-03.md. 193tests,66livepages,17redirects verified. Removed unsupported SearchAction for a nonexistent blog search. CWV insufficient real-user data; lab scores99mobile/97desktop are a single sample, not a field-data pass.
