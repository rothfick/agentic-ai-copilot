import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Pencil,
  Database,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractionSummary } from "@/lib/extraction";

interface Props {
  summary: ExtractionSummary;
}

const cards = [
  { key: "required", label: "Required Fields", icon: Database, tone: "default" as const },
  { key: "completed", label: "Completed", icon: CheckCircle2, tone: "success" as const },
  { key: "missing", label: "Missing", icon: AlertCircle, tone: "danger" as const },
  { key: "lowConfidence", label: "Low Confidence", icon: AlertTriangle, tone: "warning" as const },
  { key: "edited", label: "Human Edited", icon: Pencil, tone: "secondary" as const },
  { key: "overall", label: "Overall Confidence", icon: Gauge, tone: "primary" as const },
];

const TONE_CLASSES: Record<string, { ring: string; icon: string; value: string }> = {
  default: {
    ring: "border-border",
    icon: "bg-panel-elevated border-border text-muted-foreground",
    value: "text-foreground",
  },
  success: {
    ring: "border-success/30",
    icon: "bg-success/10 border-success/30 text-success",
    value: "text-success",
  },
  danger: {
    ring: "border-destructive/30",
    icon: "bg-destructive/10 border-destructive/30 text-destructive",
    value: "text-destructive",
  },
  warning: {
    ring: "border-warning/30",
    icon: "bg-warning/10 border-warning/30 text-warning",
    value: "text-warning",
  },
  secondary: {
    ring: "border-secondary/30",
    icon: "bg-secondary/10 border-secondary/30 text-secondary",
    value: "text-secondary",
  },
  primary: {
    ring: "border-primary/30",
    icon: "bg-primary/10 border-primary/30 text-primary",
    value: "text-primary",
  },
};

export function ExtractionSummaryCards({ summary }: Props) {
  const values: Record<string, string> = {
    required: String(summary.required),
    completed: String(summary.completed),
    missing: String(summary.missing),
    lowConfidence: String(summary.lowConfidence),
    edited: String(summary.edited),
    overall: `${Math.round(summary.overallConfidence * 100)}%`,
  };
  const hints: Record<string, string> = {
    required: `${summary.total} extracted`,
    completed: `${summary.confirmed} confirmed`,
    missing: summary.missing > 0 ? "Review needed" : "None",
    lowConfidence: summary.lowConfidence > 0 ? "< 0.75 score" : "All calibrated",
    edited: summary.edited > 0 ? "Tracked" : "Untouched",
    overall: "Schema-weighted",
  };
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => {
        const tone = TONE_CLASSES[c.tone];
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className={cn("panel p-4 flex items-start gap-3", tone.ring)}
          >
            <div
              className={cn(
                "h-9 w-9 rounded-md flex items-center justify-center border shrink-0",
                tone.icon
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {c.label}
              </div>
              <div className={cn("mt-0.5 text-lg font-semibold", tone.value)}>
                {values[c.key]}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
                {hints[c.key]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
