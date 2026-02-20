import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Signal, SignalImpact, getSignalTypeLabel, isSignalRelevantToIndustry } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronRight, ExternalLink, Link2, TrendingUp, TrendingDown, Eye, ArrowRight, ShieldAlert, Users, Sparkles, Target } from "lucide-react";
import { useSavedSignals } from "@/hooks/useSavedSignals";
import { useAuth } from "@/contexts/AuthContext";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import AskArgus from "@/components/AskArgus";

interface SignalCardProps {
  signal: Signal;
}

const actionConfig = {
  engage: { label: "Engage", icon: ArrowRight, className: "bg-score-green/10 text-score-green border-score-green/20" },
  avoid: { label: "Avoid", icon: ShieldAlert, className: "bg-score-red/10 text-score-red border-score-red/20" },
  monitor: { label: "Monitor", icon: Eye, className: "bg-score-amber/10 text-score-amber border-score-amber/20" },
};

const defaultActionConfig = { label: "Monitor", icon: Eye, className: "bg-muted text-muted-foreground border-border" };

function ImpactTag({ entity }: { entity: SignalImpact }) {
  const config = actionConfig[entity.action as keyof typeof actionConfig] ?? defaultActionConfig;
  const ActionIcon = config.icon;
  const ImpactIcon = entity.impact === "positive" ? TrendingUp : TrendingDown;
  
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.className}`}
      title={entity.reason}
    >
      <ImpactIcon className="h-2.5 w-2.5" />
      {entity.name}
      <span className="opacity-60">·</span>
      <ActionIcon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

const sentimentColors = {
  positive: "bg-score-green/10 text-score-green border-score-green/20",
  negative: "bg-score-red/10 text-score-red border-score-red/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export default function SignalCard({ signal }: SignalCardProps) {
  const { session } = useAuth();
  const { data } = useIntelligence();
  const { industries, prospects } = data;
  const { isSignalSaved, getSavedForSignal, saveSignal, unsaveSignal } = useSavedSignals();
  const [expanded, setExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveMode, setSaveMode] = useState<"prospect" | "custom">("prospect");
  const [selectedProspectId, setSelectedProspectId] = useState("");
  const [customName, setCustomName] = useState("");
  const [saveNotes, setSaveNotes] = useState("");
  const navigate = useNavigate();

  const industryNames = signal.industryTags
    .map((id) => industries.find((i) => i.id === id)?.name)
    .filter(Boolean);

  // Find prospects directly connected to this signal via relatedSignals
  const directlyConnected = prospects.filter(
    (p) => p.relatedSignals?.includes(signal.id)
  );

  // Find prospects in the same industries as this signal
  const industryConnected = prospects.filter(
    (p) => isSignalRelevantToIndustry(signal, p.industryId) && !directlyConnected.find((d) => d.id === p.id)
  ).sort((a, b) => b.vigylScore - a.vigylScore).slice(0, 4);

  const allConnected = [...directlyConnected, ...industryConnected];

  const saved = isSignalSaved(signal.id);
  const savedEntries = getSavedForSignal(signal.id);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) return;
    if (saved && savedEntries.length > 0) {
      savedEntries.forEach((entry) => unsaveSignal.mutate(entry.id));
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleSave = () => {
    const opportunityName =
      saveMode === "prospect"
        ? prospects.find((p) => p.id === selectedProspectId)?.companyName || ""
        : customName.trim();

    if (!opportunityName) return;

    saveSignal.mutate({
      signalId: signal.id,
      opportunityName,
      prospectId: saveMode === "prospect" ? selectedProspectId : undefined,
      notes: saveNotes.trim() || undefined,
    });
    setShowSaveDialog(false);
    setCustomName("");
    setSaveNotes("");
    setSelectedProspectId("");
  };

  return (
    <div className="rounded-lg border border-border bg-card transition-colors hover:border-primary/30">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary">{getSignalTypeLabel(signal.signalType)}</span>
              <div className="flex gap-1 items-center" title={`Severity: ${signal.severity}/5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < signal.severity ? "bg-primary" : "bg-border"}`} />
                ))}
                <span className="text-[9px] text-muted-foreground ml-0.5">{signal.severity}/5</span>
              </div>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sentimentColors[signal.sentiment]}`}>{signal.sentiment}</Badge>
            </div>
            <h4 className="mt-2 text-sm font-semibold text-foreground leading-snug">{signal.title}</h4>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{signal.summary}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handleBookmarkClick} className={`rounded-md p-1.5 transition-colors ${saved ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
            {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        <div className="mt-3 rounded-md border border-primary/10 px-3 py-2" style={{ background: "linear-gradient(135deg, hsl(217 91% 55% / 0.04), hsl(245 58% 51% / 0.04))" }}>
          <p className="text-xs text-primary font-medium">💡 {signal.salesImplication}</p>
        </div>

        {signal.impactedEntities && signal.impactedEntities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {signal.impactedEntities.slice(0, expanded ? undefined : 3).map((entity, i) => (
              <ImpactTag key={i} entity={entity} />
            ))}
            {!expanded && signal.impactedEntities.length > 3 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{signal.impactedEntities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {industryNames.map((name) => (
              <span key={name} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{name}</span>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{signal.publishedAt}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          {signal.impactedEntities && signal.impactedEntities.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2">Impact Analysis</h5>
              <div className="space-y-1.5">
                {signal.impactedEntities.map((entity, i) => {
                  const config = actionConfig[entity.action as keyof typeof actionConfig] ?? defaultActionConfig;
                  const ImpactIcon = entity.impact === "positive" ? TrendingUp : TrendingDown;
                  return (
                    <div key={i} className={`rounded-md border px-3 py-2 ${config.className}`}>
                      <div className="flex items-center gap-2">
                        <ImpactIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-semibold">{entity.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ml-auto ${config.className}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] opacity-80 leading-relaxed">{entity.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connected Prospects */}
          {allConnected.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Users className="h-3 w-3 text-primary" />
                Affected Prospects ({allConnected.length})
              </h5>
              <div className="space-y-1.5">
                {directlyConnected.map((p) => (
                  <div
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); navigate("/prospects"); }}
                    className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/[0.03] px-3 py-2 cursor-pointer hover:bg-primary/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Target className="h-3 w-3 text-primary shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground">{p.companyName}</span>
                        <span className="text-[10px] text-primary ml-1.5">directly linked</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        p.pressureResponse === "growth_mode" ? "bg-green-100 text-green-700" :
                        p.pressureResponse === "contracting" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{p.pressureResponse.replace("_", " ")}</span>
                      <span className="text-xs font-mono font-bold text-primary">{p.vigylScore}</span>
                    </div>
                  </div>
                ))}
                {industryConnected.map((p) => (
                  <div
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); navigate("/prospects"); }}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground">{p.companyName}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">same industry</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        p.pressureResponse === "growth_mode" ? "bg-green-100 text-green-700" :
                        p.pressureResponse === "contracting" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{p.pressureResponse.replace("_", " ")}</span>
                      <span className="text-xs font-mono font-bold text-primary">{p.vigylScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA: Find Opportunities */}
          {signal.industryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const firstIndustry = signal.industryTags[0];
                  navigate(`/prospects?industry=${firstIndustry}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Find Opportunities From This Signal
              </button>
              {signal.industryTags.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ai-impact`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  View AI Impact on {industryNames[0] || "Industry"}
                </button>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                <AskArgus
                  compact
                  context={`Signal: ${signal.title}\nType: ${getSignalTypeLabel(signal.signalType)}\nSeverity: ${signal.severity}/5\nSentiment: ${signal.sentiment}\nIndustries: ${industryNames.join(", ")}\nSummary: ${signal.summary}\nSales Implication: ${signal.salesImplication}\nPublished: ${signal.publishedAt}`}
                  label={signal.title}
                  greeting={`I'm looking at the signal "${signal.title}" (severity ${signal.severity}/5, ${signal.sentiment}). This affects ${industryNames.join(" and ")}. What would you like to know — how to act on this, which prospects to contact, or how this connects to other market movements?`}
                />
              </div>
            </div>
          )}
          {signal.sources?.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2">Sources ({signal.sources.length})</h5>
              <div className="space-y-1.5">
                {signal.sources.map((source, i) => (
                  <a key={i} href={source.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center justify-between rounded-md border border-border px-3 py-2 hover:bg-accent/50 transition-colors group">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-primary opacity-60 group-hover:opacity-100" />
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{source.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{source.publishedAt}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {savedEntries.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Link2 className="h-3 w-3 text-primary" />Linked Opportunities</h5>
              <div className="flex flex-wrap gap-1.5">
                {savedEntries.map((entry) => (
                  <span key={entry.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                    {entry.opportunity_name}
                    <button onClick={(e) => { e.stopPropagation(); unsaveSignal.mutate(entry.id); }} className="ml-0.5 hover:text-destructive transition-colors">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!showSaveDialog && session && (
            <button onClick={(e) => { e.stopPropagation(); setShowSaveDialog(true); }} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
              <Bookmark className="h-3 w-3" />Save to Opportunity
            </button>
          )}
        </div>
      )}

      {showSaveDialog && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          <h5 className="text-xs font-semibold text-foreground">Save Signal to Opportunity</h5>
          <div className="flex gap-1.5">
            <button onClick={() => setSaveMode("prospect")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${saveMode === "prospect" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>Existing Prospect</button>
            <button onClick={() => setSaveMode("custom")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${saveMode === "custom" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>Custom Opportunity</button>
          </div>
          {saveMode === "prospect" ? (
            <select value={selectedProspectId} onChange={(e) => setSelectedProspectId(e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Select a prospect...</option>
              {prospects.map((p) => <option key={p.id} value={p.id}>{p.companyName}</option>)}
            </select>
          ) : (
            <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Q2 Federal Contracts Push" className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          )}
          <textarea value={saveNotes} onChange={(e) => setSaveNotes(e.target.value)} placeholder="Add notes (optional)..." rows={2} className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saveMode === "prospect" ? !selectedProspectId : !customName.trim()} className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">Save</button>
            <button onClick={() => setShowSaveDialog(false)} className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
