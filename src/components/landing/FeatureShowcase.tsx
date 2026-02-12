import { BarChart3, Radio, Users, Shield, TrendingUp, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function MiniHealthScore({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-muted-foreground truncate">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-[11px] font-mono font-semibold text-foreground w-6 text-right">{score}</span>
      </div>
    </div>
  );
}

function FeatureHealthScores() {
  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-3 space-y-0.5">
      <MiniHealthScore label="Cloud Infrastructure" score={82} color="bg-green-500" />
      <MiniHealthScore label="Clean Energy" score={74} color="bg-green-500" />
      <MiniHealthScore label="Defense Tech" score={91} color="bg-green-500" />
      <MiniHealthScore label="Healthcare AI" score={58} color="bg-yellow-500" />
      <MiniHealthScore label="Real Estate" score={34} color="bg-red-500" />
    </div>
  );
}

function FeatureSignalIntel() {
  const signals = [
    { type: "Regulatory", text: "EU AI Act enforcement begins Q2", impact: "high" },
    { type: "Economic", text: "Fed signals rate hold through 2026", impact: "medium" },
    { type: "Geopolitical", text: "New semiconductor export controls", impact: "high" },
  ];
  return (
    <div className="mt-4 space-y-2">
      {signals.map((s, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-2.5 flex items-start gap-2">
          <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${s.impact === "high" ? "bg-red-500" : "bg-yellow-500"}`} />
          <div>
            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">{s.type}</span>
            <p className="text-[11px] text-foreground leading-snug">{s.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureProspectEngine() {
  const prospects = [
    { name: "Meridian Health Systems", score: 87, reason: "New CTO + regulatory pressure", trend: "up" },
    { name: "Atlas Cloud Partners", score: 79, reason: "Series C + hiring surge", trend: "up" },
    { name: "Vertex Manufacturing", score: 64, reason: "Tariff exposure, active RFP", trend: "down" },
  ];
  return (
    <div className="mt-4 space-y-2">
      {prospects.map((p, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground">{p.name}</span>
            <div className="flex items-center gap-1">
              {p.trend === "up" ? <ArrowUpRight className="h-3 w-3 text-green-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
              <span className="text-[11px] font-mono font-bold text-primary">{p.score}</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Why now: {p.reason}</p>
        </div>
      ))}
    </div>
  );
}

function FeaturePressureResponse() {
  const companies = [
    { name: "NovaTech", mode: "Growth", color: "bg-green-100 text-green-700 border-green-200" },
    { name: "Orion Defense", mode: "Investing", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { name: "Summit Retail", mode: "Contracting", color: "bg-red-100 text-red-700 border-red-200" },
  ];
  return (
    <div className="mt-4 space-y-2">
      {companies.map((c, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-foreground">{c.name}</span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${c.color}`}>{c.mode}</span>
        </div>
      ))}
    </div>
  );
}

function FeatureVIGYLScore() {
  const factors = [
    { label: "Industry Health", value: 85 },
    { label: "Service Alignment", value: 72 },
    { label: "Spending Signals", value: 90 },
    { label: "Timing", value: 68 },
    { label: "Accessibility", value: 55 },
  ];
  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-foreground">Composite Score</span>
        <span className="text-lg font-mono font-bold text-primary">78</span>
      </div>
      {factors.map((f, i) => (
        <div key={i} className="flex items-center gap-2 py-1">
          <span className="text-[10px] text-muted-foreground w-24 shrink-0">{f.label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary/70" style={{ width: `${f.value}%` }} />
          </div>
          <span className="text-[10px] font-mono text-foreground w-5 text-right">{f.value}</span>
        </div>
      ))}
    </div>
  );
}

function FeatureAIOutreach() {
  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex gap-1.5">
        {["Email", "LinkedIn", "Brief"].map((t) => (
          <span key={t} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${t === "Email" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>{t}</span>
        ))}
      </div>
      <div className="rounded border border-border bg-background p-2">
        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
          "Hi Sarah — I noticed Meridian just appointed a new CTO amid the EU AI Act rollout. Given your compliance infrastructure needs, I'd love to share how we've helped similar orgs navigate..."
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Zap className="h-3 w-3 text-primary" />
        <span className="text-[10px] text-primary font-medium">Generated from 3 active signals</span>
      </div>
    </div>
  );
}

const features = [
  { icon: BarChart3, title: "Industry Health Scores", description: "Real-time composite scoring across 6 signal categories. Know which markets are thriving before your competitors do.", preview: FeatureHealthScores },
  { icon: Radio, title: "Signal Intelligence", description: "AI-processed geopolitical, economic, and regulatory signals with direct sales implications for your business.", preview: FeatureSignalIntel },
  { icon: Users, title: "Prospect Engine", description: "Scored prospects with 'Why Now' rationale — know exactly when and why to reach out.", preview: FeatureProspectEngine },
  { icon: Shield, title: "Pressure Response", description: "Understand if a company is contracting, investing strategically, or in growth mode. Target the right ones.", preview: FeaturePressureResponse },
  { icon: TrendingUp, title: "VIGYL Score", description: "Composite prospect scoring: industry health, service alignment, spending signals, timing, and accessibility.", preview: FeatureVIGYLScore },
  { icon: Zap, title: "AI Outreach", description: "Generate signal-aware cold emails, LinkedIn messages, and meeting briefs that reference what's actually happening.", preview: FeatureAIOutreach },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/20"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.5)",
          transition: `opacity 0.4s ease ${index * 0.1 + 0.2}s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1 + 0.2}s`,
        }}
      >
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <h3
        className="mt-3 text-sm font-semibold text-foreground"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateX(0)" : "translateX(-12px)",
          transition: `opacity 0.5s ease ${index * 0.1 + 0.25}s, transform 0.5s ease ${index * 0.1 + 0.25}s`,
        }}
      >
        {feature.title}
      </h3>
      <p
        className="mt-1 text-xs text-muted-foreground leading-relaxed"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: `opacity 0.5s ease ${index * 0.1 + 0.35}s`,
        }}
      >
        {feature.description}
      </p>
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(16px)",
          transition: `opacity 0.5s ease ${index * 0.1 + 0.4}s, transform 0.5s ease ${index * 0.1 + 0.4}s`,
        }}
      >
        <feature.preview />
      </div>
    </div>
  );
}

export default function FeatureShowcase() {
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal();

  return (
    <section className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div
          ref={headingRef}
          className="text-center mb-12"
          style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <h2 className="text-2xl font-bold text-foreground">Intelligence-driven selling</h2>
          <p className="mt-2 text-sm text-muted-foreground">Every feature designed to help you sell smarter, not harder</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
