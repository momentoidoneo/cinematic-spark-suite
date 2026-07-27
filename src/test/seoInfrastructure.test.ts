import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  dateOnly,
  HARDCODED_CITY_SLUGS,
  isSafeSlug,
  latestDate,
  SITEMAP_STATIC_PAGES,
} from "../../supabase/functions/_shared/seoCatalog";

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
  it("lists only local cities that the application can render without DB data", () => {
    expect(HARDCODED_CITY_SLUGS).toEqual([
      "madrid",
      "barcelona",
      "valencia",
      "sevilla",
      "malaga",
      "bilbao",
      "marbella",
      "lisboa",
      "porto",
      "faro",
    ]);
  });

  it("includes the public guide, glossary and collaborator routes", () => {
    const paths = SITEMAP_STATIC_PAGES.map((page) => page.loc);
    expect(paths).toContain("/guia-servicios-audiovisuales");
    expect(paths).toContain("/glosario");
    expect(paths).toContain("/trabaja-con-nosotros");
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
