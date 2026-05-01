import { ReportSection } from "./ReportSection";
import type { MaritimeReport } from "@/lib/report";
import { RECOMMENDATION_LABEL } from "@/lib/report";

export function ReportExecutiveSummary({ report }: { report: MaritimeReport }) {
  return (
    <ReportSection
      number="A"
      title="Executive Summary"
      description="High-level synthesis for operations leadership."
    >
      <p className="text-sm leading-relaxed text-foreground/90">
        {report.executiveSummary}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            Recommended decision
          </div>
          <div className="text-sm mt-1">{RECOMMENDATION_LABEL[report.recommendation]}</div>
        </div>
        <div className="rounded-md border border-border bg-card/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            Open items
          </div>
          <div className="text-sm mt-1">
            {report.humanReview.risksOpen} open risks · {report.humanReview.criticOpen}{" "}
            open critic issues · {report.extraction.summary.missing} missing fields
          </div>
        </div>
      </div>
    </ReportSection>
  );
}
