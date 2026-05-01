// Phase 5 — critic helpers (pure, deterministic).
import type {
  AnalysisRun,
  CriticIssue,
  CriticIssueStatus,
  RiskSeverity,
} from "@/types/analysis";
import { SEVERITY_RANK, getRiskStatus } from "@/lib/risks";
import {
  getExtractionFields,
  getSchemaForRun,
  summarizeExtraction,
  validateExtraction,
} from "@/lib/extraction";
import { getHandoverStatus } from "@/lib/handover";

export const CRITIC_VERDICT_LABEL: Record<string, string> = {
  pass: "Pass",
  review: "Review",
  fail: "Fail",
};

export const CRITIC_VERDICT_TOKEN: Record<string, string> = {
  pass: "border-success/40 bg-success/10 text-success",
  review: "border-warning/40 bg-warning/10 text-warning",
  fail: "border-destructive/40 bg-destructive/15 text-destructive",
};

export const CRITIC_SECTION_LABEL: Record<CriticIssue["section"], string> = {
  extraction: "Extraction",
  risks: "Risk Analysis",
  handover: "Handover",
};

export interface CriticStats {
  total: number;
  open: number;
  accepted: number;
  dismissed: number;
  highestSeverity: RiskSeverity | null;
  sectionsReviewed: number;
  bySection: Record<CriticIssue["section"], number>;
}

const SEV_ORDER: RiskSeverity[] = ["critical", "high", "medium", "low"];

export function getCriticStats(
  issues: CriticIssue[] | undefined,
): CriticStats {
  const list = issues ?? [];
  const open = list.filter((i) => i.status === "open").length;
  const accepted = list.filter((i) => i.status === "accepted").length;
  const dismissed = list.filter((i) => i.status === "dismissed").length;
  let highestSeverity: RiskSeverity | null = null;
  for (const s of SEV_ORDER) {
    if (list.some((i) => i.severity === s)) {
      highestSeverity = s;
      break;
    }
  }
  const bySection: Record<CriticIssue["section"], number> = {
    extraction: 0,
    risks: 0,
    handover: 0,
  };
  for (const i of list) bySection[i.section] += 1;
  const sectionsReviewed = (Object.keys(bySection) as CriticIssue["section"][]).filter(
    (k) => bySection[k] > 0,
  ).length;
  return {
    total: list.length,
    open,
    accepted,
    dismissed,
    highestSeverity,
    sectionsReviewed,
    bySection,
  };
}

export function updateCriticIssueStatus(
  issues: CriticIssue[],
  id: string,
  status: CriticIssueStatus,
): CriticIssue[] {
  return issues.map((i) => (i.id === id ? { ...i, status } : i));
}

export type GateState = "pass" | "warn" | "fail" | "pending";

export interface GateCheck {
  key: string;
  label: string;
  state: GateState;
  detail: string;
}

export interface QualityGateReport {
  checks: GateCheck[];
  ready: boolean;
  blockingCount: number;
  warningCount: number;
}

