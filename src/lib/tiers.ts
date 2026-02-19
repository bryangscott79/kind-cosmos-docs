// Stripe product/price mapping for VIGYL tiers
export const TIERS = {
  free: {
    name: "Free",
    price: 0,
    product_id: null,
    price_id: null,
    features: [
      "3 industries tracked",
      "Signal Feed (5 most recent per industry)",
      "AI Impact Overview grid",
      "URL Analyzer for your business",
    ],
  },
  starter: {
    name: "Growth",
    price: 29,
    product_id: "prod_Txyq2ciN3TGH2L",
    price_id: "price_1T02t8An8oRG1jaDAC6B9YxG",
    features: [
      "Everything in Free",
      "10 industries tracked",
      "Unlimited signals with full detail",
      "AI Impact detail & comparison views",
      "Prospect Engine with scored leads",
      "Decision-maker contacts",
      "Basic outreach generation",
      "Weekly Intelligence Brief",
    ],
  },
  pro: {
    name: "Pro",
    price: 59,
    product_id: "prod_TxyrkYcF0qmuhU",
    price_id: "price_1T02tPAn8oRG1jaDbp3t8BmN",
    features: [
      "Everything in Growth",
      "Unlimited industries",
      "Pipeline management",
      "Full AI outreach (email, LinkedIn, briefs)",
      "Ask Argus — AI advisor on every page",
      "All 5 report types",
      "CSV / PDF export",
      "Advanced signal analytics",
    ],
  },
  enterprise: {
    name: "Team",
    price: 99,
    product_id: "prod_TxyrhISvPjfGkD",
    price_id: "price_1T02tbAn8oRG1jaDtlHTRtIr",
    features: [
      "Everything in Pro",
      "Per-seat pricing for teams",
      "Priority signal alerts",
      "Shared pipelines & team reports",
      "API access & integrations",
      "Dedicated onboarding support",
    ],
  },
} as const;

export type TierKey = keyof typeof TIERS;

export function getTierFromProductId(productId: string | null): TierKey {
  if (!productId) return "free";
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
  }
  return "free";
}

// Feature access rules
export const FEATURE_ACCESS: Record<string, TierKey> = {
  industries: "free",
  signals: "free",
  ai_impact: "free",
  ai_impact_full: "starter",
  prospects: "starter",
  pipeline: "pro",
  outreach: "starter",
  deep_reports: "starter",
  reports: "starter",
  settings: "free",
  export: "pro",
  argus: "pro",
};

const tierOrder: TierKey[] = ["free", "starter", "pro", "enterprise"];

export function hasAccess(userTier: TierKey, requiredTier: TierKey): boolean {
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}
