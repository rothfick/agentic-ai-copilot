import { Timer, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LatencyBreakdown } from "@/lib/evals";
import { formatMs } from "@/lib/evals";

interface Props {
  data: LatencyBreakdown;
}

export function LatencyBreakdownCard({ data }: Props) {
  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            Latency Breakdown
          </h3>
          <p className="text-xs text-muted-foreground">
            Total {formatMs(data.totalMs)} across {data.rows.length} workflow nodes.
          </p>
        </div>
      </div>
      {data.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No completed steps yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.rows.map((row) => (
            <li key={row.node} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={cn(
                    "flex items-center gap-1.5 font-medium",
                    row.isSlowest ? "text-warning" : "text-foreground",
                  )}
                >
                  {row.isSlowest && <Flame className="h-3 w-3" />}
                  {row.label}
                </span>
                <span className="mono text-muted-foreground">
                  {formatMs(row.durationMs)} · {row.pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    row.isSlowest ? "bg-warning" : "bg-primary",
                  )}
                  style={{ width: `${Math.max(2, row.pct)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
