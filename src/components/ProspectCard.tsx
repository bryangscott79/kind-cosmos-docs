import { Link } from "react-router-dom";
import { Users, Linkedin, ArrowUpRight } from "lucide-react";
import { Prospect, industries, getPressureLabel, getPressureColor, getScoreColor } from "@/data/mockData";

interface ProspectCardProps {
  prospect: Prospect;
}

export default function ProspectCard({ prospect }: ProspectCardProps) {
  const industry = industries.find((i) => i.id === prospect.industryId);
  const scoreColor = getScoreColor(prospect.vigylScore);
  const pressureColor = getPressureColor(prospect.pressureResponse);

  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{prospect.companyName}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{industry?.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`font-mono text-xl font-bold text-${scoreColor}`}>
            {prospect.vigylScore}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-${pressureColor}/10 text-${pressureColor} border border-${pressureColor}/20`}>
            {getPressureLabel(prospect.pressureResponse)}
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-secondary p-3">
        <p className="text-xs font-medium text-foreground mb-1">Why Now</p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {prospect.whyNow}
        </p>
      </div>

      {prospect.decisionMakers.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Decision Makers</p>
          <div className="space-y-1">
            {prospect.decisionMakers.slice(0, 2).map((dm) => (
              <div key={dm.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{dm.name}</span>
                  <span className="text-[10px] text-muted-foreground">· {dm.title}</span>
                </div>
                <Linkedin className="h-3 w-3 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Link
          to={`/outreach?prospect=${prospect.id}`}
          className="flex-1 rounded-md bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-1.5 text-center text-xs font-medium text-white transition-opacity hover:opacity-90"
        >
          Generate Outreach
        </Link>
        <button className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
          Add to Pipeline
        </button>
      </div>
    </div>
  );
}
