export const LANDING_PRICING_SETTING_KEY = "landing_pricing_plan_ids";
export const LANDING_PRICING_LIMIT = 3;

export type LandingPricingPlan = {
  id: string;
  price: number | null;
  features: string[] | null;
  is_highlighted: boolean;
  order: number;
  is_visible?: boolean;
};

export const isLandingPricingReady = (plan: LandingPricingPlan) =>
  plan.is_visible !== false &&
  plan.price !== null &&
  (plan.features?.filter((feature) => feature.trim()).length || 0) > 0;

export const parseLandingPricingPlanIds = (
  value: string | null | undefined,
): string[] | null => {
  if (value == null || value.trim() === "") return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;

    return Array.from(
      new Set(
        parsed.filter((item): item is string => typeof item === "string"),
      ),
    ).slice(0, LANDING_PRICING_LIMIT);
  } catch {
    return null;
  }
};

export const getFallbackLandingPricingPlanIds = <T extends LandingPricingPlan>(
  plans: T[],
) =>
  [...plans]
    .filter(
      (plan) =>
        plan.is_visible !== false &&
        plan.price !== null &&
        (plan.features?.filter((feature) => feature.trim()).length || 0) >= 3,
    )
    .sort(
      (a, b) =>
        Number(b.is_highlighted) - Number(a.is_highlighted) ||
        a.order - b.order,
    )
    .slice(0, LANDING_PRICING_LIMIT)
    .map((plan) => plan.id);

export const resolveLandingPricingPlans = <T extends LandingPricingPlan>(
  plans: T[],
  configuredIds: string[] | null,
) => {
  const ids = configuredIds ?? getFallbackLandingPricingPlanIds(plans);
  const byId = new Map(plans.map((plan) => [plan.id, plan]));

  return ids
    .map((id) => byId.get(id))
    .filter((plan): plan is T => Boolean(plan && isLandingPricingReady(plan)))
    .slice(0, LANDING_PRICING_LIMIT);
};
