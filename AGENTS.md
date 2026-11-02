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
