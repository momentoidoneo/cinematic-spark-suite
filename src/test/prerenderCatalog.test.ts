import { describe, expect, it } from "vitest";
import publicRoutes from "@/seo/publicRoutes.json";
import { SITEMAP_STATIC_PAGES } from "../../supabase/functions/_shared/seoCatalog";

describe("SEO prerender catalog", () => {
  it("contains every static sitemap route exactly once", () => {
    const paths = publicRoutes.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(
      expect.arrayContaining(SITEMAP_STATIC_PAGES.map((page) => page.loc)),
    );
  });

  it("focuses regional discovery on Madrid and Castilla-La Mancha", () => {
    const paths = publicRoutes.map((route) => route.path);
    expect(paths).toContain("/servicios-audiovisuales-madrid");
    expect(paths).toContain(
      "/servicios-audiovisuales-castilla-la-mancha",
    );
    expect(paths).toContain("/fotografia-inmobiliaria-madrid");
    expect(paths).not.toContain("/servicios-audiovisuales-barcelona");
  });
});
