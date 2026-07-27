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
const robots = readFileSync(
  resolve(process.cwd(), "public/robots.txt"),
  "utf8",
);

describe("initial SEO shell", () => {
  it("does not claim that every client-side route is the home page", () => {
    expect(html).not.toMatch(/<link\s+rel="canonical"/);
    expect(html).not.toMatch(/<link\s+rel="alternate"\s+hreflang=/);
    expect(html).not.toMatch(/<meta\s+property="og:url"/);
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
