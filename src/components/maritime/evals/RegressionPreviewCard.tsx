import { CheckCircle2, AlertTriangle, XCircle, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RegressionPreview } from "@/lib/evals";

const RESULT_LABEL: Record<RegressionPreview["result"], string> = {
  passed: "Passed",
  passed_with_warnings: "Passed with warnings",
  failed: "Failed",
};

const RESULT_TONE: Record<RegressionPreview["result"], string> = {
  passed: "border-success/40 bg-success/10 text-success",
  passed_with_warnings: "border-warning/40 bg-warning/10 text-warning",
  failed: "border-destructive/40 bg-destructive/10 text-destructive",
};

const RESULT_ICON = {
  passed: CheckCircle2,
  passed_with_warnings: AlertTriangle,
  failed: XCircle,
} as const;

interface Props {
  data: RegressionPreview;
}

export function RegressionPreviewCard({ data }: Props) {
  const Icon = RESULT_ICON[data.result];
  return (
    <div className="panel p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            Regression Eval — Golden Set
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{data.sampleTitle}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
            RESULT_TONE[data.result],
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {RESULT_LABEL[data.result]}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Expected risks ({data.expectedRiskCount})
          </div>
          <ul className="space-y-1.5">
            {data.expectedRisks.map((r) => (
              <li key={r.title} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground mono text-[11px] uppercase mt-0.5">
                  {r.severity}
                </span>
                <span>{r.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Detected risks ({data.detectedRiskCount})
          </div>
          {data.detectedRisks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No risks detected yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {data.detectedRisks.map((r) => (
                <li key={r.title} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground mono text-[11px] uppercase mt-0.5">
                    {r.severity}
                  </span>
                  <span>{r.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 mb-4">
        <Mini label="Required fields" value={String(data.requiredFields)} />
        <Mini label="Missing fields" value={String(data.missingFields.length)} />
        <Mini label="Schema status" value={data.schemaStatus.replace(/_/g, " ")} />
      </div>

      {data.missingFields.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Missing fields
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.missingFields.map((f) => (
              <span
                key={f}
                className="text-[11px] rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <ul className="text-sm space-y-1 text-muted-foreground">
        {data.notes.map((n, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold capitalize mt-0.5">{value}</div>
    </div>
  );
}
