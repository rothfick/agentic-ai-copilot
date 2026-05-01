import { cn } from "@/lib/utils";

export function MetricPreviewCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "primary";
}) {
  const toneStyles = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    primary: "text-primary",
  } as const;
  return (
    <div className="panel p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-2 text-xl font-semibold mono", toneStyles[tone])}>
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
