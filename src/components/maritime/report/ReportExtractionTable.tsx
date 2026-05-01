import { ReportSection } from "./ReportSection";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MaritimeReport } from "@/lib/report";
import { Check, X } from "lucide-react";

export function ReportExtractionTable({ report }: { report: MaritimeReport }) {
  const { rows, summary, schema } = report.extraction;
  return (
    <ReportSection
      number="E"
      title="Structured Extraction"
      description={`${schema.schemaName} v${schema.schemaVersion} · ${summary.completed}/${summary.required} required fields populated`}
    >
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No extraction available.</div>
      ) : (
        <div className="overflow-x-auto -mx-2 print:mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-2 py-2 font-medium">Field</th>
                <th className="px-2 py-2 font-medium">Value</th>
                <th className="px-2 py-2 font-medium w-24">Confidence</th>
                <th className="px-2 py-2 font-medium w-28">Status</th>
                <th className="px-2 py-2 font-medium w-20 text-center">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-border/60 align-top">
                  <td className="px-2 py-2 text-foreground/90 whitespace-nowrap">
                    {r.label}
                    {r.userEdited && (
                      <span className="ml-1.5 text-[10px] text-warning mono">(edited)</span>
                    )}
                  </td>
                  <td className="px-2 py-2 mono text-foreground/90">{r.value}</td>
                  <td className="px-2 py-2 mono text-xs">
                    {Math.round(r.confidence * 100)}%
                  </td>
                  <td className="px-2 py-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-normal",
                        r.status === "Missing" && "border-destructive/40 text-destructive bg-destructive/10",
                        r.status === "Confirmed" && "border-success/40 text-success bg-success/10",
                        r.status === "Edited" && "border-warning/40 text-warning bg-warning/10",
                        r.status === "Low confidence" && "border-warning/40 text-warning bg-warning/10",
                      )}
                    >
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-2 py-2 text-center">
                    {r.hasEvidence ? (
                      <Check className="inline h-3.5 w-3.5 text-success" />
                    ) : (
                      <X className="inline h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportSection>
  );
}
