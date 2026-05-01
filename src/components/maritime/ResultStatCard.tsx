import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResultStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  return (
    <div
      className={cn(
        "panel p-4 flex items-start gap-3 transition-colors",
        tone === "primary" && "border-primary/30",
        tone === "success" && "border-success/30",
        tone === "warning" && "border-warning/30",
        tone === "danger" && "border-destructive/30"
      )}
    >
      {Icon && (
        <div
          className={cn(
            "h-9 w-9 rounded-md flex items-center justify-center border shrink-0",
            tone === "default" &&
              "bg-panel-elevated border-border text-muted-foreground",
            tone === "primary" && "bg-primary/10 border-primary/30 text-primary",
            tone === "success" && "bg-success/10 border-success/30 text-success",
            tone === "warning" && "bg-warning/10 border-warning/30 text-warning",
            tone === "danger" &&
              "bg-destructive/10 border-destructive/30 text-destructive"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-lg font-semibold truncate">{value}</div>
        {hint && (
          <div className="mt-0.5 text-xs text-muted-foreground truncate">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
