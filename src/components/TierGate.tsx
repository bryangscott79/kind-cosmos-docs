import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TierKey, hasAccess, TIERS } from "@/lib/tiers";
import { Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { track, EVENTS } from "@/lib/analytics";

interface TierGateProps {
  requiredTier: TierKey;
  children: React.ReactNode;
  featureName?: string;
}

export default function TierGate({ requiredTier, children, featureName }: TierGateProps) {
  const { tier } = useAuth();

  if (hasAccess(tier, requiredTier)) {
    return <>{children}</>;
  }

  const required = TIERS[requiredTier];

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {featureName || "This feature"} requires {required.name}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upgrade to the <span className="font-medium text-foreground">{required.name}</span> plan
          (${required.price}/mo) to unlock this feature.
        </p>
        <Link
          to="/pricing"
          onClick={() => track(EVENTS.UPGRADE_CLICKED, { requiredTier, feature: featureName })}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          View Plans <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
