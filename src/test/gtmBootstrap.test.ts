import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

describe("static GTM bootstrap", () => {
  it("loads the production container from the initial HTML", () => {
    expect(html).toContain('id="sc-gtm-gtm-ncpz56k2"');
    expect(html).toContain(
      '})(window, document, "script", "dataLayer", "GTM-NCPZ56K2");',
    );
    expect(html).toContain(
      "https://www.googletagmanager.com/ns.html?id=GTM-NCPZ56K2",
    );
  });

  it("sets Consent Mode before the GTM start event", () => {
    const consentPosition = html.indexOf('w.gtag("consent", "default"');
    const gtmStartPosition = html.indexOf('"gtm.start"');

    expect(consentPosition).toBeGreaterThan(-1);
    expect(gtmStartPosition).toBeGreaterThan(consentPosition);
  });
});
