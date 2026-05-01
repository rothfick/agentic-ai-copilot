// Evaluation harness helpers. Pure, typed, deterministic.
// No real LLM calls; designed to be portable to a future backend.
import type {
  AnalysisRun,
  AnalysisStep,
  EvaluationMetric,
  RiskItem,
} from "@/types/analysis";
import type { SampleDocument } from "@/data/samples";
import { ANALYSIS_FIXTURES, getFixture } from "@/data/analysisFixtures";
import { SAMPLES } from "@/data/samples";
import {
  getExtractionFields,
  getSchemaForRun,
  isFieldMissing,
  summarizeExtraction,
} from "@/lib/extraction";

// ---------- Types ----------

export type EvalStatus = "pass" | "warn" | "fail";
export type EvalGrade = "A" | "B" | "C" | "D";
export type DashboardStatus = "Excellent" | "Passing" | "Needs Review" | "Failing";

export interface EvalMetricView extends EvaluationMetric {
  status: EvalStatus;
  /** 0..1 normalized score where 1 == best, used for radar/aggregation. */
  normalized: number;
}

export interface QualityScore {
  score: number; // 0..100
  grade: EvalGrade;
  explanation: string;
}

export interface LatencyBreakdownRow {
  node: string;
  label: string;
  durationMs: number;
  pct: number; // 0..100
  status: AnalysisStep["status"];
  isSlowest: boolean;
}

export interface LatencyBreakdown {
  totalMs: number;
  rows: LatencyBreakdownRow[];
  slowestNode?: string;
}

export interface CostBreakdownRow {
  node: string;
  label: string;
  tokens: number;
  costUsd: number;
  pct: number; // share of total cost
  isMostExpensive: boolean;
}

export interface CostBreakdown {
  totalTokens: number;
  totalCostUsd: number;
  rows: CostBreakdownRow[];
  mostExpensiveNode?: string;
  estimatedCostPer100Docs: number;
}

export interface GroundingStats {
  evidenceCoveragePct: number; // 0..100
  fieldsTotal: number;
  fieldsWithEvidence: number;
  fieldsWithoutEvidence: string[]; // labels
  risksTotal: number;
  risksWithEvidence: number;
  risksWithoutEvidence: string[]; // titles
  criticGroundingFlags: number;
  recommendation: string;
}

export type RegressionResult = "passed" | "passed_with_warnings" | "failed";

export interface RegressionPreview {
  sampleId: string;
  sampleTitle: string;
  expectedRiskCount: number;
  detectedRiskCount: number;
  expectedRisks: { title: string; severity: string }[];
  detectedRisks: { title: string; severity: string }[];
  requiredFields: number;
  missingFields: string[];
  schemaStatus: "pass" | "warnings" | "needs_review" | "pending";
  result: RegressionResult;
  notes: string[];
}

export interface AggregateSampleEvalRow {
  sampleId: string;
  sampleTitle: string;
  documentTypeLabel: string;
  jsonValidity: number;
  extractionCompleteness: number;
  evidenceGrounding: number;
  riskDetection: number;
  hallucinationRisk: number;
  latencyMs: number;
  costUsd: number;
  status: DashboardStatus;
  qualityScore: number;
  grade: EvalGrade;
}

// ---------- Targets & metric metadata ----------

export interface MetricMeta {
  key: string;
  label: string;
  unit: string;
  target: number;
  direction: "higher_is_better" | "lower_is_better";
  explanation: string;
}

