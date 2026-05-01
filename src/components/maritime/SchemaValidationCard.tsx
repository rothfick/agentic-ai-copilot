import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ValidationReport } from "@/lib/extraction";
import type { SchemaMeta } from "@/lib/extraction";

interface Props {
  schema: SchemaMeta;
  report: ValidationReport;
}

const STATUS_META = {
  pass: {
    label: "Pass",
    classes: "border-success/30 bg-success/10 text-success",
    icon: ShieldCheck,
  },
  warnings: {
    label: "Pass with warnings",
    classes: "border-warning/30 bg-warning/10 text-warning",
    icon: AlertTriangle,
  },
  needs_review: {
    label: "Needs review",
    classes: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: XCircle,
  },
  pending: {
    label: "Pending",
    classes: "border-border text-muted-foreground",
    icon: AlertTriangle,
  },
} as const;

export function SchemaValidationCard({ schema, report }: Props) {
  const meta = STATUS_META[report.status];
  const Icon = meta.icon;
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Schema Validation
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="mono text-sm">{schema.schemaName}</span>
            <span className="mono text-[11px] text-muted-foreground">
              v{schema.schemaVersion}
            </span>
          </div>
        </div>
        <Badge variant="outline" className={cn("flex items-center gap-1", meta.classes)}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-md border border-border bg-panel-elevated/40 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Fields checked
          </div>
          <div className="mt-0.5 text-base font-semibold">
            {report.fieldsChecked}
          </div>
        </div>
        <div className="rounded-md border border-border bg-panel-elevated/40 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Issues
          </div>
          <div
            className={cn(
              "mt-0.5 text-base font-semibold",
              report.issuesFound > 0 ? "text-warning" : "text-success"
            )}
          >
            {report.issuesFound}
          </div>
        </div>
        <div className="rounded-md border border-border bg-panel-elevated/40 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Critical missing
          </div>
          <div
            className={cn(
              "mt-0.5 text-base font-semibold",
              report.missingCritical.length > 0
                ? "text-destructive"
                : "text-success"
            )}
          >
            {report.missingCritical.length}
          </div>
        </div>
      </div>

      <ul className="space-y-1.5">
        {report.checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2 text-xs">
            {c.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <div
                className={cn(
                  "font-medium",
                  c.passed ? "text-foreground" : "text-warning"
                )}
              >
                {c.label}
              </div>
              {c.detail && (
                <div className="text-muted-foreground">{c.detail}</div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {report.lastValidatedAt && (
        <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground">
          Last validated: {new Date(report.lastValidatedAt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
