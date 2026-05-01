import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { SAMPLES } from "@/data/samples";
import { ANALYSIS_FIXTURES } from "@/data/analysisFixtures";
import { getRiskSummaryStats, SEVERITY_LABEL, SEVERITY_TOKENS } from "@/lib/risks";
import { cn } from "@/lib/utils";

const META = [
  { latency: 12.4, cost: 0.094, when: "12 min ago", status: "Passed" },
  { latency: 9.8, cost: 0.071, when: "1 hr ago", status: "Review" },
  { latency: 7.1, cost: 0.062, when: "Yesterday", status: "Passed" },
];

const RUNS = SAMPLES.map((s, i) => {
  const fx = ANALYSIS_FIXTURES[s.id];
  const stats = fx ? getRiskSummaryStats(fx.risks) : null;
  return {
    id: s.id,
    doc: s.title,
    type: s.documentTypeLabel,
    risks: stats?.total ?? s.expectedRiskCount,
    highest: stats?.highestSeverity ?? null,
    ...META[i],
  };
});

export function RecentRunsTable() {
  return (
    <div className="panel overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Recent Analysis Runs</h3>
          <p className="text-xs text-muted-foreground">
            Synthetic runs generated from sample documents.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-panel-elevated/40">
            <tr>
              <th className="text-left font-medium px-5 py-3">Document</th>
              <th className="text-left font-medium px-5 py-3">Type</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-right font-medium px-5 py-3">Risks</th>
              <th className="text-left font-medium px-5 py-3">Top severity</th>
              <th className="text-right font-medium px-5 py-3">Latency</th>
              <th className="text-right font-medium px-5 py-3">Cost</th>
              <th className="text-right font-medium px-5 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {RUNS.map((r) => (
              <tr
                key={r.id}
                className="border-t border-border/60 hover:bg-panel-elevated/30 transition-colors"
              >
                <td className="px-5 py-3">
                  <Link
                    to={`/workspace/${r.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {r.doc}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{r.type}</td>
                <td className="px-5 py-3">
                  {r.status === "Passed" ? (
                    <span className="inline-flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-warning">
                      <AlertTriangle className="h-3.5 w-3.5" /> Review
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right mono">{r.risks}</td>
                <td className="px-5 py-3">
                  {r.highest ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        SEVERITY_TOKENS[r.highest].badge,
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          SEVERITY_TOKENS[r.highest].dot,
                        )}
                      />
                      {SEVERITY_LABEL[r.highest]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right mono">{r.latency}s</td>
                <td className="px-5 py-3 text-right mono">${r.cost.toFixed(3)}</td>
                <td className="px-5 py-3 text-right text-muted-foreground">{r.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
