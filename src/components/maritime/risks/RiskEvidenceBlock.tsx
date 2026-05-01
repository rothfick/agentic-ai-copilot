import { AlertTriangle, Quote, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function RiskEvidenceBlock({
  quote,
  className,
  compact = false,
}: {
  quote?: string;
  className?: string;
  compact?: boolean;
}) {
  if (!quote) {
    return (
      <div
        className={cn(
          "rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning flex items-start gap-2",
          className,
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>No direct source evidence attached — review required.</span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-panel-elevated/40 px-3 py-2",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Quote className="h-3 w-3" /> Source evidence
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-1.5 py-0 text-[10px] font-medium text-success">
          <ShieldCheck className="h-2.5 w-2.5" /> Grounded
        </span>
      </div>
      <p
        className={cn(
          "mono text-foreground/90 leading-snug",
          compact ? "text-[11px] line-clamp-2" : "text-xs",
        )}
      >
        “{quote}”
      </p>
    </div>
  );
}
