import { Check, Loader2, Circle, AlertTriangle, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalysisStep } from "@/types/analysis";

function fmtMs(ms?: number) {
  if (ms === undefined) return null;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function fmtCost(c?: number) {
  if (c === undefined) return null;
  if (c === 0) return "$0.00";
  return `$${c.toFixed(4)}`;
}

export function WorkflowStepper({
  steps,
  currentIndex,
}: {
  steps: AnalysisStep[];
  currentIndex: number;
}) {
  return (
    <div className="panel p-4">
      <div className="grid gap-2 md:grid-cols-1">
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex && step.status === "running";
          const Icon =
            step.status === "done"
              ? Check
              : step.status === "running"
              ? Loader2
              : step.status === "error"
              ? AlertTriangle
              : step.node === "human_review"
              ? Hourglass
              : Circle;
          return (
            <div
              key={step.node}
              className={cn(
                "relative flex items-start gap-3 rounded-lg border p-3 transition-colors",
                step.status === "done" &&
                  "border-success/30 bg-success/5",
                step.status === "running" &&
                  "border-primary/40 bg-primary/5",
                step.status === "error" &&
                  "border-destructive/40 bg-destructive/5",
                step.status === "idle" &&
                  "border-border bg-panel-elevated/50",
                isCurrent && "ring-1 ring-primary/40"
              )}
            >
              <div
                className={cn(
                  "h-7 w-7 shrink-0 rounded-md flex items-center justify-center border",
                  step.status === "done" &&
                    "bg-success/15 border-success/40 text-success",
                  step.status === "running" &&
                    "bg-primary/15 border-primary/40 text-primary",
                  step.status === "error" &&
                    "bg-destructive/15 border-destructive/40 text-destructive",
                  step.status === "idle" &&
                    "bg-panel-elevated border-border text-muted-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    step.status === "running" && "animate-spin"
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="mono text-[10px] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {step.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden md:inline">
                      {step.node}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mono text-[11px] text-muted-foreground shrink-0">
                    {step.durationMs !== undefined && (
                      <span>{fmtMs(step.durationMs)}</span>
                    )}
                    {step.tokens !== undefined && step.tokens > 0 && (
                      <span>{step.tokens} tok</span>
                    )}
                    {step.costUsd !== undefined && step.costUsd > 0 && (
                      <span>{fmtCost(step.costUsd)}</span>
                    )}
                    {step.confidence !== undefined && (
                      <span className="text-foreground/80">
                        {Math.round(step.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
