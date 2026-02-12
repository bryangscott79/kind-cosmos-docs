import { useState } from "react";
import { GripVertical, MoreHorizontal, Plus } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { prospects as allProspects, industries, getScoreColor, getPressureColor, getPressureLabel, pipelineStageLabels, PipelineStage, Prospect } from "@/data/mockData";

const stageOrder: PipelineStage[] = ["researching", "contacted", "meeting_scheduled", "proposal_sent", "won", "lost"];

function PipelineCard({ prospect }: { prospect: Prospect }) {
  const industry = industries.find((i) => i.id === prospect.industryId);
  const scoreColor = getScoreColor(prospect.vigylScore);
  const pressureColor = getPressureColor(prospect.pressureResponse);

  return (
    <div className="rounded-md border border-border bg-card p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{prospect.companyName}</p>
          <p className="text-[10px] text-muted-foreground">{industry?.name}</p>
        </div>
        <span className={`font-mono text-sm font-bold text-${scoreColor}`}>{prospect.vigylScore}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium bg-${pressureColor}/10 text-${pressureColor}`}>
          {getPressureLabel(prospect.pressureResponse)}
        </span>
        {prospect.lastContacted && (
          <span className="text-[9px] text-muted-foreground">
            Last: {prospect.lastContacted}
          </span>
        )}
      </div>
      {prospect.notes && (
        <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed line-clamp-2 border-t border-border pt-2">
          {prospect.notes}
        </p>
      )}
    </div>
  );
}

export default function Pipeline() {
  const [prospectsList] = useState(allProspects);

  const columns = stageOrder.map((stage) => ({
    stage,
    label: pipelineStageLabels[stage],
    prospects: prospectsList.filter((p) => p.pipelineStage === stage),
  }));

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track prospects through your sales process
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Prospect
        </button>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.stage} className="min-w-[260px] flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">{col.label}</h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-muted-foreground">
                  {col.prospects.length}
                </span>
              </div>
            </div>
            <div className="space-y-2 rounded-lg bg-secondary/50 p-2 min-h-[200px]">
              {col.prospects.map((p) => (
                <PipelineCard key={p.id} prospect={p} />
              ))}
              {col.prospects.length === 0 && (
                <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                  No prospects
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
