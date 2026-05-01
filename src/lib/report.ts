// Phase 7 — Report builder. Pure, deterministic, frontend-only.
// Turns an AnalysisRun (live or fixture-based) into a portable report object.
import type {
  AnalysisRun,
  CriticReview,
  EvaluationMetric,
  ExtractedField,
  HandoverSummary,
  RiskItem,
  RiskSeverity,
} from "@/types/analysis";
import type { SampleDocument } from "@/data/samples";
import { SAMPLES, getSample } from "@/data/samples";
import { getFixture, ANALYSIS_FIXTURES } from "@/data/analysisFixtures";
import { WORKFLOW_NODES } from "@/lib/analysisSimulator";
import {
  getExtractionFields,
  getMissingFields,
  getSchemaForRun,
  isFieldMissing,
  summarizeExtraction,
  type SchemaMeta,
  type ExtractionSummary,
} from "@/lib/extraction";
import {
  getOverallQualityScore,
  getLatencyBreakdown,
  getTokenCostBreakdown,
  getGroundingStats,
  type QualityScore,
} from "@/lib/evals";
import { SEVERITY_RANK, SEVERITY_LABEL, CATEGORY_LABEL } from "@/lib/risks";

// ---------- Types ----------

export type ReportStatus =
  | "draft"
  | "human_review_required"
  | "approved"
  | "export_ready";

export type ReportRecommendation =
  | "approve_with_followup"
  | "hold_pending_clarification"
  | "ready_for_export"
  | "human_review_required";

export interface ReportMeta {
  reportId: string;
  generatedAt: string;
  source: "live_run" | "demo_fixture";
}

export interface ReportDocument {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
  description: string;
  complexity: string;
  estimatedPages: number;
}

export interface ReportRun {
  runId: string;
  status: string;
  totalLatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
  workflowSteps: { node: string; label: string; status: string; durationMs?: number }[];
  workflowComplete: boolean;
}

export interface ReportClassification {
  type: string;
  typeLabel: string;
  confidence: number;
  alternatives: { type: string; probability: number }[];
  override?: { type: string; at: string };
}

export interface ReportExtractionRow {
  key: string;
  label: string;
  value: string;
  confidence: number;
  status: string;
  hasEvidence: boolean;
  userEdited: boolean;
}

export interface ReportExtraction {
  rows: ReportExtractionRow[];
  summary: ExtractionSummary;
  schema: SchemaMeta;
}

export interface ReportMissingField {
  key: string;
  label: string;
  why: string;
  recommendedAction: string;
}

export interface ReportHumanReview {
  extractionEdits: number;
  extractionConfirmed: number;
  risksAccepted: number;
  risksDismissed: number;
  risksFollowUp: number;
  risksOpen: number;
  handoverApproved: boolean;
  handoverEdited: boolean;
  criticOpen: number;
  criticAccepted: number;
  criticDismissed: number;
  comments: { source: string; text: string }[];
}

export interface ReportEvalsView {
  qualityScore: QualityScore;
  metrics: EvaluationMetric[];
  groundingPct: number;
  hallucinationRiskPct: number;
}

export interface MaritimeReport {
  meta: ReportMeta;
  document: ReportDocument;
  run: ReportRun;
  classification: ReportClassification;
  extraction: ReportExtraction;
  missingFields: ReportMissingField[];
  risks: RiskItem[];
  handover: HandoverSummary | null;
  critic: CriticReview | null;
  evals: ReportEvalsView;
  humanReview: ReportHumanReview;
  status: ReportStatus;
  recommendation: ReportRecommendation;
  executiveSummary: string;
  highestSeverity: RiskSeverity | null;
}

// ---------- Helpers ----------

const TYPE_LABELS: Record<string, string> = {
  charter_party: "Charter Party",
  statement_of_facts: "Statement of Facts",
  port_call_note: "Port Call Note",
  da_estimate: "DA Estimate",
  invoice: "Invoice",
  handover_email: "Handover Email",
  unknown: "Unknown",
};

export function getHighestSeverity(risks: RiskItem[]): RiskSeverity | null {
  let top: RiskSeverity | null = null;
  for (const r of risks) {
    if (!top || SEVERITY_RANK[r.severity] > SEVERITY_RANK[top]) top = r.severity;
  }
  return top;
}

function fieldStatusLabel(f: ExtractedField): string {
  if (isFieldMissing(f)) return "Missing";
  if (f.userConfirmed) return "Confirmed";
  if (f.userEdited) return "Edited";
  if (f.confidence < 0.75) return "Low confidence";
  return "Extracted";
}

