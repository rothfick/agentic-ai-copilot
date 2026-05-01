import { ReportSection } from "./ReportSection";
import { Badge } from "@/components/ui/badge";
import type { MaritimeReport } from "@/lib/report";
import { CheckCircle2, Circle } from "lucide-react";

export function ReportHandoverSection({ report }: { report: MaritimeReport }) {
  const h = report.handover;
  if (!h) {
    return (
      <ReportSection number="H" title="Operational Handover">
        <div className="text-sm text-muted-foreground">Handover has not been generated.</div>
      </ReportSection>
    );
  }
  const content = h.editedMarkdown ?? h.markdown;
  const completed = new Set(h.completedActionIds ?? []);
  return (
    <ReportSection
      number="H"
      title="Operational Handover"
      description="Operator-ready handover briefing produced by the agent and (optionally) edited by a human reviewer."
      actions={
        h.approved ? (
          <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
            Approved
          </Badge>
        ) : h.userEdited ? (
          <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
            Edited · pending approval
          </Badge>
        ) : (
          <Badge variant="outline" className="border-border text-muted-foreground">
            Draft
          </Badge>
        )
      }
    >
      <pre className="mono text-xs whitespace-pre-wrap leading-relaxed text-foreground/90 bg-card/40 border border-border rounded-md p-4 max-h-[480px] overflow-auto print:max-h-none print:overflow-visible">
        {content}
      </pre>

      {h.nextActions && h.nextActions.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mono mb-2">
            Section I · Action Checklist
          </div>
          <ul className="space-y-1.5">
            {h.nextActions.map((a, i) => {
              const id = `action_${i}`;
              const done = completed.has(id) || completed.has(String(i));
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <span className={done ? "line-through text-muted-foreground" : ""}>{a}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {h.headlineRisks && h.headlineRisks.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mono mb-2">
            Section J · Headline Risks for Counterparty Discussion
          </div>
          <ul className="space-y-1 text-sm text-foreground/90">
            {h.headlineRisks.map((q, i) => (
              <li key={i}>• {q}</li>
            ))}
          </ul>
        </div>
      )}
    </ReportSection>
  );
}
