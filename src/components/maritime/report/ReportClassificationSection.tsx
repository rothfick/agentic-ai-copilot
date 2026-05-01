import { ReportSection } from "./ReportSection";
import { Badge } from "@/components/ui/badge";
import type { MaritimeReport } from "@/lib/report";

export function ReportClassificationSection({ report }: { report: MaritimeReport }) {
  const c = report.classification;
  return (
    <ReportSection
      number="D"
      title="Classification"
      description="Detected document type with model confidence and alternatives."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="text-2xl font-semibold">{c.typeLabel}</div>
        {c.confidence > 0 && (
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
            {Math.round(c.confidence * 100)}% confidence
          </Badge>
        )}
        {c.override && (
          <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
            Manual override
          </Badge>
        )}
      </div>
      {c.alternatives.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono mb-2">
            Alternative hypotheses
          </div>
          <div className="flex flex-wrap gap-2">
            {c.alternatives.map((a) => (
              <Badge key={a.type} variant="outline" className="text-xs">
                {a.type} · {Math.round(a.probability * 100)}%
              </Badge>
            ))}
          </div>
        </div>
      )}
    </ReportSection>
  );
}
