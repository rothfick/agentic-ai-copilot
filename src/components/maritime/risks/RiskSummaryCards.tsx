import {
  AlertOctagon,
  CheckCircle2,
  Gauge,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskSummaryStats } from "@/lib/risks";

function Card({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "primary" | "warning" | "danger" | "success";
}) {
  const toneCls =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : tone === "primary"
            ? "text-primary"
            : "text-foreground";
  const bgCls =
    tone === "danger"
      ? "bg-destructive/10"
      : tone === "warning"
        ? "bg-warning/10"
        : tone === "success"
          ? "bg-success/10"
          : tone === "primary"
            ? "bg-primary/10"
            : "bg-panel-elevated/50";
  return (
    <div className="panel p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div
          className={cn(
            "h-7 w-7 rounded-md flex items-center justify-center",
            bgCls,
            toneCls,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className={cn("mt-1.5 text-2xl font-semibold mono", toneCls)}>
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

export function RiskSummaryCards({ stats }: { stats: RiskSummaryStats }) {
  const criticalHigh = stats.critical + stats.high;
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <Card
        label="Total Risks"
        value={stats.total}
        icon={ShieldAlert}
        tone={stats.total > 0 ? "primary" : "default"}
      />
      <Card
        label="Critical / High"
        value={criticalHigh}
        hint={`${stats.critical} critical · ${stats.high} high`}
        icon={AlertOctagon}
        tone={criticalHigh > 0 ? "danger" : "default"}
      />
      <Card
        label="Medium"
        value={stats.medium}
        icon={ShieldAlert}
        tone={stats.medium > 0 ? "warning" : "default"}
      />
      <Card
        label="Low"
        value={stats.low}
        icon={ShieldCheck}
        tone="default"
      />
      <Card
        label="Avg Confidence"
        value={stats.total > 0 ? `${Math.round(stats.avgConfidence * 100)}%` : "—"}
        hint="Across all risks"
        icon={Gauge}
        tone={stats.avgConfidence >= 0.85 ? "success" : "default"}
      />
      <Card
        label="Review Status"
        value={`${stats.open}`}
        hint={`${stats.accepted} acc · ${stats.dismissed} dis · ${stats.needsFollowUp} f/up`}
        icon={stats.open === 0 && stats.total > 0 ? CheckCircle2 : ListChecks}
        tone={stats.open === 0 && stats.total > 0 ? "success" : "primary"}
      />
    </div>
  );
}

// Re-export so consumers can pull from a single place.
export { XCircle };
