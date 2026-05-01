import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Beaker,
  Users,
  Activity,
  Cpu,
  Cloud,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { Badge } from "@/components/ui/badge";
import { MetricPreviewCard } from "@/components/maritime/MetricPreviewCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatMs,
  formatUsd,
  getAggregateSampleEvalRows,
  type DashboardStatus,
} from "@/lib/evals";

const STATUS_TONE: Record<DashboardStatus, string> = {
  Excellent: "border-success/40 bg-success/10 text-success",
  Passing: "border-primary/40 bg-primary/10 text-primary",
  "Needs Review": "border-warning/40 bg-warning/10 text-warning",
  Failing: "border-destructive/40 bg-destructive/10 text-destructive",
};

const METHODOLOGY = [
  {
    title: "Schema Validity",
    icon: FileCheck2,
    body: "Every output is parsed against typed schemas (CharterParty.v1, StatementOfFacts.v1, DisbursementAccount.v1). Invalid JSON fails the run.",
  },
  {
    title: "Golden Dataset Matching",
    icon: Beaker,
    body: "Detected risks and extracted fields are diffed against per-sample golden labels for recall and completeness.",
  },
  {
    title: "Evidence Grounding",
    icon: ShieldCheck,
    body: "Every value and risk must cite a verbatim quote from the source document. Ungrounded outputs are flagged.",
  },
  {
    title: "Hallucination Control",
    icon: Sparkles,
    body: "An AI critic reviews extraction, risks and handover for unsupported claims, with grounding and self-consistency heuristics.",
  },
  {
    title: "Human-in-the-loop Feedback",
    icon: Users,
    body: "Operator edits, confirmations and risk decisions are captured to feed calibration and active-learning loops.",
  },
  {
    title: "Cost & Latency Observability",
    icon: Activity,
    body: "Per-step token, cost and latency are tracked so eval status reflects real operational economics.",
  },
];

const MODELS = [
  {
    name: "Simulation Baseline",
    status: "Active",
    body: "Deterministic frontend simulator powering the demo. Replaces real LLM calls with golden fixtures.",
    tone: "primary" as const,
  },
  {
    name: "GPT-4 / GPT-4o",
    status: "Planned adapter",
    body: "Pluggable provider adapter via a unified completion interface — schema-constrained outputs.",
    tone: "default" as const,
  },
  {
    name: "Claude 3.5",
    status: "Planned adapter",
    body: "Tool-use compatible adapter for long-context extraction over multi-page maritime contracts.",
    tone: "default" as const,
  },
  {
    name: "Gemini 1.5",
    status: "Planned adapter",
    body: "Multimodal adapter for scanned SoFs, port forms and PDF DAs with OCR fallback.",
    tone: "default" as const,
  },
];

