import { ReportSection } from "./ReportSection";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MaritimeReport } from "@/lib/report";

export function ReportCriticSection({ report }: { report: MaritimeReport }) {
  const c = report.critic;
  if (!c) {
    return (
      <ReportSection number="K" title="AI Critic Review">
        <div className="text-sm text-muted-foreground">Critic review has not run.</div>
      </ReportSection>
    );
  }
  const open = c.issues.filter((i) => i.status === "open");
  const accepted = c.issues.filter((i) => i.status === "accepted");
  const dismissed = c.issues.filter((i) => i.status === "dismissed");
  const verdictTone =
    c.overallVerdict === "pass"
      ? "border-success/40 bg-success/10 text-success"
      : c.overallVerdict === "fail"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-warning/40 bg-warning/10 text-warning";

  return (
    <ReportSection
      number="K"
      title="AI Critic Review"
      description="Self-review of extraction, risks, and handover quality with a quality gate verdict."
      actions={
        <Badge variant="outline" className={cn("capitalize", verdictTone)}>
          Verdict: {c.overallVerdict}
        </Badge>
      }
    >
      <div className="grid gap-3 grid-cols-3 mb-4">
        <Stat label="Open" value={open.length} tone="warn" />
        <Stat label="Accepted" value={accepted.length} tone="ok" />
        <Stat label="Dismissed" value={dismissed.length} />
      </div>

      {c.issues.length === 0 ? (
        <div className="text-sm text-success">No critic issues raised.</div>
      ) : (
        <ul className="space-y-3">
          {c.issues.map((i) => (
            <li key={i.id} className="rounded-md border border-border bg-card/40 p-3">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] capitalize",
                    i.severity === "critical" && "border-destructive/40 bg-destructive/10 text-destructive",
                    i.severity === "high" && "border-[hsl(var(--high))]/40 bg-[hsl(var(--high))]/10 text-[hsl(var(--high))]",
                    i.severity === "medium" && "border-warning/40 bg-warning/10 text-warning",
                  )}
                >
                  {i.severity}
                </Badge>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {i.section}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] capitalize ml-auto",
                    i.status === "accepted" && "border-success/40 bg-success/10 text-success",
                    i.status === "dismissed" && "border-border text-muted-foreground",
                  )}
                >
                  {i.status}
                </Badge>
              </div>
              <div className="text-sm">{i.message}</div>
              {i.suggestedFix && (
                <div className="text-xs text-muted-foreground mt-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-primary/80 mono mr-2">Fix</span>
                  {i.suggestedFix}
                </div>
              )}
              {i.comment && (
                <div className="text-xs italic mt-1.5 text-foreground/80">
                  Reviewer: {i.comment}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </ReportSection>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" }) {
  return (
    <div
      className={cn(
        "rounded-md border p-3 bg-card/40",
        tone === "ok" && "border-success/30",
        tone === "warn" && "border-warning/30",
        !tone && "border-border",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
        {label}
      </div>
      <div className="text-xl font-semibold mt-1 mono">{value}</div>
    </div>
  );
}
