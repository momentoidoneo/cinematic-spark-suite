import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  dateOnly,
  isSafeSlug,
  latestDate,
  PRIORITY_CITY_SLUGS,
  SITEMAP_STATIC_PAGES,
} from "../../supabase/functions/_shared/seoCatalog";
import {
  priorityServiceCitySlugs,
  regionalCoverage,
} from "@/content/regionalCoverage";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
const faviconIco = readFileSync(
  resolve(process.cwd(), "public/favicon.ico"),
);
const namedFaviconIco = readFileSync(
  resolve(process.cwd(), "public/favicon-silvio-costa.ico"),
);
const faviconPng = readFileSync(
  resolve(process.cwd(), "public/favicon.png"),
);
const namedFaviconPng = readFileSync(
  resolve(process.cwd(), "public/favicon-silvio-costa.png"),
);
const robots = readFileSync(
  resolve(process.cwd(), "public/robots.txt"),
  "utf8",
);
const headers = readFileSync(
  resolve(process.cwd(), "public/_headers"),
  "utf8",
);
const prerenderScript = readFileSync(
  resolve(process.cwd(), "scripts/prerender-seo.mjs"),
  "utf8",
);
const wranglerConfig = JSON.parse(
  readFileSync(resolve(process.cwd(), "wrangler.jsonc"), "utf8"),
);

describe("initial SEO shell", () => {
  it("does not claim that every client-side route is the home page", () => {
    expect(html).not.toMatch(/<link\s+rel="canonical"/);
    expect(html).not.toMatch(/<link\s+rel="alternate"\s+hreflang=/);
    expect(html).not.toMatch(/<meta\s+property="og:url"/);
  });

  it("uses Silvio Costa branding for explicit and fallback favicons", () => {
    const lovableFaviconHash =
      "dd821076a9b03adc2173c93956226aea3d92482d7578fc4339c5d3a2e9c24586";
    const currentFaviconHash = createHash("sha256")
      .update(faviconIco)
      .digest("hex");

    expect(html).toContain("/favicon-silvio-costa.png");
    expect(html).toContain("/favicon-silvio-costa.ico");
    expect(html).toContain("/apple-touch-icon.png");
    expect(currentFaviconHash).not.toBe(lovableFaviconHash);
    expect(faviconIco.equals(namedFaviconIco)).toBe(true);
    expect(faviconPng.equals(namedFaviconPng)).toBe(true);
  });
});

describe("AI crawler access", () => {
  it.each(["OAI-SearchBot", "OAI-AdsBot", "Perplexity-User"])(
    "declares %s explicitly",
    (crawler) => {
      expect(robots).toContain(`User-agent: ${crawler}`);
    },
  );
});

describe("Cloudflare edge configuration", () => {
  it("uses Cloudflare-compatible permanent redirects", () => {
    expect(prerenderScript).not.toContain("301!");
    expect(prerenderScript).not.toContain('"/* /404.html 404"');
    expect(prerenderScript).not.toContain('"/admin/* /index.html 200"');
    expect(prerenderScript).toContain(
      '"/single-post/* /blog/:splat 301"',
    );
  });

  it("keeps private routes out of search and caches hashed assets", () => {
    expect(headers).toContain(
      "X-Robots-Tag: noindex, nofollow, noarchive",
    );
    expect(headers).toContain(
      "Cache-Control: public, max-age=31536000, immutable",
    );
    expect(headers).toContain(
      "https://:worker.:account.workers.dev/*",
    );
  });

  it("preserves clean URLs and returns a native 404", () => {
    expect(wranglerConfig.assets.html_handling).toBe(
      "drop-trailing-slash",
    );
    expect(wranglerConfig.assets.not_found_handling).toBe("404-page");
  });

  it("runs edge logic only for retired programmatic routes", () => {
    expect(wranglerConfig.main).toBe("./worker/index.js");
    expect(wranglerConfig.assets.binding).toBe("ASSETS");
    expect(wranglerConfig.assets.run_worker_first).toEqual(
      expect.arrayContaining([
        "/fotografia-*",
        "/tour-virtual-*",
        "/video-dron-*",
      ]),
    );
  });
});

describe("sitemap catalog", () => {
  it("pushes only cities with current commercial priority", () => {
    expect(PRIORITY_CITY_SLUGS).toEqual(["madrid"]);
    expect(PRIORITY_CITY_SLUGS).toEqual(priorityServiceCitySlugs);
  });

  it("defines focused landing pages for both priority regions", () => {
    expect(regionalCoverage.madrid.path).toBe(
      "/servicios-audiovisuales-madrid",
    );
    expect(regionalCoverage["castilla-la-mancha"].path).toBe(
      "/servicios-audiovisuales-castilla-la-mancha",
    );
  });

  it("includes the public guide, glossary and collaborator routes", () => {
    const paths = SITEMAP_STATIC_PAGES.map((page) => page.loc);
    expect(paths).toContain("/guia-servicios-audiovisuales");
    expect(paths).toContain("/glosario");
    expect(paths).toContain("/trabaja-con-nosotros");
    expect(paths).toContain("/servicios-audiovisuales-madrid");
    expect(paths).toContain(
      "/servicios-audiovisuales-castilla-la-mancha",
    );
    expect(paths).toContain("/fotografia-inmobiliaria-madrid");
  });

  it("validates slugs and keeps truthful update dates", () => {
    expect(isSafeSlug("fotografia-inmobiliaria")).toBe(true);
    expect(isSafeSlug("")).toBe(false);
    expect(isSafeSlug("Madrid Centro")).toBe(false);
    expect(dateOnly("2026-07-27T11:30:00.000Z")).toBe("2026-07-27");
    expect(
      latestDate(
        "2026-07-20T08:00:00.000Z",
        "2026-07-27T08:00:00.000Z",
      ),
    ).toBe("2026-07-27");
  });
});
