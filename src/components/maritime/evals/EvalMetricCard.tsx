import { ArrowDown, ArrowUp, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvalMetricView } from "@/lib/evals";
import { formatMetricValue } from "@/lib/evals";

const STATUS_TONE = {
  pass: "border-success/40 bg-success/10 text-success",
  warn: "border-warning/40 bg-warning/10 text-warning",
  fail: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;

const STATUS_ICON = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
} as const;

const STATUS_LABEL = {
  pass: "Pass",
  warn: "Warn",
  fail: "Fail",
} as const;

interface Props {
  metric: EvalMetricView;
}

export function EvalMetricCard({ metric }: Props) {
  const Icon = STATUS_ICON[metric.status];
  const DirIcon = metric.direction === "higher_is_better" ? ArrowUp : ArrowDown;
  const targetLabel =
    metric.target !== undefined
      ? formatMetricValue({ value: metric.target, unit: metric.unit })
      : "—";

  return (
    <div className="panel p-4 flex flex-col gap-2 h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {metric.label}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
            STATUS_TONE[metric.status],
          )}
        >
          <Icon className="h-3 w-3" />
          {STATUS_LABEL[metric.status]}
        </span>
      </div>
      <div className="text-2xl font-semibold tracking-tight">
        {formatMetricValue(metric)}
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-0.5">
          <DirIcon className="h-3 w-3" />
          {metric.direction === "higher_is_better" ? "Higher is better" : "Lower is better"}
        </span>
        <span className="opacity-60">·</span>
        <span>Target {targetLabel}</span>
      </div>
      {metric.explanation && (
        <p className="text-xs text-muted-foreground/90 mt-auto pt-1">
          {metric.explanation}
        </p>
      )}
    </div>
  );
}