export function getHumanReviewSummary(run: AnalysisRun | null | undefined): ReportHumanReview {
  const fields = run?.extraction ?? [];
  const risks = run?.risks ?? [];
  const critic = run?.critic?.issues ?? [];
  const comments: { source: string; text: string }[] = [];
  for (const r of risks) {
    if (r.reviewerComment) comments.push({ source: `Risk · ${r.title}`, text: r.reviewerComment });
  }
  for (const i of critic) {
    if (i.comment) comments.push({ source: `Critic · ${i.section}`, text: i.comment });
  }
  return {
    extractionEdits: fields.filter((f) => f.userEdited).length,
    extractionConfirmed: fields.filter((f) => f.userConfirmed).length,
    risksAccepted: risks.filter((r) => r.status === "accepted").length,
    risksDismissed: risks.filter((r) => r.status === "dismissed").length,
    risksFollowUp: risks.filter((r) => r.status === "needs_follow_up").length,
    risksOpen: risks.filter((r) => !r.status || r.status === "open").length,
    handoverApproved: Boolean(run?.handover?.approved),
    handoverEdited: Boolean(run?.handover?.userEdited),
    criticOpen: critic.filter((i) => i.status === "open").length,
    criticAccepted: critic.filter((i) => i.status === "accepted").length,
    criticDismissed: critic.filter((i) => i.status === "dismissed").length,
    comments,
  };
}

function computeStatus(
  run: AnalysisRun | null | undefined,
  hr: ReportHumanReview,
  highest: RiskSeverity | null,
): ReportStatus {
  if (!run) return "draft";
  if (run.status !== "complete") return "draft";
  if (hr.handoverApproved && hr.criticOpen === 0 && hr.risksOpen === 0)
    return "export_ready";
  if (hr.handoverApproved) return "approved";
  if (highest === "critical" || highest === "high") return "human_review_required";
  if (hr.criticOpen > 0) return "human_review_required";
  return "human_review_required";
}

function computeRecommendation(
  status: ReportStatus,
  highest: RiskSeverity | null,
  hr: ReportHumanReview,
): ReportRecommendation {
  if (status === "export_ready") return "ready_for_export";
  if (highest === "critical") return "hold_pending_clarification";
  if (highest === "high") return "approve_with_followup";
  if (hr.criticOpen > 0 || hr.risksOpen > 0) return "human_review_required";
  return "approve_with_followup";
}

export function getExecutiveSummary(report: MaritimeReport): string {
  return report.executiveSummary;
}

function buildExecutiveSummary(
  doc: ReportDocument,
  risks: RiskItem[],
  handover: HandoverSummary | null,
  highest: RiskSeverity | null,
  recommendation: ReportRecommendation,
): string {
  const top = [...risks].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])[0];
  const headline = handover?.headlineRisks?.[0];
  const pieces: string[] = [];
  pieces.push(`${doc.typeLabel} for ${doc.title}.`);
  if (top) {
    pieces.push(
      `Highest priority concern: ${SEVERITY_LABEL[top.severity]} · ${top.title}.`,
    );
  } else if (headline) {
    pieces.push(`Top headline: ${headline}.`);
  }
  pieces.push(`${risks.length} risk${risks.length === 1 ? "" : "s"} flagged${highest ? `, highest severity ${SEVERITY_LABEL[highest]}` : ""}.`);
  pieces.push(`Recommended decision: ${RECOMMENDATION_LABEL[recommendation]}.`);
  return pieces.join(" ");
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  draft: "Draft",
  human_review_required: "Human Review Required",
  approved: "Approved",
  export_ready: "Export Ready",
};

export const RECOMMENDATION_LABEL: Record<ReportRecommendation, string> = {
  approve_with_followup: "Approve with follow-up",
  hold_pending_clarification: "Hold pending clarification",
  ready_for_export: "Ready for export",
  human_review_required: "Human review required",
};

// ---------- Builders ----------

