import { Link } from "react-router-dom";
import {
  Target, Brain, Bot, Handshake, User, CheckCircle2,
  MessageSquare, Building2,
} from "lucide-react";
import { Prospect, getPressureLabel, type Signal, type Industry } from "@/data/mockData";

function SectionHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h2>
      {badge && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{badge}</span>}
    </div>
  );
}

interface Contact {
  name: string;
  title: string;
  verified?: boolean;
}

interface AIImpactData {
  automationRate: number;
  collaborativeOpportunityIndex: number;
  aiLedFunctions: any[];
  collaborativeFunctions: any[];
  humanLedFunctions: any[];
}

interface ProspectDetailSidebarProps {
  prospect: Prospect;
  displayContacts: Contact[];
  relatedSignals: Signal[];
  industry?: Industry;
  impactData?: AIImpactData;
  industryProspects: Prospect[];
}

export default function ProspectDetailSidebar({
  prospect,
  displayContacts,
  relatedSignals,
  industry,
  impactData,
  industryProspects,
}: ProspectDetailSidebarProps) {
  return (
    <div className="space-y-5">
      {/* Outreach Playbook */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-5">
        <SectionHeader icon={<Target className="h-4 w-4 text-primary" />} title="Outreach Playbook" />
        <div className="space-y-3">
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Primary Angle</p>
            <p className="text-xs text-foreground leading-relaxed">
              {prospect.pressureResponse === "growth_mode"
                ? `${prospect.companyName} is in growth mode — lead with competitive advantage and innovation. They're investing aggressively.`
                : prospect.pressureResponse === "contracting"
                ? `${prospect.companyName} is contracting — lead with ROI, efficiency, and risk reduction. Keep proposals lean.`
                : `${prospect.companyName} is investing strategically — show clear ROI with a phased approach.`}
            </p>
          </div>
          {displayContacts[0] && (
            <div className="rounded-lg bg-card border border-border p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Lead Contact</p>
              <p className="text-xs font-semibold text-foreground">{displayContacts[0].name}</p>
              <p className="text-[11px] text-muted-foreground">{displayContacts[0].title}</p>
              {displayContacts[0].verified && (
                <span className="inline-flex items-center gap-0.5 mt-1 text-[8px] text-emerald-600">
                  <CheckCircle2 className="h-2 w-2" /> Verified
                </span>
              )}
            </div>
          )}
          {relatedSignals[0] && (
            <div className="rounded-lg bg-card border border-border p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Signal Hook</p>
              <p className="text-xs text-foreground leading-relaxed">
                Reference "{relatedSignals[0].title}" — shows you understand their market.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Impact for Industry */}
      {impactData && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={<Brain className="h-4 w-4 text-primary" />} title="Industry AI Impact" />
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-2 text-center">
                <Bot className="h-3 w-3 text-rose-600 dark:text-rose-400 mx-auto" />
                <p className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">{impactData.aiLedFunctions.length}</p>
                <p className="text-[8px] text-rose-600/70 dark:text-rose-400/70">AI-Led</p>
              </div>
              <div className="rounded-md bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 p-2 text-center">
                <Handshake className="h-3 w-3 text-violet-600 dark:text-violet-400 mx-auto" />
                <p className="text-sm font-mono font-bold text-violet-600 dark:text-violet-400">{impactData.collaborativeFunctions.length}</p>
                <p className="text-[8px] text-violet-600/70 dark:text-violet-400/70">Collab</p>
              </div>
              <div className="rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 p-2 text-center">
                <User className="h-3 w-3 text-sky-600 dark:text-sky-400 mx-auto" />
                <p className="text-sm font-mono font-bold text-sky-600 dark:text-sky-400">{impactData.humanLedFunctions.length}</p>
                <p className="text-[8px] text-sky-600/70 dark:text-sky-400/70">Human</p>
              </div>
            </div>
            <div className="flex items-center gap-1 h-1.5 rounded-full overflow-hidden">
              {(() => {
                const total = impactData.aiLedFunctions.length + impactData.collaborativeFunctions.length + impactData.humanLedFunctions.length;
                return (
                  <>
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(impactData.aiLedFunctions.length / total) * 100}%` }} />
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(impactData.collaborativeFunctions.length / total) * 100}%` }} />
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(impactData.humanLedFunctions.length / total) * 100}%` }} />
                  </>
                );
              })()}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">{impactData.automationRate}% automated</p>
            <Link to="/ai-impact" className="text-[10px] text-primary font-medium hover:underline block text-center mt-1">
              View full AI impact →
            </Link>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={<MessageSquare className="h-4 w-4 text-primary" />} title="Notes" />
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          {prospect.notes || "No notes yet. Add notes from the Pipeline view."}
        </p>
        {prospect.lastContacted && (
          <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border">
            Last contacted: {new Date(prospect.lastContacted).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Same-Industry Prospects */}
      {industryProspects.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeader icon={<Building2 className="h-4 w-4 text-primary" />} title={`More in ${industry?.name}`} badge={`${industryProspects.length}`} />
          <div className="space-y-1.5">
            {industryProspects.slice(0, 5).map(p => (
              <Link key={p.id} to={`/prospects/${p.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-primary/20 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{p.companyName}</p>
                  <p className="text-[9px] text-muted-foreground">{p.location.city}, {p.location.state}</p>
                </div>
                <span className="text-xs font-mono font-bold text-primary shrink-0 ml-2">{p.vigylScore}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
