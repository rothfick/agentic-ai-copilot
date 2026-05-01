import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyBlock } from "@/components/maritime/CopyBlock";
import { WorkflowArchitectureGraph } from "@/components/maritime/WorkflowArchitectureGraph";
import { architectureSummary } from "@/lib/portfolioCopy";

const dataModel = [
  { name: "MaritimeDocument", desc: "Source document with type, metadata, and raw content." },
  { name: "AnalysisRun", desc: "Lifecycle of a single agent run with node-level state and outputs." },
  { name: "ExtractedField", desc: "Schema-bound field with confidence, evidence quote, and edit state." },
  { name: "RiskItem", desc: "Categorized, severity-ranked risk with evidence and review status." },
  { name: "HandoverSummary", desc: "Operator-ready summary with headline risks and next actions." },
  { name: "CriticReview", desc: "Critic issues + quality gate verdict for export readiness." },
  { name: "EvaluationMetric", desc: "Per-metric score with grade, status, and breakdown data." },
  { name: "Report", desc: "Export-ready executive report assembled from run outputs." },
];

const roadmap = [
  "Python FastAPI backend with typed request/response contracts",
  "LangGraph orchestration mirroring the 9-node simulated graph",
  "LangSmith / OpenTelemetry tracing across every node",
  "OCR + VLM ingestion for scanned maritime PDFs",
  "Object storage for raw + processed artifacts",
  "Postgres for runs, extractions, risks and audit log",
  "Queue workers for long-running agent steps",
  "Provider abstraction for OpenAI / Anthropic / Gemini",
  "Authentication + RBAC for operator vs admin roles",
  "Tamper-evident audit log of every human action",
  "Feedback dataset feeding continuous eval improvement",
];

const decisions = [
  {
    title: "Deterministic simulation first",
    body: "Lets the architecture, UX and product thinking land cleanly without provider variance or cost.",
  },
  {
    title: "Schema-first outputs",
    body: "Every AI output is validated against an operational schema, never free text dumped into the UI.",
  },
  {
    title: "Evidence-grounded UI",
    body: "Every extracted value and risk traces back to a source quote — no answer without provenance.",
  },
  {
    title: "Evals as a product feature",
    body: "Quality, grounding, hallucination risk, calibration, latency and cost are surfaced to the operator.",
  },
  {
    title: "Human-in-the-loop gates",
    body: "Editable fields, risk review actions, and a critic quality gate before any export.",
  },
  {
    title: "Report as the final business artifact",
    body: "The system's job isn't a chat reply — it's a decision-ready report with full audit trail.",
  },
];

const Architecture = () => {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Engineering"
          title="Architecture Documentation"
          description="How MaritimeOps AI Copilot is built today — and how it would scale to a production maritime AI platform."
        />

        {/* System Overview */}
        <section className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">A. System Overview</div>
          <h2 className="text-lg font-semibold mb-4">High-level architecture</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { l: "Frontend app", d: "React + Vite + TS + Tailwind + shadcn/ui." },
              { l: "Simulation layer", d: "Deterministic AnalysisRun lifecycle with progressive node outputs." },
              { l: "Agent workflow", d: "9 nodes from ingest to human review." },
              { l: "Domain model", d: "Typed maritime entities consumed across surfaces." },
              { l: "Eval layer", d: "Quality, grounding, hallucination, latency, cost, regression." },
              { l: "Report / export layer", d: "Executive report with JSON + print-to-PDF." },
              { l: "Future LLM adapters", d: "Provider abstraction for OpenAI / Anthropic / Gemini." },
              { l: "Future backend", d: "FastAPI + LangGraph + Postgres + queue workers." },
              { l: "Future tracing", d: "LangSmith / OpenTelemetry across every node." },
            ].map((b) => (
              <div key={b.l} className="panel-elevated p-4">
                <div className="text-sm font-semibold mb-1">{b.l}</div>
                <div className="text-xs text-muted-foreground">{b.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">B. Agent Workflow Graph</div>
          <h2 className="text-lg font-semibold mb-4">Nine nodes, simulated today, production-ready tomorrow</h2>
          <WorkflowArchitectureGraph />
        </section>

        {/* Data Model */}
        <section className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">C. Data Model</div>
          <h2 className="text-lg font-semibold mb-4">Typed maritime entities</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {dataModel.map((d) => (
              <div key={d.name} className="panel-elevated p-4 flex items-start gap-3">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-mono text-[11px]">
                  {d.name}
                </Badge>
                <div className="text-sm text-muted-foreground leading-relaxed">{d.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">D. Production Roadmap</div>
          <h2 className="text-lg font-semibold mb-4">From simulation to a real maritime AI platform</h2>
          <Card>
            <CardContent className="p-5">
              <ul className="grid gap-2 md:grid-cols-2 text-sm text-foreground/90">
                {roadmap.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-primary mt-1">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Decisions */}
        <section className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">E. Engineering Decisions</div>
          <h2 className="text-lg font-semibold mb-4">Trade-offs made on purpose</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {decisions.map((d) => (
              <Card key={d.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{d.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed pt-0">{d.body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <CopyBlock label="Architecture summary" text={architectureSummary} />
      </div>
    </AppShell>
  );
};

export default Architecture;
