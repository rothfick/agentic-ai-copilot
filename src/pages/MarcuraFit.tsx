import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyBlock } from "@/components/maritime/CopyBlock";
import { RequirementMappingTable } from "@/components/maritime/RequirementMappingTable";
import { applicationMessage } from "@/lib/portfolioCopy";

const talkingPoints = [
  {
    title: "Why I chose deterministic simulation first",
    body: "It removes provider variance and cost from the demo so the architecture, UX and product thinking are visible end-to-end. The simulation boundary is exactly where a real backend would slot in.",
  },
  {
    title: "How I would replace the simulator with LangGraph",
    body: "Each node maps 1:1 to a LangGraph node with typed state. The frontend already consumes the AnalysisRun lifecycle — only the producer changes.",
  },
  {
    title: "How I would run evals in production",
    body: "Every run emits structured eval events to LangSmith / OTel. Golden sets per document type drive regression. Dashboards expose trend and per-cohort drift.",
  },
  {
    title: "How I would reduce hallucinations",
    body: "Schema-first outputs, evidence span tracking, retrieval over playbooks, and a critic LLM gate before any export.",
  },
  {
    title: "How I would design feedback loops",
    body: "Every human edit, dismiss, or comment becomes a labeled training signal. Critic disagreements feed targeted prompt and policy iteration.",
  },
  {
    title: "How I would handle confidential maritime documents",
    body: "Object storage with per-tenant encryption, PII redaction at ingest, role-scoped access, tamper-evident audit log, and provider data-handling controls.",
  },
  {
    title: "How I would integrate VLM / OCR",
    body: "ingest_document becomes a pipeline: layout-aware OCR + VLM for tables and stamps, normalized into the same document payload the agent already expects.",
  },
  {
    title: "How I would monitor cost and latency",
    body: "Per-node spans with token + USD attribution, p50 / p95 latency budgets, and per-document cost ceilings with circuit breakers.",
  },
  {
    title: "How I would onboard domain experts",
    body: "Operators review extraction, risks and handover with the existing HITL controls. Their edits become the golden set, not a separate annotation tool.",
  },
  {
    title: "How I would ship this as a production feature",
    body: "Thin vertical slice on one document type behind a feature flag, eval gates in CI, gradual rollout with sampled critic review, then expand surface area.",
  },
];

const MarcuraFit = () => {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Role Fit"
          title="Marcura Fit — Staff AI Engineer"
          description="A direct mapping of MaritimeOps AI Copilot to the signals expected from a Staff AI Engineer at a maritime AI company."
        />

        <Card className="mb-8 bg-gradient-to-br from-panel-elevated to-panel border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Why this project, why this role</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            This project was designed to demonstrate practical AI engineering for maritime document intelligence
            and operational workflows. It deliberately covers the full AI product lifecycle — extraction, risk,
            handover, critic, evals, export — rather than a single model demo, because that is the work a Staff AI
            Engineer is hired to lead.
          </CardContent>
        </Card>

        {/* Mapping table */}
        <section className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">Requirement mapping</div>
          <h2 className="text-lg font-semibold mb-4">Signals demonstrated in the product</h2>
          <RequirementMappingTable />
        </section>

        {/* Talking points */}
        <section className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">Interview talking points</div>
          <h2 className="text-lg font-semibold mb-4">Ten things I'm ready to discuss</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {talkingPoints.map((t) => (
              <Card key={t.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed pt-0">
                  {t.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">Application message</div>
          <h2 className="text-lg font-semibold mb-4">Copy-ready outreach</h2>
          <CopyBlock label="Application message" text={applicationMessage} />
        </section>
      </div>
    </AppShell>
  );
};

export default MarcuraFit;