export const METRIC_META: Record<string, MetricMeta> = {
  json_validity: {
    key: "json_validity",
    label: "JSON Validity",
    unit: "%",
    target: 100,
    direction: "higher_is_better",
    explanation: "Share of outputs that parse cleanly against the typed schema.",
  },
  extraction_completeness: {
    key: "extraction_completeness",
    label: "Extraction Completeness",
    unit: "%",
    target: 90,
    direction: "higher_is_better",
    explanation: "Required fields populated vs schema contract.",
  },
  evidence_grounding: {
    key: "evidence_grounding",
    label: "Evidence Grounding",
    unit: "%",
    target: 90,
    direction: "higher_is_better",
    explanation: "Extracted values backed by a verbatim source quote.",
  },
  hallucination_risk: {
    key: "hallucination_risk",
    label: "Hallucination Risk",
    unit: "%",
    target: 15,
    direction: "lower_is_better",
    explanation: "Estimated probability of unsupported content (lower is better).",
  },
  risk_detection: {
    key: "risk_detection",
    label: "Risk Detection",
    unit: "%",
    target: 85,
    direction: "higher_is_better",
    explanation: "Recall vs the labeled golden-set risks for this document.",
  },
  handover_usefulness: {
    key: "handover_usefulness",
    label: "Handover Usefulness",
    unit: "%",
    target: 90,
    direction: "higher_is_better",
    explanation: "Rubric: clarity, named owner, actions, traceable risks.",
  },
  confidence_calibration: {
    key: "confidence_calibration",
    label: "Confidence Calibration",
    unit: "%",
    target: 85,
    direction: "higher_is_better",
    explanation: "How well stated confidence tracks observed accuracy.",
  },
  latency: {
    key: "latency",
    label: "Latency",
    unit: "ms",
    target: 15000,
    direction: "lower_is_better",
    explanation: "End-to-end pipeline latency per document.",
  },
  token_cost: {
    key: "token_cost",
    label: "Token Cost",
    unit: "USD",
    target: 0.1,
    direction: "lower_is_better",
    explanation: "Estimated provider spend per document.",
  },
};

const NODE_LABELS: Record<string, string> = {
  ingest_document: "Ingest",
  classify_document: "Classify",
  extract_structured_data: "Extract",
  validate_schema: "Validate",
  detect_risks: "Risks",
  generate_handover: "Handover",
  critic_review: "Critic",
  run_evals: "Evals",
  human_review: "Human",
};

// ---------- Status helpers ----------

export function getEvalStatus(metric: {
  value: number;
  target?: number;
  direction: "higher_is_better" | "lower_is_better";
}): EvalStatus {
  const target = metric.target ?? 0;
  if (metric.direction === "higher_is_better") {
    if (metric.value >= target) return "pass";
    if (metric.value >= target - 10) return "warn";
    return "fail";
  } else {
    if (metric.value <= target) return "pass";
    if (metric.value <= target + 10) return "warn";
    return "fail";
  }
}

export function normalizeMetricForRadar(metric: {
  value: number;
  target?: number;
  direction: "higher_is_better" | "lower_is_better";
  unit?: string;
}): number {
  // Returns 0..1 where 1 is best.
  if (metric.direction === "higher_is_better") {
    return Math.max(0, Math.min(1, metric.value / 100));
  }
  // lower_is_better — assume percentage scale (0..100) where 0 is ideal.
  // For 0..100 scale (e.g. hallucination risk %), normalized = 1 - value/100.
  // For non-percent (latency/cost), use target-based normalization.
  if (metric.unit === "%") {
    return Math.max(0, Math.min(1, 1 - metric.value / 100));
  }
  const target = metric.target ?? metric.value;
  if (target <= 0) return metric.value <= 0 ? 1 : 0;
  // 1 at value=0, 1 at value=target/2, drops to 0.5 at target, 0 at 2x target.
  const ratio = metric.value / target;
  if (ratio <= 0.5) return 1;
  if (ratio >= 2) return 0;
  return Math.max(0, 1 - (ratio - 0.5) / 1.5);
}

// ---------- Quality score ----------

const QUALITY_KEYS = [
  "json_validity",
  "extraction_completeness",
  "evidence_grounding",
  "risk_detection",
  "handover_usefulness",
  "confidence_calibration",
] as const;

