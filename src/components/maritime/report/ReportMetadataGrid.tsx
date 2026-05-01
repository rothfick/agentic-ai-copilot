import { ReportSection } from "./ReportSection";
import { formatMs, formatUsd } from "@/lib/evals";
import type { MaritimeReport } from "@/lib/report";

export function ReportMetadataGrid({ report }: { report: MaritimeReport }) {
  const items: { label: string; value: string }[] = [
    { label: "Source Type", value: report.document.typeLabel },
    { label: "Estimated Pages", value: String(report.document.estimatedPages) },
    { label: "Complexity", value: report.document.complexity },
    {
      label: "Workflow",
      value: report.run.workflowComplete
        ? `Complete (${report.run.workflowSteps.length} nodes)`
        : `In progress (${report.run.workflowSteps.length} nodes)`,
    },
    { label: "Total Latency", value: formatMs(report.run.totalLatencyMs) },
    { label: "Total Tokens", value: report.run.totalTokens.toLocaleString() },
    { label: "Token Cost", value: formatUsd(report.run.totalCostUsd, 4) },
    { label: "Run Status", value: report.run.status },
  ];
  return (
    <ReportSection
      number="C"
      title="Document Metadata"
      description="Provenance and end-to-end pipeline performance for this run."
    >
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label}>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
              {it.label}
            </div>
            <div className="mono text-sm mt-1 text-foreground/90">{it.value}</div>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}
