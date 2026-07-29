import { describe, expect, it } from "vitest";
import { isRetiredProgrammaticPath } from "../../worker/index.js";

describe("Cloudflare retired location routes", () => {
  it.each([
    "/fotografia-madrid",
    "/fotografia-inmobiliaria-madrid",
    "/servicios/fotografia",
    "/servicios-audiovisuales-madrid",
    "/portafolio/fotografia",
  ])("keeps published route %s", (path) => {
    expect(isRetiredProgrammaticPath(path)).toBe(false);
  });

  it.each([
    "/fotografia-barcelona",
    "/fotografia-inmobiliaria-barcelona",
    "/fotografia-arquitectura-madrid",
    "/fotografia-gastronomia-lisboa",
    "/tour-virtual-malaga",
    "/video-dron-marbella",
  ])("returns Gone for retired route %s", (path) => {
    expect(isRetiredProgrammaticPath(path)).toBe(true);
  });

  it("does not classify arbitrary missing URLs as retired landings", () => {
    expect(isRetiredProgrammaticPath("/pagina-inexistente-test-404")).toBe(
      false,
    );
    expect(isRetiredProgrammaticPath("/fotografia/empresas")).toBe(false);
  });
});
