import { ReportSection } from "./ReportSection";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MaritimeReport } from "@/lib/report";
import type { RiskItem, RiskSeverity } from "@/types/analysis";
import { CATEGORY_LABEL, SEVERITY_LABEL, SEVERITY_RANK } from "@/lib/risks";

const SEVERITY_TONE: Record<RiskSeverity, string> = {
  critical: "border-destructive/50 bg-destructive/10 text-destructive",
  high: "border-[hsl(var(--high))]/50 bg-[hsl(var(--high))]/10 text-[hsl(var(--high))]",
  medium: "border-warning/50 bg-warning/10 text-warning",
  low: "border-border bg-muted/40 text-muted-foreground",
};

export function ReportRiskRegister({ report }: { report: MaritimeReport }) {
  const sorted = [...report.risks].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  );
  return (
    <ReportSection
      number="G"
      title="Risk Register"
      description={`${report.risks.length} risk${report.risks.length === 1 ? "" : "s"} detected · severity-ranked`}
    >
      {sorted.length === 0 ? (
        <div className="text-sm text-success">No risks detected for this document.</div>
      ) : (
        <div className="space-y-4">
          {sorted.map((r, idx) => (
            <RiskRow key={r.id} risk={r} idx={idx + 1} />
          ))}
        </div>
      )}
    </ReportSection>
  );
}

function RiskRow({ risk, idx }: { risk: RiskItem; idx: number }) {
  const status = risk.status ?? "open";
  return (
    <div className="rounded-md border border-border p-4 bg-card/40 break-inside-avoid">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="mono text-[10px] text-muted-foreground">G.{idx}</span>
        <Badge variant="outline" className={cn("text-[10px]", SEVERITY_TONE[risk.severity])}>
          {SEVERITY_LABEL[risk.severity]}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {CATEGORY_LABEL[risk.category]}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] capitalize",
            status === "accepted" && "border-success/40 bg-success/10 text-success",
            status === "dismissed" && "border-border text-muted-foreground",
            status === "needs_follow_up" && "border-warning/40 bg-warning/10 text-warning",
          )}
        >
          {status.replace(/_/g, " ")}
        </Badge>
        <span className="ml-auto mono text-[10px] text-muted-foreground">
          {Math.round(risk.confidence * 100)}% conf.
        </span>
      </div>
      <div className="text-sm font-medium">{risk.title}</div>
      <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
      <div className="grid gap-2 sm:grid-cols-2 mt-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono mb-0.5">
            Business impact
          </div>
          <div className="text-foreground/90">{risk.businessImpact}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono mb-0.5">
            Recommended action
          </div>
          <div className="text-foreground/90">{risk.recommendedAction}</div>
        </div>
      </div>
      {risk.evidenceQuote && (
        <blockquote className="mt-3 border-l-2 border-primary/40 pl-3 mono text-xs text-foreground/80 bg-card/60 py-1.5">
          “{risk.evidenceQuote}”
        </blockquote>
      )}
      {risk.reviewerComment && (
        <div className="mt-2 text-xs text-foreground/80 italic">
          Reviewer comment: {risk.reviewerComment}
        </div>
      )}
    </div>
  );
}
