import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Zap, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TIERS, TierKey, hasAccess } from "@/lib/tiers";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const { session, tier: currentTier } = useAuth();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, tierKey: string) => {
    if (!session) {
      toast({ title: "Sign in first", description: "Create an account to subscribe.", variant: "destructive" });
      return;
    }
    setLoadingTier(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoadingTier(null);
    }
  };

  const tiers: { key: TierKey; highlight?: boolean }[] = [
    { key: "free" },
    { key: "starter" },
    { key: "pro", highlight: true },
    { key: "enterprise" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand-blue to-brand-purple">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">VIGYL</span>
            <span className="text-xs font-medium text-brand-purple">.ai</span>
          </Link>
          <Link to={session ? "/industries" : "/auth"} className="text-sm font-medium text-primary hover:text-primary/80">
            {session ? "Dashboard" : "Sign In"} <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Choose your{" "}
          <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">intelligence</span>{" "}
          tier
        </h1>
        <p className="mt-3 text-muted-foreground">Scale your market intelligence as your business grows</p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map(({ key, highlight }) => {
            const t = TIERS[key];
            const isCurrent = currentTier === key;
            const isUpgrade = !hasAccess(currentTier, key) && key !== "free";

            return (
              <div
                key={key}
                className={`relative flex flex-col rounded-xl border p-6 text-left transition-all ${
                  highlight
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                } ${isCurrent ? "ring-2 ring-primary" : ""}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Your Plan
                  </div>
                )}

                <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {t.price === 0 ? "Free" : `$${t.price}`}
                  </span>
                  {t.price > 0 && <span className="text-xs text-muted-foreground">/mo</span>}
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {key === "free" ? (
                    <Link
                      to={session ? "/industries" : "/auth"}
                      className="block w-full rounded-md border border-border bg-card px-4 py-2 text-center text-xs font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      {session ? "Current Plan" : "Get Started Free"}
                    </Link>
                  ) : isCurrent ? (
                    <button disabled className="w-full rounded-md bg-primary/20 px-4 py-2 text-xs font-medium text-primary cursor-default">
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => t.price_id && handleCheckout(t.price_id, key)}
                      disabled={!!loadingTier}
                      className={`flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
                        highlight
                          ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {loadingTier === key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>{isUpgrade ? "Upgrade" : "Subscribe"}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
