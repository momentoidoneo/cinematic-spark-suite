import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CTASection from "@/components/CTASection";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  adsServiceCityConfigs,
  photographyServiceAdsConfig,
  videoDronAdsConfig,
} from "@/content/adsLandingConfigs";

const { maybeSingle } = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    maybeSingle,
    then: (
      resolve: (value: { data: unknown[]; error: null }) => unknown,
    ) => Promise.resolve(resolve({ data: [], error: null })),
  };

  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);

  return {
    supabase: {
      from: vi.fn(() => chain),
      functions: { invoke: vi.fn() },
    },
  };
});

describe("Google Ads landing conversion flow", () => {
  beforeEach(() => {
    maybeSingle.mockResolvedValue({
      data: {
        phone_number: "+34600000000",
        welcome_message: "Hola",
      },
      error: null,
    });
  });

  it("preselects the advertised service in the tracked contact form", () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    render(
      <CTASection
        defaultService="Fotografía inmobiliaria"
        trackingLabel="ads_inmobiliaria_madrid"
      />,
    );

    expect(screen.getByLabelText("Servicio")).toHaveValue(
      "Fotografía inmobiliaria",
    );
  });

  it("keeps landing navigation and the mobile budget CTA on the same page", async () => {
    render(
      <MemoryRouter>
        <Navbar contactHref="#contacto" />
        <WhatsAppButton budgetHref="#contacto" />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getAllByRole("link", { name: /presupuesto/i }).length,
      ).toBeGreaterThan(0);
    });

    screen
      .getAllByRole("link", { name: /presupuesto|contacto/i })
      .forEach((link) => expect(link).toHaveAttribute("href", "#contacto"));
  });

  it("covers the four Ads destinations without stale Costa del Sol or 2025 copy", () => {
    const configs = [
      photographyServiceAdsConfig,
      videoDronAdsConfig,
      adsServiceCityConfigs["fotografia-madrid"],
      adsServiceCityConfigs["fotografia-inmobiliaria-madrid"],
    ];
    const copy = JSON.stringify(configs);

    expect(configs).toHaveLength(4);
    expect(copy).not.toContain("Costa del Sol");
    expect(copy).not.toContain("2025");
    expect(copy).toContain("24–48");
    expect(videoDronAdsConfig.showreel?.youtubeId).toBe("-ZiwLZlG76o");
  });

  it("keeps the Madrid photographer landing distinct from the general photography service", () => {
    const madridConfig = adsServiceCityConfigs["fotografia-madrid"];

    expect(madridConfig.primaryCta).toBe("Consultar fecha en Madrid");
    expect(madridConfig.proofHeading).not.toBe(
      photographyServiceAdsConfig.proofHeading,
    );
    expect(madridConfig.outcomesHeading).not.toBe(
      photographyServiceAdsConfig.outcomesHeading,
    );
    expect(madridConfig.deliverables).not.toEqual(
      photographyServiceAdsConfig.deliverables,
    );
    expect(madridConfig.faqs).not.toEqual(photographyServiceAdsConfig.faqs);
  });

  it("uses reliable JPEG portfolio assets for every Ads proof card", () => {
    const configs = [
      photographyServiceAdsConfig,
      videoDronAdsConfig,
      adsServiceCityConfigs["fotografia-madrid"],
      adsServiceCityConfigs["fotografia-inmobiliaria-madrid"],
    ];

    configs
      .flatMap((config) => [
        config.heroImage,
        ...config.proof.map(({ image }) => image),
      ])
      .filter((image) => image.includes("/assets/ads/"))
      .forEach((image) => expect(image).toMatch(/\.jpg$/));
  });
});
