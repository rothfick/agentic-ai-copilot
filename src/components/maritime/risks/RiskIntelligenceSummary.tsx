import { CheckCircle2, Sparkles, ShieldAlert } from "lucide-react";
import type { RiskItem } from "@/types/analysis";
import { getRiskIntelligence, getRiskSummaryStats } from "@/lib/risks";

export function RiskIntelligenceSummary({ risks }: { risks: RiskItem[] }) {
  const intel = getRiskIntelligence(risks);
  const stats = getRiskSummaryStats(risks);

  return (
    <div className="panel-elevated p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Risk Intelligence Summary</h3>
          <p className="text-[11px] text-muted-foreground">
            Deterministic synthesis from the agent's risk register.
          </p>
        </div>
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed">
        {intel.paragraph}
      </p>

      {intel.topActions.length > 0 && (
        <>
          <div className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            Top recommended actions
          </div>
          <ol className="mt-1.5 space-y-1.5">
            {intel.topActions.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground/90"
              >
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-semibold mono shrink-0">
                  {i + 1}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {intel.approvalNote && (
        <div className="mt-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning flex items-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          {intel.approvalNote}
        </div>
      )}
      {intel.completedNote && (
        <div className="mt-3 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-xs text-success flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {intel.completedNote} {stats.total} item{stats.total === 1 ? "" : "s"} actioned.
        </div>
      )}
    </div>
  );
}