export function getOverallQualityScore(evals: EvaluationMetric[] | undefined): QualityScore {
  if (!evals || evals.length === 0) {
    return { score: 0, grade: "D", explanation: "Evaluation step has not run yet." };
  }
  const map = new Map(evals.map((e) => [e.key, e]));
  const positives = QUALITY_KEYS.map((k) => map.get(k)?.value ?? 0);
  const halluc = map.get("hallucination_risk")?.value ?? 100;
  const hallucInverse = Math.max(0, 100 - halluc);
  const all = [...positives, hallucInverse];
  const score = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  const grade = getEvalGrade(score);
  const explanation =
    score >= 90
      ? "Production-grade quality across schema, grounding, risk recall and handover."
      : score >= 80
        ? "Strong quality with minor calibration or completeness gaps."
        : score >= 65
          ? "Acceptable but requires human review before downstream use."
          : "Below operational quality bar — block downstream automation.";
  return { score, grade, explanation };
}

export function getEvalGrade(score: number): EvalGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  return "D";
}

export function getEvalDashboardStatus(
  evals: EvaluationMetric[] | undefined,
): DashboardStatus {
  if (!evals || evals.length === 0) return "Needs Review";
  const map = new Map(evals.map((e) => [e.key, e]));
  const positives = QUALITY_KEYS.map((k) => map.get(k)?.value ?? 0);
  const avg = positives.reduce((a, b) => a + b, 0) / positives.length;
  const halluc = map.get("hallucination_risk")?.value ?? 100;
  if (avg >= 90 && halluc <= 10) return "Excellent";
  if (avg >= 80 && halluc <= 20) return "Passing";
  if (avg >= 65) return "Needs Review";
  return "Failing";
}

export function buildMetricViews(
  evals: EvaluationMetric[] | undefined,
): EvalMetricView[] {
  if (!evals) return [];
  return evals.map((m) => ({
    ...m,
    status: getEvalStatus(m),
    normalized: normalizeMetricForRadar(m),
  }));
}

// ---------- Latency breakdown ----------

export function getLatencyBreakdown(steps: AnalysisStep[] | undefined): LatencyBreakdown {
  const list = (steps ?? []).filter(
    (s) => s.node !== "human_review" && (s.durationMs ?? 0) > 0,
  );
  const total = list.reduce((acc, s) => acc + (s.durationMs ?? 0), 0);
  let slowest: AnalysisStep | undefined;
  for (const s of list) {
    if (!slowest || (s.durationMs ?? 0) > (slowest.durationMs ?? 0)) slowest = s;
  }
  const rows: LatencyBreakdownRow[] = list.map((s) => ({
    node: s.node,
    label: NODE_LABELS[s.node] ?? s.label,
    durationMs: s.durationMs ?? 0,
    pct: total > 0 ? ((s.durationMs ?? 0) / total) * 100 : 0,
    status: s.status,
    isSlowest: slowest?.node === s.node,
  }));
  return { totalMs: total, rows, slowestNode: slowest?.node };
}

// ---------- Cost breakdown ----------

export function getTokenCostBreakdown(
  steps: AnalysisStep[] | undefined,
): CostBreakdown {
  const list = (steps ?? []).filter((s) => (s.tokens ?? 0) > 0 || (s.costUsd ?? 0) > 0);
  const totalCost = list.reduce((acc, s) => acc + (s.costUsd ?? 0), 0);
  const totalTokens = list.reduce((acc, s) => acc + (s.tokens ?? 0), 0);
  let priciest: AnalysisStep | undefined;
  for (const s of list) {
    if (!priciest || (s.costUsd ?? 0) > (priciest.costUsd ?? 0)) priciest = s;
  }
  const rows: CostBreakdownRow[] = list.map((s) => ({
    node: s.node,
    label: NODE_LABELS[s.node] ?? s.label,
    tokens: s.tokens ?? 0,
    costUsd: s.costUsd ?? 0,
    pct: totalCost > 0 ? ((s.costUsd ?? 0) / totalCost) * 100 : 0,
    isMostExpensive: priciest?.node === s.node,
  }));
  return {
    totalTokens,
    totalCostUsd: +totalCost.toFixed(6),
    rows,
    mostExpensiveNode: priciest?.node,
    estimatedCostPer100Docs: +(totalCost * 100).toFixed(2),
  };
}

