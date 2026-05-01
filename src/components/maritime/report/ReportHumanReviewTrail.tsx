import { ReportSection } from "./ReportSection";
import type { MaritimeReport } from "@/lib/report";
import { Badge } from "@/components/ui/badge";

export function ReportHumanReviewTrail({ report }: { report: MaritimeReport }) {
  const hr = report.humanReview;
  const items: { label: string; value: string }[] = [
    { label: "Extraction edits", value: String(hr.extractionEdits) },
    { label: "Extraction confirmed", value: String(hr.extractionConfirmed) },
    { label: "Risks accepted", value: String(hr.risksAccepted) },
    { label: "Risks dismissed", value: String(hr.risksDismissed) },
    { label: "Risks follow-up", value: String(hr.risksFollowUp) },
    { label: "Risks open", value: String(hr.risksOpen) },
    {
      label: "Handover",
      value: hr.handoverApproved
        ? "Approved"
        : hr.handoverEdited
          ? "Edited (pending)"
          : "Draft",
    },
    {
      label: "Critic issues",
      value: `${hr.criticOpen} open · ${hr.criticAccepted} accepted · ${hr.criticDismissed} dismissed`,
    },
  ];
  return (
    <ReportSection
      number="M"
      title="Human Review Trail"
      description="Auditable record of human-in-the-loop decisions captured during this analysis."
    >
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-md border border-border bg-card/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              {it.label}
            </div>
            <div className="mono text-sm mt-1">{it.value}</div>
          </div>
        ))}
      </div>

      {hr.comments.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono mb-2">
            Reviewer comments
          </div>
          <ul className="space-y-2">
            {hr.comments.map((c, i) => (
              <li key={i} className="rounded-md border border-border bg-card/40 p-2.5">
                <Badge variant="outline" className="text-[10px] mb-1">
                  {c.source}
                </Badge>
                <div className="text-xs text-foreground/90 italic">"{c.text}"</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ReportSection>
  );
}