export function getQualityGateStatus(
  run: AnalysisRun | null | undefined,
): QualityGateReport {
  const checks: GateCheck[] = [];

  // 1. Extraction schema valid
  const schema = getSchemaForRun(run);
  const validation = validateExtraction(run, schema);
  if (validation.status === "pending") {
    checks.push({
      key: "schema",
      label: "Extraction schema valid",
      state: "pending",
      detail: "Extraction has not run yet.",
    });
  } else {
    checks.push({
      key: "schema",
      label: "Extraction schema valid",
      state:
        validation.status === "pass"
          ? "pass"
          : validation.status === "warnings"
            ? "warn"
            : "fail",
      detail: `${validation.fieldsChecked} fields checked, ${validation.issuesFound} issue(s).`,
    });
  }

  // 2. Missing fields reviewed
  const fields = getExtractionFields(run);
  const summary = summarizeExtraction(fields, schema);
  const missingReviewed = fields
    .filter((f) => f.isMissing)
    .every((f) => f.userConfirmed || f.userEdited);
  checks.push({
    key: "missing",
    label: "Missing fields reviewed",
    state: fields.length === 0 ? "pending" : missingReviewed ? "pass" : summary.missing > 0 ? "warn" : "pass",
    detail:
      summary.missing === 0
        ? "No missing required fields."
        : `${summary.missing} field(s) missing — ${missingReviewed ? "all reviewed" : "review pending"}.`,
  });

  // 3. Risk evidence attached
  const risks = run?.risks ?? [];
  const evidenceAttached = risks.length === 0
    ? "pending"
    : risks.every((r) => Boolean(r.evidenceQuote))
      ? "pass"
      : "warn";
  checks.push({
    key: "risk_evidence",
    label: "Risk evidence attached",
    state: evidenceAttached as GateState,
    detail:
      risks.length === 0
        ? "Risk detection has not run yet."
        : `${risks.filter((r) => r.evidenceQuote).length}/${risks.length} risks have source evidence.`,
  });

  // 4. High/critical risks reviewed
  const highRisks = risks.filter(
    (r) => r.severity === "high" || r.severity === "critical",
  );
  const highReviewed = highRisks.every((r) => getRiskStatus(r) !== "open");
  checks.push({
    key: "high_reviewed",
    label: "High / critical risks reviewed",
    state:
      risks.length === 0
        ? "pending"
        : highRisks.length === 0
          ? "pass"
          : highReviewed
            ? "pass"
            : "fail",
    detail:
      highRisks.length === 0
        ? "No high or critical risks."
        : `${highRisks.filter((r) => getRiskStatus(r) !== "open").length}/${highRisks.length} reviewed.`,
  });

  // 5. Handover includes next actions
  const handover = run?.handover;
  checks.push({
    key: "handover_actions",
    label: "Handover includes next actions",
    state: !handover
      ? "pending"
      : handover.nextActions.length > 0
        ? "pass"
        : "warn",
    detail: !handover
      ? "Handover not generated yet."
      : `${handover.nextActions.length} next action(s) listed.`,
  });

  // 6. Handover approved by human
  const handoverStatus = getHandoverStatus(run);
  checks.push({
    key: "handover_approved",
    label: "Handover approved by human",
    state: !handover
      ? "pending"
      : handoverStatus === "approved"
        ? "pass"
        : "warn",
    detail: !handover
      ? "Handover not generated yet."
      : handoverStatus === "approved"
        ? `Approved at ${new Date(handover.approvedAt!).toLocaleString()}.`
        : `Current status: ${handoverStatus.replace(/_/g, " ")}.`,
  });

  // 7. No unresolved critic fail-level issues
  const critic = run?.critic;
  if (!critic) {
    checks.push({
      key: "critic_clear",
      label: "No unresolved critic blocking issues",
      state: "pending",
      detail: "Critic has not run yet.",
    });
  } else {
    const blocking = critic.issues.filter(
      (i) => i.status === "open" && (i.severity === "high" || i.severity === "critical"),
    );
    checks.push({
      key: "critic_clear",
      label: "No unresolved critic blocking issues",
      state: blocking.length === 0 ? "pass" : "fail",
      detail:
        blocking.length === 0
          ? "All blocking critic issues resolved."
          : `${blocking.length} blocking issue(s) still open.`,
    });
  }

  const blockingCount = checks.filter((c) => c.state === "fail").length;
  const warningCount = checks.filter((c) => c.state === "warn").length;
  const pendingCount = checks.filter((c) => c.state === "pending").length;
  const ready = blockingCount === 0 && warningCount === 0 && pendingCount === 0;
  return { checks, ready, blockingCount, warningCount };
}

export interface CriticRecommendation {
  blockingIssue: string;
  nextStep: string;
  exportReadiness: string;
}

export function getCriticRecommendations(
  run: AnalysisRun | null | undefined,
): CriticRecommendation {
  const critic = run?.critic;
  const gate = getQualityGateStatus(run);
  const issues = critic?.issues ?? [];
  const sortedIssues = [...issues].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  );
  const topOpen = sortedIssues.find((i) => i.status === "open");

  const blockingIssue = topOpen
    ? `The main blocking issue is: ${topOpen.message}`
    : critic
      ? "No blocking critic issues remain."
      : "Critic review has not run yet.";

  const failingGate = gate.checks.find((c) => c.state === "fail");
  const warningGate = gate.checks.find((c) => c.state === "warn");
  const nextStep = failingGate
    ? `Recommended next step: resolve "${failingGate.label}" — ${failingGate.detail}`
    : warningGate
      ? `Recommended next step: address "${warningGate.label}" — ${warningGate.detail}`
      : topOpen
        ? `Recommended next step: review the ${topOpen.section} section and accept or dismiss the suggested fix.`
        : "Recommended next step: proceed to human approval.";

  const exportReadiness = gate.ready
    ? "Export readiness: ready for export."
    : `Export readiness: human review required (${gate.blockingCount} blocker(s), ${gate.warningCount} warning(s)).`;

  return { blockingIssue, nextStep, exportReadiness };
}