export function buildReportFromRun(
  run: AnalysisRun,
  sample: SampleDocument,
  meta?: { source?: "live_run" | "demo_fixture" },
): MaritimeReport {
  const schema = getSchemaForRun(run);
  const fields = getExtractionFields(run);
  const summary = summarizeExtraction(fields, schema);
  const missing = getMissingFields(fields);
  const risks = run.risks ?? [];
  const highest = getHighestSeverity(risks);
  const hr = getHumanReviewSummary(run);
  const status = computeStatus(run, hr, highest);
  const recommendation = computeRecommendation(status, highest, hr);
  const quality = getOverallQualityScore(run.evals);

  const document: ReportDocument = {
    id: sample.id,
    title: sample.title,
    type: sample.documentType,
    typeLabel: sample.documentTypeLabel,
    description: sample.description,
    complexity: sample.complexity,
    estimatedPages: sample.estimatedPages,
  };

  const classificationType =
    run.classificationOverride?.type ?? run.classification?.type ?? sample.documentType;

  const classification: ReportClassification = {
    type: classificationType,
    typeLabel: TYPE_LABELS[classificationType] ?? classificationType,
    confidence: run.classification?.confidence ?? 0,
    alternatives:
      run.classification?.alternatives.map((a) => ({
        type: TYPE_LABELS[a.type] ?? a.type,
        probability: a.probability,
      })) ?? [],
    override: run.classificationOverride
      ? { type: TYPE_LABELS[run.classificationOverride.type] ?? run.classificationOverride.type, at: run.classificationOverride.at }
      : undefined,
  };

  const extractionRows: ReportExtractionRow[] = fields.map((f) => ({
    key: f.key,
    label: f.label,
    value: f.value || "—",
    confidence: f.confidence,
    status: fieldStatusLabel(f),
    hasEvidence: Boolean(f.evidenceQuote && f.evidenceQuote.trim().length > 0),
    userEdited: Boolean(f.userEdited),
  }));

  const missingFields: ReportMissingField[] = missing.map((f) => {
    const ctx = schema.operationalContext[f.key];
    return {
      key: f.key,
      label: f.label,
      why: ctx?.why ?? "Required field for this document type.",
      recommendedAction: ctx?.recommendedAction ?? "Resolve with counterparty before downstream use.",
    };
  });

  const evals: ReportEvalsView = {
    qualityScore: quality,
    metrics: run.evals ?? [],
    groundingPct: run.evals?.find((e) => e.key === "evidence_grounding")?.value ?? 0,
    hallucinationRiskPct: run.evals?.find((e) => e.key === "hallucination_risk")?.value ?? 0,
  };

  const reportRun: ReportRun = {
    runId: run.id,
    status: run.status,
    totalLatencyMs: run.totals.latencyMs,
    totalTokens: run.totals.tokens,
    totalCostUsd: run.totals.costUsd,
    workflowSteps: run.steps.map((s) => ({
      node: s.node,
      label: s.label,
      status: s.status,
      durationMs: s.durationMs,
    })),
    workflowComplete: run.status === "complete",
  };

  const handover = run.handover ?? null;
  const critic = run.critic ?? null;

  const executiveSummary = buildExecutiveSummary(
    document,
    risks,
    handover,
    highest,
    recommendation,
  );

  return {
    meta: {
      reportId: `report_${sample.id}_${Date.now().toString(36)}`,
      generatedAt: new Date().toISOString(),
      source: meta?.source ?? "live_run",
    },
    document,
    run: reportRun,
    classification,
    extraction: { rows: extractionRows, summary, schema },
    missingFields,
    risks,
    handover,
    critic,
    evals,
    humanReview: hr,
    status,
    recommendation,
    executiveSummary,
    highestSeverity: highest,
  };
}

/** Build a deterministic report from a sample + its fixture, no live run required. */
export function buildDemoReportForSample(sample: SampleDocument): MaritimeReport {
  const fixture = getFixture(sample.id);
  if (!fixture) {
    // Empty graceful fallback
    return {
      meta: {
        reportId: `demo_${sample.id}`,
        generatedAt: new Date().toISOString(),
        source: "demo_fixture",
      },
      document: {
        id: sample.id,
        title: sample.title,
        type: sample.documentType,
        typeLabel: sample.documentTypeLabel,
        description: sample.description,
        complexity: sample.complexity,
        estimatedPages: sample.estimatedPages,
      },
      run: {
        runId: `demo_${sample.id}`,
        status: "complete",
        totalLatencyMs: 0,
        totalTokens: 0,
        totalCostUsd: 0,
        workflowSteps: WORKFLOW_NODES.map((n) => ({
          node: n.node,
          label: n.label,
          status: "done",
        })),
        workflowComplete: true,
      },
      classification: {
        type: sample.documentType,
        typeLabel: sample.documentTypeLabel,
        confidence: 0,
        alternatives: [],
      },
      extraction: {
        rows: [],
        summary: {
          total: 0,
          required: 0,
          completed: 0,
          missing: 0,
          lowConfidence: 0,
          edited: 0,
          confirmed: 0,
          overallConfidence: 0,
        },
        schema: getSchemaForRun(null),
      },
      missingFields: [],
      risks: [],
      handover: null,
      critic: null,
      evals: {
        qualityScore: { score: 0, grade: "D", explanation: "No fixture" },
        metrics: [],
        groundingPct: 0,
        hallucinationRiskPct: 0,
      },
      humanReview: {
        extractionEdits: 0,
        extractionConfirmed: 0,
        risksAccepted: 0,
        risksDismissed: 0,
        risksFollowUp: 0,
        risksOpen: 0,
        handoverApproved: false,
        handoverEdited: false,
        criticOpen: 0,
        criticAccepted: 0,
        criticDismissed: 0,
        comments: [],
      },
      status: "draft",
      recommendation: "human_review_required",
      executiveSummary: sample.description,
      highestSeverity: null,
    };
  }

  // Construct a synthetic AnalysisRun-equivalent from fixture and reuse builder.
  const totalCost = +Object.values(fixture.stepProfile)
    .reduce((acc, s) => acc + (s.costUsd ?? 0), 0)
    .toFixed(6);
  const totalTokens = Object.values(fixture.stepProfile).reduce(
    (acc, s) => acc + (s.tokens ?? 0),
    0,
  );
  // Approximate latency from durationRange midpoints.
  const totalLatency = WORKFLOW_NODES.reduce((acc, n) => {
    if (n.node === "human_review") return acc;
    return acc + (n.durationRange[0] + n.durationRange[1]) / 2;
  }, 0);

  const synthRun: AnalysisRun = {
    id: `demo_${sample.id}`,
    documentId: sample.id,
    status: "complete",
    currentStepIndex: WORKFLOW_NODES.length - 1,
    steps: WORKFLOW_NODES.map((n) => {
      const profile = fixture.stepProfile[n.node];
      return {
        node: n.node,
        label: n.label,
        description: n.description,
        status: "done",
        durationMs: n.node === "human_review" ? 0 : Math.round((n.durationRange[0] + n.durationRange[1]) / 2),
        tokens: profile?.tokens ?? 0,
        costUsd: profile?.costUsd ?? 0,
        confidence: profile?.confidence,
      };
    }),
    classification: fixture.classification,
    extraction: fixture.extraction,
    risks: fixture.risks,
    handover: { ...fixture.handover, generatedAt: new Date().toISOString() } as HandoverSummary,
    critic: fixture.critic,
    evals: fixture.evals as EvaluationMetric[],
    feedback: [],
    totals: {
      latencyMs: Math.round(totalLatency),
      tokens: totalTokens,
      costUsd: totalCost,
    },
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    activityLog: [],
  };

  return buildReportFromRun(synthRun, sample, { source: "demo_fixture" });
}

