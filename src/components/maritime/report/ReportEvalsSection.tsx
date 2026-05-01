import { ReportSection } from "./ReportSection";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMetricValue, formatMs, formatUsd, getEvalStatus } from "@/lib/evals";
import type { MaritimeReport } from "@/lib/report";

export function ReportEvalsSection({ report }: { report: MaritimeReport }) {
  const { qualityScore, metrics } = report.evals;

  return (
    <ReportSection
      number="L"
      title="Evaluation Metrics"
      description="Automated quality, grounding, and cost metrics computed by the eval harness."
      actions={
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            qualityScore.score >= 90
              ? "border-success/40 bg-success/10 text-success"
              : qualityScore.score >= 80
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-warning/40 bg-warning/10 text-warning",
          )}
        >
          Quality {qualityScore.score} · Grade {qualityScore.grade}
        </Badge>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">{qualityScore.explanation}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => {
          const status = getEvalStatus(m);
          return (
            <div
              key={m.key}
              className={cn(
                "rounded-md border p-3 bg-card/40",
                status === "pass" && "border-success/30",
                status === "warn" && "border-warning/30",
                status === "fail" && "border-destructive/30",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
                  {m.label}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] capitalize",
                    status === "pass" && "border-success/40 text-success",
                    status === "warn" && "border-warning/40 text-warning",
                    status === "fail" && "border-destructive/40 text-destructive",
                  )}
                >
                  {status}
                </Badge>
              </div>
              <div className="mono text-base mt-1">{formatMetricValue(m)}</div>
              {m.target !== undefined && (
                <div className="text-[10px] text-muted-foreground mt-0.5 mono">
                  target {formatMetricValue({ value: m.target, unit: m.unit })} ·{" "}
                  {m.direction === "higher_is_better" ? "↑ better" : "↓ better"}
                </div>
              )}
            </div>
          );
        })}
        <div className="rounded-md border border-border p-3 bg-card/40">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            Latency (total)
          </div>
          <div className="mono text-base mt-1">{formatMs(report.run.totalLatencyMs)}</div>
        </div>
        <div className="rounded-md border border-border p-3 bg-card/40">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
            Token Cost
          </div>
          <div className="mono text-base mt-1">{formatUsd(report.run.totalCostUsd, 4)}</div>
        </div>
      </div>
    </ReportSection>
  );
}
