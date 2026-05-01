// Phase 4 — risk review helpers (pure, deterministic, frontend-only).
import type {
  RiskCategory,
  RiskItem,
  RiskReviewStatus,
  RiskSeverity,
} from "@/types/analysis";

export const SEVERITY_RANK: Record<RiskSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const SEVERITY_ORDER: RiskSeverity[] = ["critical", "high", "medium", "low"];

export const CATEGORY_ORDER: RiskCategory[] = [
  "contractual",
  "operational",
  "compliance",
  "financial",
  "data_quality",
  "timing",
  "documentation",
];

export const STATUS_ORDER: RiskReviewStatus[] = [
  "open",
  "needs_follow_up",
  "accepted",
  "dismissed",
];

export const CATEGORY_LABEL: Record<RiskCategory, string> = {
  contractual: "Contractual",
  operational: "Operational",
  compliance: "Compliance",
  financial: "Financial",
  data_quality: "Data Quality",
  timing: "Timing",
  documentation: "Documentation",
};

export const STATUS_LABEL: Record<RiskReviewStatus, string> = {
  open: "Open",
  needs_follow_up: "Needs Follow-up",
  accepted: "Accepted",
  dismissed: "Dismissed",
};

export const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const CATEGORY_DESCRIPTIONS: Record<
  RiskCategory,
  { description: string; example: string }
> = {
  contractual: {
    description: "Ambiguity, gaps, or exposure in contract clauses (CP, addenda).",
    example: "Laytime commencement wording is ambiguous.",
  },
  operational: {
    description: "Vessel, port, or logistics execution issues affecting the call.",
    example: "Discharge port agent not yet appointed.",
  },
  compliance: {
    description: "Regulatory, sanctions, or class/flag obligations.",
    example: "Sanctions screening reference missing.",
  },
  financial: {
    description: "Cost, demurrage, FX, or DA exposure with monetary impact.",
    example: "Oversized miscellaneous DA line without breakdown.",
  },
  data_quality: {
    description: "Source document gaps, low-confidence extractions, missing fields.",
    example: "Field returned as ‘TBN’ should be marked missing.",
  },
  timing: {
    description: "Schedule, NOR, laytime, or window-based events.",
    example: "NOR tendered outside office hours.",
  },
  documentation: {
    description: "Missing or unattached supporting documents and audit trail.",
    example: "Agent appointment letter not attached.",
  },
};

export const OWNER_SUGGESTION: Record<RiskCategory, string> = {
  contractual: "Chartering Analyst",
  operational: "Operations Manager",
  compliance: "Compliance Officer",
  financial: "DA / Finance Reviewer",
  timing: "Port Call Coordinator",
  documentation: "Operations Coordinator",
  data_quality: "Human Reviewer",
};

export function getRiskOwnerSuggestion(category: RiskCategory): string {
  return OWNER_SUGGESTION[category] ?? "Operations Manager";
}

export function getRiskStatus(risk: RiskItem): RiskReviewStatus {
  return risk.status ?? "open";
}

export function getRiskSeverityRank(s: RiskSeverity): number {
  return SEVERITY_RANK[s] ?? 0;
}

export interface RiskFiltersState {
  severity: "all" | RiskSeverity;
  category: "all" | RiskCategory;
  status: "all" | RiskReviewStatus;
}

export type RiskSortKey = "severity" | "confidence" | "category" | "status";

export const DEFAULT_FILTERS: RiskFiltersState = {
  severity: "all",
  category: "all",
  status: "all",
};

export function filterRisks(risks: RiskItem[], f: RiskFiltersState): RiskItem[] {
  return risks.filter((r) => {
    if (f.severity !== "all" && r.severity !== f.severity) return false;
    if (f.category !== "all" && r.category !== f.category) return false;
    if (f.status !== "all" && getRiskStatus(r) !== f.status) return false;
    return true;
  });
}

export function sortRisks(risks: RiskItem[], key: RiskSortKey): RiskItem[] {
  const copy = [...risks];
  switch (key) {
    case "severity":
      copy.sort(
        (a, b) =>
          SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
          b.confidence - a.confidence,
      );
      break;
    case "confidence":
      copy.sort((a, b) => b.confidence - a.confidence);
      break;
    case "category":
      copy.sort(
        (a, b) =>
          a.category.localeCompare(b.category) ||
          SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
      );
      break;
    case "status":
      copy.sort((a, b) => {
        const ai = STATUS_ORDER.indexOf(getRiskStatus(a));
        const bi = STATUS_ORDER.indexOf(getRiskStatus(b));
        return ai - bi || SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
      });
      break;
  }
  return copy;
}

export interface RiskSummaryStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgConfidence: number;
  open: number;
  accepted: number;
  dismissed: number;
  needsFollowUp: number;
  highestSeverity: RiskSeverity | null;
  reviewProgress: number; // 0..1
}

