// Phase 5 — handover helpers (pure, deterministic).
import type {
  AnalysisRun,
  HandoverReviewStatus,
  HandoverSummary,
  RiskItem,
  RiskSeverity,
} from "@/types/analysis";
import { SEVERITY_RANK, getRiskStatus } from "@/lib/risks";

export function getHandoverContent(handover: HandoverSummary): string {
  return handover.editedMarkdown ?? handover.markdown;
}

export function getHandoverStatus(
  run: AnalysisRun | null | undefined,
): HandoverReviewStatus {
  if (!run?.handover) return "not_generated";
  const h = run.handover;
  if (h.approved) return "approved";
  const risks = run.risks ?? [];
  const openCriticalOrHigh = risks.filter(
    (r) =>
      (r.severity === "critical" || r.severity === "high") &&
      getRiskStatus(r) === "open",
  );
  if (openCriticalOrHigh.length > 0) return "needs_review";
  if (h.userEdited) return "edited";
  return "draft";
}

export const HANDOVER_STATUS_LABEL: Record<HandoverReviewStatus, string> = {
  not_generated: "Not Generated Yet",
  draft: "Draft",
  needs_review: "Needs Review",
  edited: "Edited",
  approved: "Approved",
};

export const HANDOVER_STATUS_TOKEN: Record<HandoverReviewStatus, string> = {
  not_generated: "border-border text-muted-foreground bg-muted/30",
  draft: "border-primary/30 bg-primary/10 text-primary",
  needs_review: "border-warning/40 bg-warning/10 text-warning",
  edited: "border-secondary/40 bg-secondary/10 text-secondary",
  approved: "border-success/40 bg-success/10 text-success",
};

export interface HandoverActionItem {
  id: string;
  text: string;
  priority: RiskSeverity | null;
  owner?: string;
  linkedRiskId?: string;
}

const KEYWORDS: Record<string, RegExp[]> = {
  agent: [/agent/i, /appoint/i, /nominat/i],
  laytime: [/laytime/i, /nor/i, /clause/i, /office[- ]?hour/i],
  miscellaneous: [/miscellaneous/i, /breakdown/i, /itemiz/i],
  fx: [/\bfx\b/i, /exchange rate/i],
  weather: [/weather/i, /rain/i, /stoppage/i],
  bunkers: [/bunker/i, /pre[- ]?stem/i, /load[- ]?port/i, /readiness/i],
  claims: [/claims/i, /post[- ]?fix/i, /despatch/i],
  appointment: [/appointment letter/i],
};

function pickPriorityForAction(
  text: string,
  risks: RiskItem[],
): { severity: RiskSeverity | null; riskId?: string } {
  // Match against risk titles/descriptions — pick highest severity match.
  let best: { severity: RiskSeverity; id: string } | null = null;
  for (const r of risks) {
    const haystack = `${r.title} ${r.description} ${r.recommendedAction}`.toLowerCase();
    const t = text.toLowerCase();
    const hits = haystack.split(/\s+/).filter((w) => w.length > 4 && t.includes(w)).length;
    let topical = false;
    for (const patterns of Object.values(KEYWORDS)) {
      const inAction = patterns.some((p) => p.test(text));
      const inRisk = patterns.some((p) => p.test(r.title) || p.test(r.description));
      if (inAction && inRisk) {
        topical = true;
        break;
      }
    }
    if (hits >= 1 || topical) {
      if (!best || SEVERITY_RANK[r.severity] > SEVERITY_RANK[best.severity]) {
        best = { severity: r.severity, id: r.id };
      }
    }
  }
  return best
    ? { severity: best.severity, riskId: best.id }
    : { severity: null };
}

export function getHandoverActions(
  run: AnalysisRun | null | undefined,
): HandoverActionItem[] {
  if (!run?.handover) return [];
  const risks = run.risks ?? [];
  return run.handover.nextActions.map((text, idx) => {
    const { severity, riskId } = pickPriorityForAction(text, risks);
    return {
      id: `act_${idx}`,
      text,
      priority: severity,
      linkedRiskId: riskId,
    };
  });
}

export function getLinkedRisksForHandover(
  run: AnalysisRun | null | undefined,
): RiskItem[] {
  const risks = run?.risks ?? [];
  if (risks.length === 0) return [];
  // Linked = high/critical OR explicitly mentioned in headlineRisks.
  const titles = run?.handover?.headlineRisks?.map((s) => s.toLowerCase()) ?? [];
  const linked = risks.filter((r) => {
    if (r.severity === "critical" || r.severity === "high") return true;
    return titles.some((t) => t.includes(r.title.toLowerCase().slice(0, 12)));
  });
  // Sort by severity desc.
  return [...linked].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  );
}

// Deterministic counterparty/agent questions per sample.
export interface CounterpartyQuestion {
  id: string;
  text: string;
  audience: "Charterer" | "Agent" | "Owner" | "Counterparty";
}

const QUESTIONS_BY_SAMPLE: Record<string, CounterpartyQuestion[]> = {
  "cp-northern-pioneer": [
    { id: "q1", audience: "Charterer", text: "Please confirm the nominated discharge port agent at Singapore and contact details (T-5 days minimum)." },
    { id: "q2", audience: "Charterer", text: "Please confirm the exact laytime commencement trigger and whether NOR can be tendered at anchorage." },
    { id: "q3", audience: "Charterer", text: "Please confirm the despatch calculation basis and treatment of ‘working time only’." },
    { id: "q4", audience: "Charterer", text: "Please confirm any office-hour or turn-time restrictions applicable to NOR validity." },
  ],
  "sof-aegean-star": [
    { id: "q1", audience: "Charterer", text: "Please confirm whether the 3h 30m rain stoppage is excluded from laytime under the governing CP weather clause." },
    { id: "q2", audience: "Charterer", text: "Please confirm office hours applicable to NOR tendering at Santos." },
    { id: "q3", audience: "Agent", text: "Please share the port log timestamps to reconcile against the SoF." },
  ],
  "da-fujairah": [
    { id: "q1", audience: "Agent", text: "Please provide an itemized breakdown for the USD 7,500 miscellaneous line." },
    { id: "q2", audience: "Agent", text: "Please confirm FX basis (source, value date) for any local-currency components." },
    { id: "q3", audience: "Agent", text: "Please provide the agent appointment letter reference and a signed copy." },
    { id: "q4", audience: "Agent", text: "Please benchmark the DA against your last three Fujairah port calls for the same vessel size." },
  ],
};

export function getQuestionsForSample(sampleId: string): CounterpartyQuestion[] {
  return QUESTIONS_BY_SAMPLE[sampleId] ?? [];
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    );
  }
  return Promise.resolve(false);
}
