import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, ChevronRight, ChevronLeft, ArrowRight, Users, Radio, Calendar, MessageSquare, MoreHorizontal } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import IntelligenceLoader from "@/components/IntelligenceLoader";
import { useIntelligence } from "@/contexts/IntelligenceContext";
import { getScoreColor, getPressureColor, getPressureLabel, pipelineStageLabels, PipelineStage, Prospect } from "@/data/mockData";

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
  onMoveForward,
  onMoveBack,
}: {
  prospect: Prospect;
  industries: any[];
  signals: any[];
  onMoveForward: () => void;
  onMoveBack: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const industry = industries.find((i) => i.id === prospect.industryId);
  const relatedSignals = signals.filter((s) => prospect.relatedSignals?.includes(s.id));
  const stageIdx = stageOrder.indexOf(prospect.pipelineStage);
  const canMoveForward = stageIdx < stageOrder.length - 2; // not won/lost
  const canMoveBack = stageIdx > 0 && prospect.pipelineStage !== "won" && prospect.pipelineStage !== "lost";

  return (
    <div className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{prospect.companyName}</p>
          <p className="text-[10px] text-muted-foreground">{industry?.name}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-mono text-sm font-bold text-primary">{prospect.vigylScore}</span>
          <button
            onClick={() => setShowActions(!showActions)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
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

      {/* Meta */}
      <div className="mt-2 flex items-center justify-between">
        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-${getPressureColor(prospect.pressureResponse)}/10 text-${getPressureColor(prospect.pressureResponse)}`}>
          {getPressureLabel(prospect.pressureResponse)}
        </span>
        {prospect.lastContacted && (
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <Calendar className="h-2 w-2" />
            {new Date(prospect.lastContacted).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {/* Notes */}
      {prospect.notes && (
        <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed line-clamp-1 border-t border-border pt-2 flex items-center gap-1">
          <MessageSquare className="h-2.5 w-2.5 shrink-0" />
          {prospect.notes}
        </p>
      )}

      {/* Stage actions */}
      {showActions && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2">
          {canMoveBack && (
            <button
              onClick={onMoveBack}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-2.5 w-2.5" />
              {pipelineStageLabels[stageOrder[stageIdx - 1]]}
            </button>
          )}
          {canMoveForward && (
            <button
              onClick={onMoveForward}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              {pipelineStageLabels[stageOrder[stageIdx + 1]]}
              <ChevronRight className="h-2.5 w-2.5" />
            </button>
          )}
          {prospect.pipelineStage !== "won" && prospect.pipelineStage !== "lost" && (
            <>
              <div className="flex-1" />
              <button
                onClick={() => {/* TODO: move to won */}}
                className="rounded-md px-2 py-1 text-[10px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                Won
              </button>
              <button
                onClick={() => {/* TODO: move to lost */}}
                className="rounded-md px-2 py-1 text-[10px] font-medium text-rose-500 hover:bg-rose-50 transition-colors"
              >
                Lost
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Pipeline() {
  const { data } = useIntelligence();
  const { prospects, industries, signals } = data;
  const [localProspects, setLocalProspects] = useState<Prospect[] | null>(null);

  const effectiveProspects = localProspects || prospects;

  const moveProspect = useCallback((prospectId: string, newStage: PipelineStage) => {
    setLocalProspects((prev) => {
      const list = prev || [...prospects];
      return list.map((p) => (p.id === prospectId ? { ...p, pipelineStage: newStage } : p));
    });
  }, [prospects]);

  const columns = useMemo(() => stageOrder.map((stage) => ({
    stage,
    label: pipelineStageLabels[stage],
    prospects: effectiveProspects.filter((p) => p.pipelineStage === stage),
    color: stageColors[stage],
  })), [effectiveProspects]);

  // Pipeline stats
  const activeCount = effectiveProspects.filter((p) => !["researching", "won", "lost"].includes(p.pipelineStage)).length;
  const wonCount = effectiveProspects.filter((p) => p.pipelineStage === "won").length;
  const totalValue = effectiveProspects.filter((p) => p.pipelineStage === "won").reduce((sum, p) => sum + p.vigylScore, 0);

  return (
    <IntelligenceLoader>
      <DashboardLayout>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Pipeline</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {effectiveProspects.length} prospects · {activeCount} active · {wonCount} won
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/prospects"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Users className="h-3.5 w-3.5" /> Find Prospects
            </Link>
          </div>
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.stage} className="min-w-[240px] flex-1">
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
                    onMoveForward={() => {
                      const idx = stageOrder.indexOf(p.pipelineStage);
                      if (idx < stageOrder.length - 2) moveProspect(p.id, stageOrder[idx + 1]);
                    }}
                    onMoveBack={() => {
                      const idx = stageOrder.indexOf(p.pipelineStage);
                      if (idx > 0) moveProspect(p.id, stageOrder[idx - 1]);
                    }}
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
