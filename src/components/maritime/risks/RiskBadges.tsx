import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABEL,
  SEVERITY_LABEL,
  SEVERITY_TOKENS,
  STATUS_LABEL,
  STATUS_TOKENS,
} from "@/lib/risks";
import type {
  RiskCategory,
  RiskReviewStatus,
  RiskSeverity,
} from "@/types/analysis";

const SEV_ICON: Record<RiskSeverity, typeof Info> = {
  critical: AlertOctagon,
  high: ShieldAlert,
  medium: AlertTriangle,
  low: Info,
};

export function RiskSeverityBadge({
  severity,
  className,
  showIcon = true,
}: {
  severity: RiskSeverity;
  className?: string;
  showIcon?: boolean;
}) {
  const Icon = SEV_ICON[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        SEVERITY_TOKENS[severity].badge,
        className,
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function RiskCategoryBadge({
  category,
  className,
}: {
  category: RiskCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-panel-elevated/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
        className,
      )}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

export function RiskStatusBadge({
  status,
  className,
}: {
  status: RiskReviewStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        STATUS_TOKENS[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor(status))} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function dotColor(status: RiskReviewStatus) {
  switch (status) {
    case "open":
      return "bg-muted-foreground";
    case "accepted":
      return "bg-success";
    case "dismissed":
      return "bg-muted-foreground/60";
    case "needs_follow_up":
      return "bg-warning";
  }
}
