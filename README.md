# Silvio Costa - silviocosta.net

Commercial website and admin panel. Isolated project: `cinematic-spark-suite`.

## Active production (2026-11-02)

- Domain registered at IONOS; frontend manually deployed to Cloudflare Worker `silviocosta-net`.
- Independent Supabase backend: `sffgaplkqmmnikqhhftx`, organization `momentoidoneo`. Database, auth, Storage and functions no longer require Lovable Cloud.
- Text, quotes and images: dedicated OpenClaw agent `silviocosta-net` on silvio-server using OpenAI OAuth. No OpenAI API key or Lovable gateway in these paths.
- Owner contact/quote notifications: Gmail direct, send-only OAuth and a durable delivery ledger. No Gmail read permission in the backend.
- Admin: https://silviocosta.net/admin. After migration, sign in again with the existing password if asked.
- Google Ads was not paused or edited. Marked `SC-ADS-YYYYMMDD-NN` test leads are excluded from advertising conversions and real-lead totals.

Old Lovable backend `edpqywwtgoiktotxrqrz` is retained for recovery and reconciliation of visitors with older pages still open. Do not delete it or reconnect automatic publishing.

## Development and checks

React, TypeScript, Vite, Tailwind and shadcn/ui. `.env` contains public Supabase configuration only; never add private credentials.

```sh
npm ci
npm run dev
npx vitest run --config vitest.migration.config.ts
npx tsc -p tsconfig.app.json --noEmit
npm run build
npm run smoke:site
```

Development hosts do not load external measurement tags. Do not generate real leads or Ads conversions for testing.

## Release and recovery

Read `AGENTS.md` first. Verify the Cloudflare identity, live version, commit, worktree, backend and trigger chain before deployment. Git builds remain disconnected: a push does not publish the website.

Migration app commit: `44413b128a4c4d9850586cc20b7995cb6e57c0f1`.
Cloudflare release: `54f639dc-2a68-4121-9369-a6c8f71b29ad`.
Previous release: `fcab550c-6443-43d4-8297-a64e8962e84e`.

The previous release and private backup remain available. Reconcile destination-only leads before rollback: reverting the frontend does not move database records.

Do not blindly run `supabase db push`: historical filenames and applied timestamps can differ by seconds. Never overwrite new auth sessions with old sessions or replay historical notification triggers.

Evidence and limitations: [migration report](docs/supabase-independent-migration-2026-11-02.md), [direct Gmail](docs/gmail-direct-setup-2026-11-02.md).

Optional Runway video, scraping, newsletter, invoicing and social-publishing modules need their own authorized provider access. Deployed code does not establish an operational provider connection. Do not purchase or connect providers without specific approval.