// ---------- Grounding ----------

export function getGroundingStats(run: AnalysisRun | null | undefined): GroundingStats {
  const fields = getExtractionFields(run);
  const present = fields.filter((f) => !isFieldMissing(f));
  const withEvidence = present.filter((f) => f.evidenceQuote && f.evidenceQuote.trim().length > 0);
  const withoutEvidence = present
    .filter((f) => !f.evidenceQuote || f.evidenceQuote.trim().length === 0)
    .map((f) => f.label);
  const risks = run?.risks ?? [];
  const risksWithEvidence = risks.filter(
    (r) => r.evidenceQuote && r.evidenceQuote.trim().length > 0,
  );
  const risksWithoutEvidence = risks
    .filter((r) => !r.evidenceQuote || r.evidenceQuote.trim().length === 0)
    .map((r) => r.title);
  const criticIssues = run?.critic?.issues ?? [];
  const criticGroundingFlags = criticIssues.filter(
    (i) =>
      /grounding|evidence|hallucinat|unsupported|cite/i.test(i.message) ||
      i.section === "extraction",
  ).length;
  const totalConsiderable = present.length + risks.length;
  const grounded = withEvidence.length + risksWithEvidence.length;
  const coverage = totalConsiderable > 0 ? Math.round((grounded / totalConsiderable) * 100) : 0;
  let recommendation = "Grounding is healthy — outputs are traceable to source.";
  if (coverage < 70) {
    recommendation =
      "Low grounding coverage — block downstream automation and require human review before use.";
  } else if (coverage < 90) {
    recommendation =
      "Acceptable grounding — re-run extraction with stricter evidence prompting on flagged fields.";
  }
  return {
    evidenceCoveragePct: coverage,
    fieldsTotal: present.length,
    fieldsWithEvidence: withEvidence.length,
    fieldsWithoutEvidence: withoutEvidence,
    risksTotal: risks.length,
    risksWithEvidence: risksWithEvidence.length,
    risksWithoutEvidence,
    criticGroundingFlags,
    recommendation,
  };
}

// ---------- Regression preview ----------

