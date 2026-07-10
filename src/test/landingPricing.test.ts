import { describe, expect, it } from "vitest";
import {
  getFallbackLandingPricingPlanIds,
  parseLandingPricingPlanIds,
  resolveLandingPricingPlans,
  type LandingPricingPlan,
} from "@/lib/landingPricing";

const plan = (
  id: string,
  overrides: Partial<LandingPricingPlan> = {},
): LandingPricingPlan => ({
  id,
  price: 100,
  features: ["Uno", "Dos", "Tres"],
  is_highlighted: false,
  is_visible: true,
  order: 10,
  ...overrides,
});

describe("landing pricing configuration", () => {
  it("parses, deduplicates and limits configured plan ids", () => {
    expect(
      parseLandingPricingPlanIds(
        '["plan-1","plan-1","plan-2","plan-3","plan-4"]',
      ),
    ).toEqual(["plan-1", "plan-2", "plan-3"]);
  });

  it("returns null for missing or invalid settings so the legacy fallback remains active", () => {
    expect(parseLandingPricingPlanIds(null)).toBeNull();
    expect(parseLandingPricingPlanIds("not-json")).toBeNull();
    expect(parseLandingPricingPlanIds('{"id":"plan-1"}')).toBeNull();
  });

  it("keeps the previous highlighted-first fallback when no setting exists", () => {
    const plans = [
      plan("ordered-first", { order: 0 }),
      plan("highlighted", { is_highlighted: true, order: 30 }),
      plan("incomplete", { order: -10, features: ["Solo uno"] }),
      plan("hidden", { is_visible: false, order: -20 }),
    ];

    expect(getFallbackLandingPricingPlanIds(plans)).toEqual([
      "highlighted",
      "ordered-first",
    ]);
  });

  it("honours the saved order and excludes plans that can no longer be published", () => {
    const plans = [
      plan("first"),
      plan("second", { order: 20 }),
      plan("hidden", { is_visible: false }),
      plan("without-price", { price: null }),
    ];

    expect(
      resolveLandingPricingPlans(plans, [
        "second",
        "hidden",
        "missing",
        "first",
        "without-price",
      ]).map(({ id }) => id),
    ).toEqual(["second", "first"]);
  });
});
