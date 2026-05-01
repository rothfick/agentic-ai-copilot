// MaritimeOps AI Copilot — Phase 2 type system.
// Frontend-friendly but portable to a future Python/FastAPI backend.

export type DocumentType =
  | "charter_party"
  | "statement_of_facts"
  | "port_call_note"
  | "da_estimate"
  | "invoice"
  | "handover_email"
  | "unknown";

export type AnalysisStepStatus = "idle" | "running" | "done" | "error";

export type AgentNode =
  | "ingest_document"
  | "classify_document"
  | "extract_structured_data"
  | "validate_schema"
  | "detect_risks"
  | "generate_handover"
  | "critic_review"
  | "run_evals"
  | "human_review";

export interface AnalysisStep {
  node: AgentNode;
  label: string;
  description: string;
  status: AnalysisStepStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  tokens?: number;
  costUsd?: number;
  confidence?: number;
}

export interface ClassificationResult {
  type: DocumentType;
  confidence: number;
  alternatives: { type: DocumentType; probability: number }[];
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  evidenceQuote?: string;
  isMissing?: boolean;
  userEdited?: boolean;
  userConfirmed?: boolean;
  previousValue?: string;
}

export interface ClassificationOverride {
  type: DocumentType;
  at: string;
}

export type RiskCategory =
  | "contractual"
  | "operational"
  | "compliance"
  | "financial"
  | "data_quality"
  | "timing"
  | "documentation";

export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskReviewStatus = "open" | "accepted" | "dismissed" | "needs_follow_up";

export interface RiskItem {
  id: string;
  title: string;
  category: RiskCategory;
  severity: RiskSeverity;
  description: string;
  evidenceQuote?: string;
  businessImpact: string;
  recommendedAction: string;
  confidence: number;
  // Phase 4 — human review workflow (optional, UI-managed).
  status?: RiskReviewStatus;
  reviewerComment?: string;
  reviewedAt?: string;
  owner?: string;
  dueDate?: string;
  relatedFieldKeys?: string[];
}

export interface HandoverSummary {
  markdown: string;
  headlineRisks: string[];
  nextActions: string[];
  owner?: string;
  generatedAt: string;
}

export interface CriticIssue {
  id: string;
  section: "extraction" | "risks" | "handover";
  severity: RiskSeverity;
  message: string;
  suggestedFix?: string;
  status: "open" | "accepted" | "dismissed";
}

export interface CriticReview {
  issues: CriticIssue[];
  overallVerdict: "pass" | "review" | "fail";
}

export interface EvaluationMetric {
  key: string;
  label: string;
  value: number;
  unit?: string;
  target?: number;
  direction: "higher_is_better" | "lower_is_better";
  explanation?: string;
}

export interface HumanFeedback {
  id: string;
  section: "extraction" | "risks" | "handover" | "overall";
  decision: "accept" | "reject" | "edit";
  comment?: string;
  at: string;
}

export type RunStatus = "pending" | "running" | "complete" | "error";

export interface RunTotals {
  latencyMs: number;
  tokens: number;
  costUsd: number;
}

export interface AnalysisRun {
  id: string;
  documentId: string;
  status: RunStatus;
  currentStepIndex: number;
  steps: AnalysisStep[];
  classification?: ClassificationResult;
  classificationOverride?: ClassificationOverride;
  extraction?: ExtractedField[];
  risks?: RiskItem[];
  handover?: HandoverSummary;
  critic?: CriticReview;
  evals?: EvaluationMetric[];
  feedback: HumanFeedback[];
  totals: RunTotals;
  createdAt: string;
  completedAt?: string;
  activityLog: ActivityLogEntry[];
}

export interface ActivityLogEntry {
  at: string;
  node: AgentNode;
  message: string;
  level: "info" | "success" | "warn" | "error";
}