export function getReportStatus(report: MaritimeReport): ReportStatus {
  return report.status;
}

// ---------- Lookup helpers for report center ----------

export interface ReportCardData {
  sampleId: string;
  title: string;
  typeLabel: string;
  highestSeverity: RiskSeverity | null;
  riskCount: number;
  qualityScore: number;
  grade: string;
  status: ReportStatus;
  generated: boolean;
}

export function getDemoReportCards(): ReportCardData[] {
  return SAMPLES.map((s) => {
    const r = buildDemoReportForSample(s);
    return {
      sampleId: s.id,
      title: s.title,
      typeLabel: s.documentTypeLabel,
      highestSeverity: r.highestSeverity,
      riskCount: r.risks.length,
      qualityScore: r.evals.qualityScore.score,
      grade: r.evals.qualityScore.grade,
      status: r.status,
      generated: true,
    };
  });
}

// ---------- Persisted live-run handoff ----------

const LIVE_RUN_STORAGE_KEY = "maritimeops:lastCompletedRun";

export interface PersistedRun {
  sampleId: string;
  run: AnalysisRun;
  savedAt: string;
}

export function persistRunForReport(sampleId: string, run: AnalysisRun): void {
  try {
    const payload: PersistedRun = { sampleId, run, savedAt: new Date().toISOString() };
    sessionStorage.setItem(LIVE_RUN_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

export function loadPersistedRun(sampleId: string): AnalysisRun | null {
  try {
    const raw = sessionStorage.getItem(LIVE_RUN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedRun;
    if (parsed.sampleId !== sampleId) return null;
    return parsed.run;
  } catch {
    return null;
  }
}

export function loadReportForSample(sampleId: string): MaritimeReport | null {
  const sample = getSample(sampleId);
  if (!sample) return null;
  const persisted = loadPersistedRun(sampleId);
  if (persisted && persisted.status === "complete") {
    return buildReportFromRun(persisted, sample, { source: "live_run" });
  }
  return buildDemoReportForSample(sample);
}

// ---------- Export actions ----------

export function downloadJsonReport(report: MaritimeReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `maritimeops-report-${report.document.id}-${report.meta.reportId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallthrough */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function copyExecutiveSummary(report: MaritimeReport): Promise<boolean> {
  return copyText(report.executiveSummary);
}

export const PORTFOLIO_BULLET =
  "Built MaritimeOps AI Copilot, an agentic maritime document intelligence system with structured extraction, evidence-grounded risk analysis, operational handovers, critic review, and automated AI evals.";

export async function copyPortfolioBullet(): Promise<boolean> {
  return copyText(PORTFOLIO_BULLET);
}

// Re-export so consumers can use a single import.
export { ANALYSIS_FIXTURES };
