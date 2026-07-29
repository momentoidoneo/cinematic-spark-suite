import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260729215500_restrict_public_site_settings.sql",
  ),
  "utf8",
);

describe("site_settings public access", () => {
  it("replaces the unrestricted SELECT policy with an explicit allowlist", () => {
    expect(migration).toContain(
      'DROP POLICY IF EXISTS "Anyone can view site settings"',
    );
    expect(migration).toContain(
      'CREATE POLICY "Public can view non-sensitive site settings"',
    );
    expect(migration).not.toContain("USING (true)");
    expect(migration).not.toContain("'indexnow_key'");
  });

  it.each([
    "hero_bg",
    "landing_pricing_plan_ids",
    "google_tag_manager_id",
    "google_analytics_id",
    "google_ads_id",
    "google_ads_conversion_label",
    "google_ads_whatsapp_conversion_label",
    "google_ads_phone_conversion_label",
  ])("keeps browser-required setting %s readable", (key) => {
    expect(migration).toContain(`'${key}'`);
  });
});
