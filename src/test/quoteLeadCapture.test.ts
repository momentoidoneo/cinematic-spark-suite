import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isValidQuoteLeadEmail,
  isValidQuoteLeadName,
} from "../../supabase/functions/_shared/quoteLeadValidation";

const edgeSource = readFileSync(
  resolve(process.cwd(), "supabase/functions/generate-quote/index.ts"),
  "utf8",
);

const identityMigration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260731094500_require_quote_request_identity.sql",
  ),
  "utf8",
);

describe("AI quote lead capture", () => {
  it("requires a meaningful name and a valid email", () => {
    expect(isValidQuoteLeadName("")).toBe(false);
    expect(isValidQuoteLeadName("A")).toBe(false);
    expect(isValidQuoteLeadName("  Ana Costa  ")).toBe(true);

    expect(isValidQuoteLeadEmail("ana")).toBe(false);
    expect(isValidQuoteLeadEmail("ana@example.com")).toBe(true);
  });

  it("enforces identity again in the Edge Function", () => {
    expect(edgeSource).toContain("if (!isValidQuoteLeadName(body.name))");
    expect(edgeSource).toContain("if (!isValidQuoteLeadEmail(body.email))");
    expect(edgeSource).toContain("const requestId = await saveQuoteRequest");
  });

  it("schedules the owner email after saving the lead", () => {
    expect(edgeSource).toContain(
      "sendNotificationEmails(body, quote, requestId)",
    );
    expect(edgeSource).toContain('"silvio@silviocosta.net"');
    expect(edgeSource).toContain("EdgeRuntime.waitUntil(emailPromise)");
  });

  it("protects direct public inserts with the same identity rule", () => {
    expect(identityMigration).toContain(
      "length(btrim(name)) BETWEEN 2 AND 140",
    );
    expect(identityMigration).toContain(
      'CREATE POLICY "Anyone can create quote requests"',
    );
  });
});
