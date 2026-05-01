import { ReportSection } from "./ReportSection";
import type { MaritimeReport } from "@/lib/report";
import { AlertTriangle } from "lucide-react";

export function ReportMissingFields({ report }: { report: MaritimeReport }) {
  const missing = report.missingFields;
  return (
    <ReportSection
      number="F"
      title="Missing Fields"
      description="Required fields not populated. Each carries operational implications."
    >
      {missing.length === 0 ? (
        <div className="text-sm text-success">All required fields are populated.</div>
      ) : (
        <ul className="space-y-3">
          {missing.map((m) => (
            <li
              key={m.key}
              className="rounded-md border border-warning/30 bg-warning/5 p-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.why}</div>
                  <div className="text-xs text-foreground/80 mt-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-primary/80 mono mr-2">
                      Action
                    </span>
                    {m.recommendedAction}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ReportSection>
  );
}
