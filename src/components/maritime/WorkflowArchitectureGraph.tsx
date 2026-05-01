import { ChevronRight } from "lucide-react";

export interface WorkflowNode {
  key: string;
  label: string;
  purpose: string;
  input: string;
  output: string;
  simulated: string;
  production: string;
}

export const WORKFLOW_NODES: WorkflowNode[] = [
  {
    key: "ingest_document",
    label: "ingest_document",
    purpose: "Accept and normalize the source document.",
    input: "Raw upload / sample text",
    output: "Normalized document payload",
    simulated: "Reads embedded fixture text.",
    production: "OCR + VLM pipeline, object storage, MIME detection.",
  },
  {
    key: "classify_document",
    label: "classify_document",
    purpose: "Identify document type with confidence.",
    input: "Normalized text",
    output: "DocumentType + confidence",
    simulated: "Deterministic mapping from sample.",
    production: "LLM classifier with calibrated confidence + fallback rules.",
  },
  {
    key: "extract_structured_data",
    label: "extract_structured_data",
    purpose: "Extract schema-bound fields with evidence.",
    input: "Document + schema",
    output: "ExtractedField[] with evidence quotes",
    simulated: "Fixture-driven structured fields.",
    production: "LLM with JSON schema, function calling, evidence span tracking.",
  },
  {
    key: "validate_schema",
    label: "validate_schema",
    purpose: "Validate extraction against operational schema.",
    input: "ExtractedField[]",
    output: "Validation report + missing fields",
    simulated: "Static schema checks.",
    production: "Zod/Pydantic validation + business rule engine.",
  },
  {
    key: "detect_risks",
    label: "detect_risks",
    purpose: "Surface contractual / operational / financial risks.",
    input: "Document + extraction",
    output: "RiskItem[] with severity + evidence",
    simulated: "Curated fixture risks per sample.",
    production: "Risk LLM + retrieval over playbooks + rules.",
  },
  {
    key: "generate_handover",
    label: "generate_handover",
    purpose: "Operator-ready handover summary.",
    input: "Extraction + risks",
    output: "HandoverSummary with next actions",
    simulated: "Template synthesis.",
    production: "Constrained LLM with audience-aware tone.",
  },
  {
    key: "critic_review",
    label: "critic_review",
    purpose: "Second-pass critique and quality gate.",
    input: "All upstream outputs",
    output: "CriticReview + gate verdict",
    simulated: "Heuristic critic over outputs.",
    production: "Critic LLM + grounding checks + policy gates.",
  },
  {
    key: "run_evals",
    label: "run_evals",
    purpose: "Score the run on quality / cost / latency.",
    input: "Run trace + outputs",
    output: "EvaluationMetric[]",
    simulated: "Computed from local trace.",
    production: "LangSmith / OTel + golden set regression + dashboards.",
  },
  {
    key: "human_review",
    label: "human_review",
    purpose: "Operator approves, edits, or rejects.",
    input: "Reviewed outputs",
    output: "Final report + audit trail",
    simulated: "In-app review actions.",
    production: "RBAC + audit log + feedback dataset for retraining.",
  },
];

export function WorkflowArchitectureGraph() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-md border border-border/60 bg-panel/60">
        {WORKFLOW_NODES.map((n, i) => (
          <div key={n.key} className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
              {n.label}
            </span>
            {i < WORKFLOW_NODES.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {WORKFLOW_NODES.map((n) => (
          <div key={n.key} className="panel-elevated p-4">
            <div className="text-sm font-mono text-primary mb-1">{n.label}</div>
            <div className="text-xs text-foreground/90 mb-3">{n.purpose}</div>
            <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 text-[11px]">
              <dt className="text-muted-foreground">Input</dt>
              <dd className="text-foreground/90">{n.input}</dd>
              <dt className="text-muted-foreground">Output</dt>
              <dd className="text-foreground/90">{n.output}</dd>
              <dt className="text-muted-foreground">Simulated</dt>
              <dd className="text-foreground/90">{n.simulated}</dd>
              <dt className="text-muted-foreground">Production</dt>
              <dd className="text-foreground/90">{n.production}</dd>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
