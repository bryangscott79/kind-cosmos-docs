import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDigestSubscription } from "@/hooks/useDigestSubscription";

export default function NotificationsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription: digestSub, isSubscribed: digestActive, updatePreferences: updateDigest, subscribe: subscribeDigest, unsubscribe: unsubDigest, saving: digestSaving } = useDigestSubscription();

  return (
    <div className="space-y-6">
      {/* Subscription status */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">Email Digest</h3>
        {digestActive ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                Delivering to <span className="font-medium text-foreground">{digestSub?.email}</span>
                {digestSub?.send_count ? ` · ${digestSub.send_count} sent` : ""}
              </p>
              {digestSub?.last_sent_at && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Last sent: {new Date(digestSub.last_sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              )}
            </div>
            <button
              onClick={async () => {
                const r = await unsubDigest();
                toast({ title: r.success ? "Unsubscribed" : "Error", description: r.success ? "You'll no longer receive digest emails." : r.error, variant: r.success ? "default" : "destructive" });
              }}
              disabled={digestSaving}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              Unsubscribe
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input type="email" placeholder="you@company.com" defaultValue={user?.email || ""} id="digest-email-settings"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground w-64 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            <button
              onClick={async () => {
                const email = (document.getElementById("digest-email-settings") as HTMLInputElement)?.value;
                if (!email) return;
                const r = await subscribeDigest(email);
                toast({ title: r.success ? "Subscribed!" : "Error", description: r.success ? "Your first briefing arrives tomorrow." : r.error, variant: r.success ? "default" : "destructive" });
              }}
              disabled={digestSaving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {digestSaving ? "..." : "Subscribe"}
            </button>
          </div>
        )}
      </div>

      {/* Notification toggles */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">What to Include</h3>
        <div className="space-y-4">
          {([
            { key: "include_industry_health" as const, label: "Industry Health Changes", desc: "Health score changes across your tracked industries" },
            { key: "include_signals" as const, label: "Signal Alerts", desc: "High-severity signals affecting your industries" },
            { key: "include_prospect_updates" as const, label: "Prospect Updates", desc: "Top-scoring prospects and score changes" },
            { key: "include_pipeline_reminders" as const, label: "Pipeline Reminders", desc: "Reminders for prospects that haven't been contacted recently" },
          ] as const).map((n) => {
            const isOn = digestSub ? digestSub[n.key] : true;
            return (
              <div key={n.key} className="flex items-start justify-between gap-4 rounded-md border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </div>
                <button
                  onClick={async () => {
                    if (!digestActive) {
                      toast({ title: "Subscribe first", description: "Enable the email digest above to configure preferences." });
                      return;
                    }
                    await updateDigest({ [n.key]: !isOn });
                  }}
                  disabled={digestSaving}
                  className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${isOn ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white dark:bg-slate-200 transition-transform ${isOn ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequency */}
      <div className="rounded-lg border border-border bg-card p-6">
        <label className="block text-sm font-semibold text-foreground mb-1.5">Digest Frequency</label>
        <p className="text-xs text-muted-foreground mb-3">How often should we send your intelligence briefing?</p>
        <select
          value={digestSub?.frequency || "daily"}
          onChange={async (e) => {
            if (!digestActive) {
              toast({ title: "Subscribe first", description: "Enable the email digest above to change frequency." });
              return;
            }
            await updateDigest({ frequency: e.target.value as any });
            toast({ title: "Frequency updated", description: `You'll now receive ${e.target.value} digests.` });
          }}
          disabled={digestSaving || !digestActive}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Preview link */}
      <Link to="/digest-preview"
        className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
        <div>
          <p className="text-sm font-medium text-foreground">Preview Digest Email</p>
          <p className="text-xs text-muted-foreground mt-0.5">See exactly what the email looks like with your live data, toggle sections, and send a test.</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>
    </div>
  );
}
