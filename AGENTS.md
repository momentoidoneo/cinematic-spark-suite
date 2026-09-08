# cinematic-spark-suite — production safeguards

Scope: this project only; production https://silviocosta.net.

- Do NOT use Lovable connectors, editor agents, or deploy actions. The user confirms this project is migrated. Legacy access is not deployment authorization.
- Production frontend: Cloudflare worker `silviocosta-net`, account `0e75bd5bb4b7456e4338216af1657482` (momentoidoneo@gmail.com).
- Git automatic deployments were disconnected on 2026-09-08 to contain an incident. Do not reconnect without explicit approval and source/deployment reconciliation.
- Before a deployment verify live worker version, repository SHA, working-tree changes, target backend and full automatic trigger chain. Never infer these from an old marker or successful login.
- Recovery baseline (historical, verify current release before operating): Cloudflare version `01eb4345-79a7-4f74-887d-e37a65a49ee9` was restored: Madrid-first frontend, four-step quoter, filtered test-lead metrics. Working tree is newer than this deployed artifact; do not blindly rebuild and publish.
- Browser bundle currently references Supabase `edpqywwtgoiktotxrqrz`; direct backend management access and provider independence remain to be verified. Do not substitute legacy Lovable access for this verification.
- Google Ads: customer 725-747-3398, login momentoidoneo@gmail.com. No campaign activation or budget changes without specific approval.
- Preserve existing uncommitted work. See docs/incident-recovery-2026-09-08.md before further changes.
