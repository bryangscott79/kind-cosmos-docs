// Stripe product/price mapping for VIGYL tiers
export const TIERS = {
  free: {
    name: "Free",
    price: 0,
    product_id: null,
    price_id: null,
    features: [
      "Industry Health Dashboard with real-time scores",
      "Signal Feed — geopolitical, economic & regulatory alerts",
      "6 industries tracked",
      "AI Impact Overview",
    ],
  },
  starter: {
    name: "Starter",
    price: 19,
    product_id: "prod_Txyq2ciN3TGH2L",
    price_id: "price_1T02t8An8oRG1jaDAC6B9YxG",
    features: [
      "Everything in Free",
      "Prospect Engine with scored leads & 'Why Now'",
      "Location, revenue & employee filters",
      "Decision-maker contacts with LinkedIn links",
      "Prospect feedback loop (More / Less like this)",
      "AI Impact Detail & Comparison views",
      "Industry & Signal Reports",
    ],
  },
  pro: {
    name: "Pro",
    price: 49,
    product_id: "prod_TxyrkYcF0qmuhU",
    price_id: "price_1T02tPAn8oRG1jaDbp3t8BmN",
    features: [
      "Everything in Starter",
      "Pipeline Management — drag-and-drop deal stages",
      "AI Outreach Generation (email, LinkedIn, briefs)",
      "Ask Argus — AI sales advisor on every page",
      "Advanced signal analytics & saved signals",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    product_id: "prod_TxyrhISvPjfGkD",
    price_id: "price_1T02tbAn8oRG1jaDtlHTRtIr",
    features: [
      "Everything in Pro",
      "AI-powered deep insights & strategy briefs",
      "Priority signal alerts",
      "Unlimited industries tracked",
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
  ai_impact: "free",        // Overview grid is free, detail/compare requires starter
  ai_impact_full: "starter", // Full three-zone detail view
  prospects: "starter",
  pipeline: "pro",
  outreach: "pro",
  deep_reports: "starter",   // Basic reports at starter, advanced at pro
  reports: "starter",
  settings: "free",
};

const tierOrder: TierKey[] = ["free", "starter", "pro", "enterprise"];

export function hasAccess(userTier: TierKey, requiredTier: TierKey): boolean {
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}