const Evals = () => {
  const rows = getAggregateSampleEvalRows();

  // Aggregates
  const avg = (key: keyof (typeof rows)[number]) =>
    Math.round(
      rows.reduce((acc, r) => acc + Number(r[key] as number), 0) / Math.max(1, rows.length),
    );
  const sum = (key: keyof (typeof rows)[number]) =>
    rows.reduce((acc, r) => acc + Number(r[key] as number), 0);

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Quality"
          title="Evaluation Harness"
          description="LLM outputs are treated as testable software artifacts: schema validation, golden-set checks, evidence grounding, hallucination controls, and cost / latency observability."
          actions={
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              {rows.length} sample documents
            </Badge>
          }
        />

        {/* Aggregate metrics */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mb-8">
          <MetricPreviewCard
            label="JSON Validity"
            value={`${avg("jsonValidity")}%`}
            hint="Across all sample runs"
            tone="success"
          />
          <MetricPreviewCard
            label="Extraction Completeness"
            value={`${avg("extractionCompleteness")}%`}
            hint="Required fields populated"
            tone="primary"
          />
          <MetricPreviewCard
            label="Evidence Grounding"
            value={`${avg("evidenceGrounding")}%`}
            hint="Quotes traced to source"
            tone="primary"
          />
          <MetricPreviewCard
            label="Risk Detection"
            value={`${avg("riskDetection")}%`}
            hint="Recall vs golden risks"
            tone="primary"
          />
          <MetricPreviewCard
            label="Hallucination Risk"
            value={`${avg("hallucinationRisk")}%`}
            hint="Critic + grounding signal"
            tone={avg("hallucinationRisk") <= 15 ? "success" : "warning"}
          />
          <MetricPreviewCard
            label="Avg Latency"
            value={formatMs(Math.round(sum("latencyMs") / rows.length))}
            hint="End-to-end per document"
          />
          <MetricPreviewCard
            label="Avg Token Cost"
            value={formatUsd(sum("costUsd") / rows.length, 4)}
            hint="Simulated provider pricing"
          />
          <MetricPreviewCard
            label="Quality Score"
            value={`${avg("qualityScore")}/100`}
            hint="Composite quality index"
            tone="primary"
          />
          <MetricPreviewCard
            label="Confidence Calibration"
            value="0.07"
            hint="|avg confidence − accuracy|"
            tone="warning"
          />
        </div>

        {/* Comparison table */}
        <div className="panel p-6 mb-8 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">Per-document evaluation</h3>
              <p className="text-xs text-muted-foreground">
                Aggregated from the simulated agent runs over the three sample documents.
              </p>
            </div>
          </div>
          <table className="w-full text-sm min-w-[900px]">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-left">
                <th className="py-2 pr-4 font-medium">Document</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium text-right">JSON</th>
                <th className="py-2 pr-4 font-medium text-right">Complete</th>
                <th className="py-2 pr-4 font-medium text-right">Grounding</th>
                <th className="py-2 pr-4 font-medium text-right">Risk Recall</th>
                <th className="py-2 pr-4 font-medium text-right">Halluc.</th>
                <th className="py-2 pr-4 font-medium text-right">Latency</th>
                <th className="py-2 pr-4 font-medium text-right">Cost</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sampleId} className="border-t border-border/60">
                  <td className="py-3 pr-4">
                    <Link
                      to={`/workspace/${r.sampleId}`}
                      className="hover:text-primary inline-flex items-center gap-1"
                    >
                      {r.sampleTitle}
                      <ArrowRight className="h-3 w-3 opacity-60" />
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.documentTypeLabel}</td>
                  <td className="py-3 pr-4 mono text-right">{r.jsonValidity}%</td>
                  <td className="py-3 pr-4 mono text-right">{r.extractionCompleteness}%</td>
                  <td className="py-3 pr-4 mono text-right">{r.evidenceGrounding}%</td>
                  <td className="py-3 pr-4 mono text-right">{r.riskDetection}%</td>
                  <td
                    className={cn(
                      "py-3 pr-4 mono text-right",
                      r.hallucinationRisk <= 10
                        ? "text-success"
                        : r.hallucinationRisk <= 20
                          ? "text-warning"
                          : "text-destructive",
                    )}
                  >
                    {r.hallucinationRisk}%
                  </td>
                  <td className="py-3 pr-4 mono text-right text-muted-foreground">
                    {formatMs(r.latencyMs)}
                  </td>
                  <td className="py-3 pr-4 mono text-right text-muted-foreground">
                    {formatUsd(r.costUsd, 4)}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
                        STATUS_TONE[r.status],
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Methodology */}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Evaluation Methodology
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-10">
          {METHODOLOGY.map((m) => (
            <div key={m.title} className="panel p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-md flex items-center justify-center bg-primary/10 text-primary">
                  <m.icon className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold">{m.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{m.body}</p>
            </div>
          ))}
        </div>

        {/* Model performance */}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Model Performance
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {MODELS.map((m) => (
            <div key={m.name} className="panel p-5">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center",
                    m.tone === "primary"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold leading-tight">{m.name}</h4>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {m.status}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{m.body}</p>
            </div>
          ))}
        </div>

        <div className="panel p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-10">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md flex items-center justify-center bg-secondary/15 text-secondary shrink-0">
              <Cloud className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Planned: LangSmith / OpenTelemetry traces</h4>
              <p className="text-sm text-muted-foreground">
                Per-run traces will stream node-level prompts, tool calls, latency and cost
                to LangSmith / OpenTelemetry collectors for production observability.
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/samples">Try a sample run</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default Evals;
