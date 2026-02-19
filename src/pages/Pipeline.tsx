import { track, EVENTS } from "@/lib/analytics";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, Radio, Calendar, MessageSquare, ExternalLink,
  ChevronRight, ChevronLeft, ChevronDown,
  MapPin, DollarSign, Building2, Mail, Trophy, XCircle,
  Save, TrendingUp, TrendingDown, Minus, Target, Trash2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { supabase } from "@/integrations/supabase/client";
import {
  getScoreColor, getPressureColor, getPressureLabel,
  pipelineStageLabels, PipelineStage, Prospect, Industry, Signal
} from "@/data/mockData";
import AskArgus from "@/components/AskArgus";
import CrmPushButton from "@/components/CrmPushButton";
import { useAuth } from "@/contexts/AuthContext";
import { getStageLabels } from "@/lib/personas";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const stageOrder: PipelineStage[] = ["researching", "contacted", "meeting_scheduled", "proposal_sent", "won", "lost"];

const stageColors: Record<PipelineStage, string> = {
  researching: "border-t-slate-400",
  contacted: "border-t-blue-500",
  meeting_scheduled: "border-t-violet-500",
  proposal_sent: "border-t-amber-500",
  won: "border-t-emerald-500",
  lost: "border-t-rose-400",
};

function PipelineCard({
  prospect,
  industries,
  signals,
  onMove,
  onUpdateNotes,
  onDelete,
}: {
  prospect: Prospect;
  industries: Industry[];
  signals: Signal[];
  onMove: (stage: PipelineStage) => void;
  onUpdateNotes: (notes: string) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(prospect.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const industry = industries.find((i) => i.id === prospect.industryId);
  const relatedSignals = signals.filter((s) => prospect.relatedSignals?.includes(s.id));
  const stageIdx = stageOrder.indexOf(prospect.pipelineStage);
  const isTerminal = prospect.pipelineStage === "won" || prospect.pipelineStage === "lost";

  const handleSaveNotes = () => {
    onUpdateNotes(notesDraft);
    setEditingNotes(false);
  };

  return (
    <div className={`rounded-lg border bg-card transition-all ${expanded ? "border-primary/30 shadow-sm" : "border-border hover:border-primary/20"}`}>
      {/* Clickable card header — whole area expands */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{prospect.companyName}</p>
            <p className="text-[10px] text-muted-foreground">{industry?.name}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-sm font-bold text-primary">{prospect.vigylScore}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* Why now snippet */}
        <p className="mt-1.5 text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{prospect.whyNow.split(".")[0]}.</p>

        {/* Related signals */}
        {relatedSignals.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <Radio className="h-2.5 w-2.5 text-primary/50 shrink-0" />
            <span className="text-[9px] text-muted-foreground truncate">
              {relatedSignals.map((s) => s.title.split(" ").slice(0, 4).join(" ")).join(", ")}
            </span>
          </div>
        )}

        {/* Meta row */}
        <div className="mt-2 flex items-center justify-between">
          <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
            prospect.pressureResponse === "growth_mode" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
            prospect.pressureResponse === "contracting" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" :
            "bg-blue-500/15 text-blue-600 dark:text-blue-400"
          }`}>
            {getPressureLabel(prospect.pressureResponse)}
          </span>
          {prospect.lastContacted && (
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              <Calendar className="h-2 w-2" />
              {new Date(prospect.lastContacted).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Notes preview (collapsed) */}
        {!expanded && prospect.notes && (
          <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed line-clamp-1 border-t border-border pt-2 flex items-center gap-1">
            <MessageSquare className="h-2.5 w-2.5 shrink-0" />
            {prospect.notes}
          </p>
        )}
      </button>

      {/* Quick move buttons (collapsed) — outside the expand button to prevent bubbling */}
      {!isTerminal && !expanded && (
        <div className="px-3 pb-3 flex items-center gap-1 border-t border-border pt-2 mx-3">
          {stageIdx > 0 && (
            <button onClick={(e) => { e.stopPropagation(); onMove(stageOrder[stageIdx - 1]); }} className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ChevronLeft className="h-2.5 w-2.5" /> {pipelineStageLabels[stageOrder[stageIdx - 1]]}
            </button>
          )}
          <div className="flex-1" />
          {stageIdx < stageOrder.length - 2 && (
            <button onClick={(e) => { e.stopPropagation(); onMove(stageOrder[stageIdx + 1]); }} className="inline-flex items-center gap-0.5 rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary hover:bg-primary/20 transition-colors">
              {pipelineStageLabels[stageOrder[stageIdx + 1]]} <ChevronRight className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      )}

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-border p-3 space-y-3 bg-accent/20">
          {/* ── PRIMARY OPPORTUNITY ── */}
          <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
            <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Target className="h-3 w-3" /> Primary Opportunity
            </p>
            <p className="text-[11px] text-foreground leading-relaxed font-medium">
              {prospect.pressureResponse === "growth_mode"
                ? `${prospect.companyName} is investing aggressively — lead with competitive advantage and speed to market.`
                : prospect.pressureResponse === "contracting"
                ? `${prospect.companyName} is tightening spend — lead with cost savings and efficiency. Keep proposals lean.`
                : `${prospect.companyName} is investing strategically — show clear ROI with a phased rollout.`}
            </p>
            {relatedSignals[0] && (
              <div className="mt-2 rounded-md bg-card border border-border p-2">
                <p className="text-[9px] text-muted-foreground font-medium mb-0.5">Signal to reference:</p>
                <p className="text-[10px] font-semibold text-foreground leading-snug">{relatedSignals[0].title}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{relatedSignals[0].salesImplication.split(".")[0]}.</p>
              </div>
            )}
          </div>

          {/* ── KEY CONTACT ── */}
          {prospect.decisionMakers[0] && (
            <div className="flex items-center gap-3 rounded-md border border-border bg-card p-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-foreground">{prospect.decisionMakers[0].name}</p>
                <p className="text-[9px] text-muted-foreground">{prospect.decisionMakers[0].title}</p>
              </div>
              {prospect.decisionMakers.length > 1 && (
                <span className="text-[9px] text-muted-foreground shrink-0">+{prospect.decisionMakers.length - 1} more</span>
              )}
            </div>
          )}

          {/* ── COMPANY SNAPSHOT ── */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              {prospect.location.city}, {prospect.location.state}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <DollarSign className="h-2.5 w-2.5 shrink-0" />
              {prospect.annualRevenue}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Users className="h-2.5 w-2.5 shrink-0" />
              {prospect.employeeCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              {prospect.pressureResponse === "growth_mode" ? <TrendingUp className="h-2.5 w-2.5 text-emerald-500" /> :
               prospect.pressureResponse === "contracting" ? <TrendingDown className="h-2.5 w-2.5 text-rose-500" /> :
               <Minus className="h-2.5 w-2.5 text-blue-500" />}
              {getPressureLabel(prospect.pressureResponse)}
            </div>
          </div>

          {/* Additional signals (if more than one) */}
          {relatedSignals.length > 1 && (
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Other Signals ({relatedSignals.length - 1})</p>
              <div className="space-y-1">
                {relatedSignals.slice(1).map(s => (
                  <div key={s.id} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Radio className="h-2 w-2 text-primary/50 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTES ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="h-2.5 w-2.5" /> Notes
              </p>
              {!editingNotes && (
                <button onClick={() => { setEditingNotes(true); setNotesDraft(prospect.notes); }} className="text-[9px] font-medium text-primary hover:text-primary/80">
                  {prospect.notes ? "Edit" : "Add note"}
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-1.5">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this prospect..."
                  className="w-full rounded-md border border-border bg-card px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  autoFocus
                />
                <div className="flex items-center gap-1.5">
                  <button onClick={handleSaveNotes} className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-[9px] font-medium text-primary-foreground hover:opacity-90">
                    <Save className="h-2.5 w-2.5" /> Save
                  </button>
                  <button onClick={() => setEditingNotes(false)} className="rounded px-2 py-1 text-[9px] font-medium text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                {prospect.notes || "No notes yet."}
              </p>
            )}
          </div>

          {/* ── STAGE CONTROLS ── */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">Move to:</p>
            {stageOrder.filter(s => s !== prospect.pipelineStage && s !== "lost").map(stage => (
              <button
                key={stage}
                onClick={() => onMove(stage)}
                className={`rounded-md px-2 py-1 text-[9px] font-medium transition-colors ${
                  stage === "won"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                    : "border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {pipelineStageLabels[stage]}
              </button>
            ))}
            {prospect.pipelineStage !== "lost" && (
              <button
                onClick={() => onMove("lost")}
                className="rounded-md px-2 py-1 text-[9px] font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition-colors ml-auto"
              >
                Mark Lost
              </button>
            )}
          </div>

          {/* ── ACTIONS ── */}
          <div className="flex items-center gap-2 border-t border-border pt-3">
            <Link to={`/outreach?prospect=${prospect.id}`} className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[10px] font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <Mail className="h-3 w-3" /> Outreach
            </Link>
            <Link to={`/prospects/${prospect.id}`} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ExternalLink className="h-3 w-3" /> Full Dossier
            </Link>
            <CrmPushButton prospect={prospect} industryName={industry?.name} variant="compact" />
            <AskArgus
              compact
              context={`Prospect: ${prospect.companyName}\nIndustry: ${industry?.name || "Unknown"}\nVIGYL Score: ${prospect.vigylScore}\nRevenue: ${prospect.annualRevenue}\nEmployees: ${prospect.employeeCount.toLocaleString()}\nLocation: ${prospect.location.city}, ${prospect.location.state}\nPipeline Stage: ${pipelineStageLabels[prospect.pipelineStage]}\nPressure Response: ${getPressureLabel(prospect.pressureResponse)}\nWhy Now: ${prospect.whyNow}\nDecision Makers: ${prospect.decisionMakers.map(d => `${d.name} (${d.title})`).join(", ")}\nNotes: ${prospect.notes || "None"}\nRelated Signals: ${relatedSignals.map(s => s.title).join(", ") || "None"}`}
              label={prospect.companyName}
            />
            <div className="ml-auto">
              {confirmDelete ? (
                <div className="flex items-center gap-1.5 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-2 py-1">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Remove?</span>
                  <button
                    onClick={() => { onDelete(); setConfirmDelete(false); }}
                    className="rounded px-2 py-0.5 text-[10px] font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  title="Remove from pipeline"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Pipeline() {
  const { data } = useIntelligence();
  const { prospects, industries, signals } = data;
  const [localProspects, setLocalProspects] = useState<Prospect[] | null>(null);
  const [dbItems, setDbItems] = useState<any[]>([]);
  const { user, persona } = useAuth();
  const { toast } = useToast();
  const stageLabels = useMemo(() => getStageLabels(persona), [persona]);

  // Load persisted pipeline items from DB
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: items } = await supabase
        .from("pipeline_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as any;
      if (items) setDbItems(items);
    };
    load();
  }, [user]);

  // Convert DB items to Prospect shape for display
  const dbProspects: Prospect[] = useMemo(() => dbItems.map((item: any) => {
    const pd = item.prospect_data || {};
    return {
      id: `db-${item.id}`,
      _dbId: item.id,
      companyName: item.company_name,
      industryId: item.industry_name || "",
      vigylScore: item.vigyl_score || 0,
      pipelineStage: (item.pipeline_stage || "researching") as PipelineStage,
      whyNow: pd.whyNow || "",
      annualRevenue: pd.annualRevenue || "Unknown",
      employeeCount: pd.employeeCount || 0,
      location: pd.location || { city: "", state: "", country: "" },
      pressureResponse: pd.pressureResponse || "selective_investing",
      decisionMakers: pd.decisionMakers || [],
      relatedSignals: [],
      notes: item.notes || "",
      lastContacted: item.last_contacted || undefined,
      isDreamClient: pd.isDreamClient || false,
    } as Prospect & { _dbId: string };
  }), [dbItems]);

  // Merge: DB items + AI-generated items (deduplicate by company name)
  const mergedProspects = useMemo(() => {
    const dbNames = new Set(dbProspects.map(p => p.companyName.toLowerCase()));
    const aiOnly = prospects.filter(p => !dbNames.has(p.companyName.toLowerCase()));
    return [...dbProspects, ...aiOnly];
  }, [dbProspects, prospects]);

  const effectiveProspects = localProspects || mergedProspects;

  const moveProspect = useCallback(async (prospectId: string, newStage: PipelineStage) => {
    const current = (localProspects || mergedProspects).find(p => p.id === prospectId);
    const prevStage = current?.pipelineStage;
    
    setLocalProspects((prev) => {
      const list = prev || [...mergedProspects];
      return list.map((p) => (p.id === prospectId ? { ...p, pipelineStage: newStage } : p));
    });

    // Persist to DB if it's a DB item
    if (prospectId.startsWith("db-")) {
      const dbId = prospectId.replace("db-", "");
      await supabase.from("pipeline_items").update({ pipeline_stage: newStage } as any).eq("id", dbId);
    }

    if (prevStage && prevStage !== newStage) {
      const label = stageLabels[newStage] || pipelineStageLabels[newStage];
      track(EVENTS.PROSPECT_STAGE_CHANGED, { company: current?.companyName, from: prevStage, to: newStage });
      toast({
        title: `Moved to ${label}`,
        description: `${current?.companyName || "Prospect"} → ${label}`,
        action: <ToastAction altText="Undo" onClick={async () => {
          setLocalProspects((prev) => {
            const list = prev || [...mergedProspects];
            return list.map((p) => (p.id === prospectId ? { ...p, pipelineStage: prevStage } : p));
          });
          if (prospectId.startsWith("db-")) {
            const dbId = prospectId.replace("db-", "");
            await supabase.from("pipeline_items").update({ pipeline_stage: prevStage } as any).eq("id", dbId);
          }
        }}>Undo</ToastAction>,
      });
    }
  }, [mergedProspects, localProspects, stageLabels, toast]);

  const updateNotes = useCallback(async (prospectId: string, notes: string) => {
    setLocalProspects((prev) => {
      const list = prev || [...mergedProspects];
      return list.map((p) => (p.id === prospectId ? { ...p, notes } : p));
    });
    // Persist to DB if it's a DB item
    if (prospectId.startsWith("db-")) {
      const dbId = prospectId.replace("db-", "");
      await supabase.from("pipeline_items").update({ notes } as any).eq("id", dbId);
    }
  }, [mergedProspects]);

  const deleteProspect = useCallback(async (prospectId: string) => {
    const current = (localProspects || mergedProspects).find(p => p.id === prospectId);

    // Optimistically remove from UI
    setLocalProspects((prev) => {
      const list = prev || [...mergedProspects];
      return list.filter((p) => p.id !== prospectId);
    });

    // Delete from DB
    if (prospectId.startsWith("db-")) {
      const dbId = prospectId.replace("db-", "");
      await supabase.from("pipeline_items").delete().eq("id", dbId) as any;
    }

    track(EVENTS.PROSPECT_DELETED, { company: current?.companyName });

    toast({
      title: "Removed",
      description: `${current?.companyName || "Prospect"} removed from pipeline.`,
      action: <ToastAction altText="Undo" onClick={async () => {
        // Re-add to local state
        setLocalProspects((prev) => {
          const list = prev || [...mergedProspects];
          if (current) return [...list, current];
          return list;
        });
        // Re-insert to DB
        if (prospectId.startsWith("db-") && current) {
          const dbId = prospectId.replace("db-", "");
          const pd = current as any;
          await supabase.from("pipeline_items").insert({
            id: dbId,
            user_id: user?.id,
            company_name: current.companyName,
            industry_name: current.industryId,
            pipeline_stage: current.pipelineStage,
            vigyl_score: current.vigylScore,
            notes: current.notes || null,
            prospect_data: {
              whyNow: current.whyNow,
              annualRevenue: current.annualRevenue,
              employeeCount: current.employeeCount,
              location: current.location,
              pressureResponse: current.pressureResponse,
              decisionMakers: current.decisionMakers,
              isDreamClient: pd.isDreamClient || false,
            },
          } as any);
        }
      }}>Undo</ToastAction>,
    });
  }, [mergedProspects, localProspects, user, toast]);

  const columns = useMemo(() => stageOrder.map((stage) => ({
    stage,
    label: stageLabels[stage] || pipelineStageLabels[stage],
    prospects: effectiveProspects.filter((p) => p.pipelineStage === stage),
    color: stageColors[stage],
  })), [effectiveProspects, stageLabels]);

  const activeCount = effectiveProspects.filter((p) => !["researching", "won", "lost"].includes(p.pipelineStage)).length;
  const wonCount = effectiveProspects.filter((p) => p.pipelineStage === "won").length;

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{persona.pipelineLabel}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {effectiveProspects.length} total · {activeCount} active · {wonCount} {stageLabels.won?.toLowerCase() || "won"}
            </p>
          </div>
          <Link to="/prospects" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Users className="h-3.5 w-3.5" /> Find {persona.prospectLabel}
          </Link>
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.stage} className="min-w-[260px] flex-1">
              <div className={`flex items-center justify-between mb-2 pb-2 border-t-2 ${col.color} pt-2`}>
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wider">{col.label}</h3>
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-bold text-muted-foreground">
                    {col.prospects.length}
                  </span>
                </div>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {col.prospects.map((p) => (
                  <PipelineCard
                    key={p.id}
                    prospect={p}
                    industries={industries}
                    signals={signals}
                    onMove={(stage) => moveProspect(p.id, stage)}
                    onUpdateNotes={(notes) => updateNotes(p.id, notes)}
                    onDelete={() => deleteProspect(p.id)}
                  />
                ))}
                {col.prospects.length === 0 && (
                  <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-border text-[10px] text-muted-foreground">
                    No prospects
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </IntelligenceLoader>
  );
}
