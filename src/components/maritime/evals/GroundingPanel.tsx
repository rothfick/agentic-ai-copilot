import { ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroundingStats } from "@/lib/evals";

interface Props {
  data: GroundingStats;
}

export function GroundingPanel({ data }: Props) {
  const tone =
    data.evidenceCoveragePct >= 90
      ? "success"
      : data.evidenceCoveragePct >= 70
        ? "warning"
        : "destructive";

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Hallucination &amp; Grounding
          </h3>
          <p className="text-xs text-muted-foreground">
            Evidence coverage across extracted fields and detected risks.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Coverage
          </div>
          <div
            className={cn(
              "text-2xl font-semibold mono",
              tone === "success" && "text-success",
              tone === "warning" && "text-warning",
              tone === "destructive" && "text-destructive",
            )}
          >
            {data.evidenceCoveragePct}%
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <Stat
          label="Fields with evidence"
          value={`${data.fieldsWithEvidence} / ${data.fieldsTotal}`}
        />
        <Stat
          label="Risks with evidence"
          value={`${data.risksWithEvidence} / ${data.risksTotal}`}
        />
        <Stat
          label="Critic grounding flags"
          value={String(data.criticGroundingFlags)}
          tone={data.criticGroundingFlags > 0 ? "warning" : "default"}
        />
        <Stat
          label="Ungrounded items"
          value={String(data.fieldsWithoutEvidence.length + data.risksWithoutEvidence.length)}
        />
      </div>

      {(data.fieldsWithoutEvidence.length > 0 || data.risksWithoutEvidence.length > 0) && (
        <div className="space-y-3 mb-4">
          {data.fieldsWithoutEvidence.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Fields without evidence
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.fieldsWithoutEvidence.map((l) => (
                  <span
                    key={l}
                    className="text-[11px] rounded border border-warning/40 bg-warning/10 text-warning px-1.5 py-0.5"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.risksWithoutEvidence.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Risks without evidence
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.risksWithoutEvidence.map((l) => (
                  <span
                    key={l}
                    className="text-[11px] rounded border border-warning/40 bg-warning/10 text-warning px-1.5 py-0.5"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
        <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span className="text-muted-foreground">{data.recommendation}</span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "text-lg font-semibold mono mt-0.5",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
    </div>
  );
}