function normalizeTitle(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function fuzzyMatchRisk(expected: string, detected: RiskItem[]): RiskItem | undefined {
  const e = normalizeTitle(expected);
  const eTokens = new Set(e.split(" ").filter((t) => t.length > 3));
  let best: { r: RiskItem; score: number } | undefined;
  for (const r of detected) {
    const d = normalizeTitle(r.title);
    if (d === e) return r;
    const dTokens = new Set(d.split(" ").filter((t) => t.length > 3));
    let overlap = 0;
    for (const t of eTokens) if (dTokens.has(t)) overlap++;
    if (!best || overlap > best.score) best = { r, score: overlap };
  }
  return best && best.score >= 1 ? best.r : undefined;
}

export function getRegressionPreview(
  run: AnalysisRun | null | undefined,
  sample: SampleDocument,
): RegressionPreview {
  const detectedRisks = run?.risks ?? [];
  const fields = getExtractionFields(run);
  const schema = getSchemaForRun(run);
  const summary = summarizeExtraction(fields, schema);
  const missingFields = fields.filter(isFieldMissing).map((f) => f.label);

  const matchedRisks = sample.expectedRisks.filter((er) =>
    fuzzyMatchRisk(er.title, detectedRisks),
  );
  const recall = sample.expectedRisks.length
    ? matchedRisks.length / sample.expectedRisks.length
    : 1;

  let schemaStatus: RegressionPreview["schemaStatus"] = "pending";
  if (fields.length > 0) {
    if (summary.missing === 0 && summary.lowConfidence === 0) schemaStatus = "pass";
    else if (summary.missing === 0) schemaStatus = "warnings";
    else schemaStatus = "needs_review";
  }

  const notes: string[] = [];
  if (recall < 1) {
    const missed = sample.expectedRisks
      .filter((er) => !fuzzyMatchRisk(er.title, detectedRisks))
      .map((m) => m.title);
    notes.push(`Missed ${missed.length} expected risk(s): ${missed.join("; ")}.`);
  }
  if (summary.missing > 0) {
    notes.push(`${summary.missing} required field(s) not populated.`);
  }
  if (summary.lowConfidence > 0) {
    notes.push(`${summary.lowConfidence} low-confidence field(s) need review.`);
  }
  if (notes.length === 0) {
    notes.push("All expected risks detected and required fields populated.");
  }

  let result: RegressionResult = "passed";
  if (recall < 0.8 || schemaStatus === "needs_review") result = "failed";
  else if (recall < 1 || schemaStatus === "warnings") result = "passed_with_warnings";

  return {
    sampleId: sample.id,
    sampleTitle: sample.title,
    expectedRiskCount: sample.expectedRisks.length,
    detectedRiskCount: detectedRisks.length,
    expectedRisks: sample.expectedRisks,
    detectedRisks: detectedRisks.map((r) => ({ title: r.title, severity: r.severity })),
    requiredFields: schema.requiredKeys.length,
    missingFields,
    schemaStatus,
    result,
    notes,
  };
}

// ---------- Aggregate (global Evals page) ----------

function deterministicLatencyMs(sampleId: string): number {
  const fixture = getFixture(sampleId);
  if (!fixture) return 0;
  // Sum midpoint of each node's documented duration range using the simulator's WORKFLOW_NODES.
  // Hardcoded midpoints per sample to keep helper self-contained.
  const PROFILE_LATENCY: Record<string, number> = {
    "cp-northern-pioneer": 9800,
    "sof-aegean-star": 8400,
    "da-fujairah": 7900,
  };
  return PROFILE_LATENCY[sampleId] ?? 9000;
}

function deterministicCostUsd(sampleId: string): number {
  const fixture = getFixture(sampleId);
  if (!fixture) return 0;
  return +Object.values(fixture.stepProfile).reduce((acc, s) => acc + (s.costUsd ?? 0), 0).toFixed(4);
}

export function getAggregateSampleEvalRows(
  samples: SampleDocument[] = SAMPLES,
): AggregateSampleEvalRow[] {
  return samples.map((s) => {
    const fixture = ANALYSIS_FIXTURES[s.id];
    const evals = (fixture?.evals as EvaluationMetric[] | undefined) ?? [];
    const get = (k: string) => evals.find((e) => e.key === k)?.value ?? 0;
    const status = getEvalDashboardStatus(evals);
    const quality = getOverallQualityScore(evals);
    return {
      sampleId: s.id,
      sampleTitle: s.title,
      documentTypeLabel: s.documentTypeLabel,
      jsonValidity: get("json_validity"),
      extractionCompleteness: get("extraction_completeness"),
      evidenceGrounding: get("evidence_grounding"),
      riskDetection: get("risk_detection"),
      hallucinationRisk: get("hallucination_risk"),
      latencyMs: deterministicLatencyMs(s.id),
      costUsd: deterministicCostUsd(s.id),
      status,
      qualityScore: quality.score,
      grade: quality.grade,
    };
  });
}

// ---------- Formatters ----------

export function formatMs(ms: number): string {
  if (ms <= 0) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatUsd(v: number, digits = 4): string {
  return `$${v.toFixed(digits)}`;
}

export function formatMetricValue(m: { value: number; unit?: string }): string {
  if (!m.unit) return String(m.value);
  if (m.unit === "%") return `${Math.round(m.value)}%`;
  if (m.unit === "ms") return formatMs(m.value);
  if (m.unit === "USD") return formatUsd(m.value, 4);
  return `${m.value} ${m.unit}`;
}
