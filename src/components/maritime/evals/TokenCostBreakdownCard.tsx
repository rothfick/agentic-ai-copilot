import { Coins, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CostBreakdown } from "@/lib/evals";
import { formatUsd } from "@/lib/evals";

interface Props {
  data: CostBreakdown;
}

export function TokenCostBreakdownCard({ data }: Props) {
  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            Token & Cost Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">
            {data.totalTokens.toLocaleString()} tokens · {formatUsd(data.totalCostUsd, 4)} per
            document
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Est. per 100 docs</div>
          <div className="text-base font-semibold mono inline-flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-secondary" />
            {formatUsd(data.estimatedCostPer100Docs, 2)}
          </div>
        </div>
      </div>

      {data.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cost data yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-left">
                <th className="py-2 pr-4 font-medium">Step</th>
                <th className="py-2 pr-4 font-medium text-right">Tokens</th>
                <th className="py-2 pr-4 font-medium text-right">Cost</th>
                <th className="py-2 font-medium text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.node} className="border-t border-border/60">
                  <td
                    className={cn(
                      "py-2 pr-4",
                      r.isMostExpensive && "text-warning font-medium",
                    )}
                  >
                    {r.label}
                    {r.isMostExpensive && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider rounded border border-warning/40 bg-warning/10 px-1 py-0.5">
                        Top spend
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 mono text-right text-muted-foreground">
                    {r.tokens.toLocaleString()}
                  </td>
                  <td className="py-2 pr-4 mono text-right">{formatUsd(r.costUsd, 4)}</td>
                  <td className="py-2 mono text-right text-muted-foreground">
                    {r.pct.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-3 italic">
        Simulated provider pricing — replace with real provider usage in production.
      </p>
    </div>
  );
}
