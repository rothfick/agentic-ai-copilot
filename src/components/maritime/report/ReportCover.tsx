import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  STATUS_LABEL,
  RECOMMENDATION_LABEL,
  type MaritimeReport,
  type ReportStatus,
} from "@/lib/report";
import { ShieldCheck, AlertTriangle, FileWarning, CheckCircle2 } from "lucide-react";

const STATUS_TONES: Record<ReportStatus, { className: string; icon: any }> = {
  draft: { className: "border-border text-muted-foreground bg-muted/30", icon: FileWarning },
  human_review_required: {
    className: "border-warning/40 bg-warning/10 text-warning",
    icon: AlertTriangle,
  },
  approved: { className: "border-primary/40 bg-primary/10 text-primary", icon: ShieldCheck },
  export_ready: {
    className: "border-success/40 bg-success/10 text-success",
    icon: CheckCircle2,
  },
};

export function ReportCover({ report }: { report: MaritimeReport }) {
  const tone = STATUS_TONES[report.status];
  const Icon = tone.icon;
  const generated = new Date(report.meta.generatedAt).toLocaleString();
  return (
    <div className="report-cover panel p-8 md:p-10">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.25em] text-primary/80 mb-2 mono">
            MaritimeOps AI · Analysis Report
          </div>
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight leading-tight">
            {report.document.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {report.document.description}
          </p>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <CoverField label="Document Type" value={report.document.typeLabel} />
            <CoverField label="Run ID" value={report.run.runId} mono />
            <CoverField label="Generated" value={generated} />
            <CoverField
              label="Source"
              value={report.meta.source === "live_run" ? "Live Run" : "Demo Fixture"}
            />
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
          <Badge
            variant="outline"
            className={cn("gap-1.5 text-xs px-2.5 py-1", tone.className)}
          >
            <Icon className="h-3.5 w-3.5" />
            {STATUS_LABEL[report.status]}
          </Badge>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              Recommended decision
            </div>
            <div className="text-sm font-medium mt-0.5">
              {RECOMMENDATION_LABEL[report.recommendation]}
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground italic max-w-[180px] text-right">
            Synthetic data — portfolio demo. No real LLM calls were made.
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
        {label}
      </div>
      <div className={cn("mt-1 text-sm", mono && "mono text-foreground/90 truncate")}>
        {value}
      </div>
    </div>
  );
}