export function getRiskSummaryStats(risks: RiskItem[]): RiskSummaryStats {
  const total = risks.length;
  const critical = risks.filter((r) => r.severity === "critical").length;
  const high = risks.filter((r) => r.severity === "high").length;
  const medium = risks.filter((r) => r.severity === "medium").length;
  const low = risks.filter((r) => r.severity === "low").length;
  const avgConfidence =
    total > 0 ? risks.reduce((acc, r) => acc + r.confidence, 0) / total : 0;
  const open = risks.filter((r) => getRiskStatus(r) === "open").length;
  const accepted = risks.filter((r) => getRiskStatus(r) === "accepted").length;
  const dismissed = risks.filter((r) => getRiskStatus(r) === "dismissed").length;
  const needsFollowUp = risks.filter(
    (r) => getRiskStatus(r) === "needs_follow_up",
  ).length;
  let highestSeverity: RiskSeverity | null = null;
  for (const s of SEVERITY_ORDER) {
    if (risks.some((r) => r.severity === s)) {
      highestSeverity = s;
      break;
    }
  }
  const reviewed = accepted + dismissed + needsFollowUp;
  const reviewProgress = total > 0 ? reviewed / total : 0;
  return {
    total,
    critical,
    high,
    medium,
    low,
    avgConfidence,
    open,
    accepted,
    dismissed,
    needsFollowUp,
    highestSeverity,
    reviewProgress,
  };
}

export type RiskReviewBanner =
  | "no_risks"
  | "review_required"
  | "critical_attention"
  | "review_complete";

export function getRiskReviewStatus(stats: RiskSummaryStats): RiskReviewBanner {
  if (stats.total === 0) return "no_risks";
  if (stats.open === 0) return "review_complete";
  if (stats.critical > 0 || stats.high > 0) return "critical_attention";
  return "review_required";
}

export interface RiskIntelligence {
  paragraph: string;
  topActions: string[];
  approvalNote?: string;
  completedNote?: string;
}

export function getRiskIntelligence(risks: RiskItem[]): RiskIntelligence {
  const stats = getRiskSummaryStats(risks);
  if (stats.total === 0) {
    return {
      paragraph:
        "No material risks were detected by the agent. Human review is still recommended before approval.",
      topActions: [],
    };
  }

  const sorted = sortRisks(risks, "severity");
  const top = sorted.slice(0, 3);
  const topActions = top.map((r) => r.recommendedAction);

  const dominantCategory = (() => {
    const counts = new Map<RiskCategory, number>();
    for (const r of risks) counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
    let best: RiskCategory | null = null;
    let bestN = 0;
    for (const [k, v] of counts.entries()) {
      if (v > bestN) {
        best = k;
        bestN = v;
      }
    }
    return best;
  })();

  const concernPhrase =
    stats.critical > 0
      ? `${stats.critical} critical and ${stats.high} high-severity items require immediate attention`
      : stats.high > 0
        ? `${stats.high} high-severity item${stats.high === 1 ? "" : "s"} require${stats.high === 1 ? "s" : ""} review`
        : stats.medium > 0
          ? `${stats.medium} medium-severity item${stats.medium === 1 ? "" : "s"} flagged for follow-up`
          : `${stats.low} low-severity item${stats.low === 1 ? "" : "s"} noted for awareness`;

  const categoryPhrase = dominantCategory
    ? `Dominant exposure is ${CATEGORY_LABEL[dominantCategory].toLowerCase()}.`
    : "";

  const paragraph = `Agent flagged ${stats.total} risk${stats.total === 1 ? "" : "s"} with average confidence ${(stats.avgConfidence * 100).toFixed(0)}%. ${concernPhrase}. ${categoryPhrase}`.trim();

  const result: RiskIntelligence = { paragraph, topActions };
  if (stats.critical > 0 || stats.high > 0) {
    result.approvalNote = "Human approval recommended before proceeding.";
  }
  if (stats.open === 0 && stats.total > 0) {
    result.completedNote = "Risk review completed.";
  }
  return result;
}

// ---------- Severity & status visual tokens (semantic, design-system) ----------

export interface SeverityToken {
  badge: string; // class for badge bg/text/border
  ringRow: string; // class for left border / accent on a row/card
  dot: string;
}

export const SEVERITY_TOKENS: Record<RiskSeverity, SeverityToken> = {
  critical: {
    badge: "border-destructive/40 bg-destructive/15 text-destructive",
    ringRow: "border-l-destructive",
    dot: "bg-destructive",
  },
  high: {
    badge: "border-high/40 bg-high/15 text-high",
    ringRow: "border-l-high",
    dot: "bg-high",
  },
  medium: {
    badge: "border-warning/40 bg-warning/15 text-warning",
    ringRow: "border-l-warning",
    dot: "bg-warning",
  },
  low: {
    badge: "border-secondary/40 bg-secondary/10 text-secondary",
    ringRow: "border-l-secondary",
    dot: "bg-secondary",
  },
};

export const STATUS_TOKENS: Record<RiskReviewStatus, string> = {
  open: "border-border text-muted-foreground bg-muted/30",
  accepted: "border-success/40 bg-success/10 text-success",
  dismissed: "border-border bg-muted/40 text-muted-foreground",
  needs_follow_up: "border-warning/40 bg-warning/10 text-warning",
};
