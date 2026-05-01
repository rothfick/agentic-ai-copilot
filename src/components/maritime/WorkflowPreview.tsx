import { cn } from "@/lib/utils";

export const WORKFLOW_STEPS = [
  "ingest",
  "classify",
  "extract",
  "validate",
  "risks",
  "handover",
  "critic",
  "evals",
] as const;

export type WorkflowStep = (typeof WORKFLOW_STEPS)[number];
export type StepStatus = "idle" | "running" | "done" | "error";

export function WorkflowPreview({
  active,
  statuses,
  compact,
}: {
  active?: WorkflowStep;
  statuses?: Partial<Record<WorkflowStep, StepStatus>>;
  compact?: boolean;
}) {
  return (
    <div className="panel p-4 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max">
        {WORKFLOW_STEPS.map((step, i) => {
          const status = statuses?.[step] ?? "idle";
          const isActive = active === step;
          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-md border text-xs font-medium transition-colors",
                  status === "done" &&
                    "border-success/40 bg-success/10 text-success",
                  status === "running" &&
                    "border-primary/50 bg-primary/10 text-primary animate-pulse",
                  status === "error" &&
                    "border-destructive/50 bg-destructive/10 text-destructive",
                  status === "idle" &&
                    "border-border bg-panel-elevated text-muted-foreground",
                  isActive && "ring-1 ring-primary/40"
                )}
              >
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="ml-2 capitalize">{step}</span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px w-6",
                    compact ? "w-3" : "w-6",
                    "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
