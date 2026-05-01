// Deterministic per-sample analysis outputs for the Phase 2 simulator.
import type {
  ClassificationResult,
  CriticReview,
  EvaluationMetric,
  ExtractedField,
  HandoverSummary,
  RiskItem,
} from "@/types/analysis";

export interface SampleAnalysisFixture {
  classification: ClassificationResult;
  extraction: ExtractedField[];
  risks: RiskItem[];
  handover: Omit<HandoverSummary, "generatedAt">;
  critic: CriticReview;
  evals: Omit<EvaluationMetric, "value"> & { baseValue: number } extends never
    ? never
    : EvaluationMetric[];
  // Per-step token/cost profile (deterministic).
  stepProfile: Record<
    string,
    { tokens: number; costUsd: number; confidence?: number }
  >;
}

const cp: SampleAnalysisFixture = {
  classification: {
    type: "charter_party",
    confidence: 0.96,
    alternatives: [
      { type: "statement_of_facts", probability: 0.03 },
      { type: "handover_email", probability: 0.01 },
    ],
  },
  extraction: [
    { key: "vessel", label: "Vessel Name", value: "MV Northern Pioneer", confidence: 0.98, evidenceQuote: "Vessel: MV Northern Pioneer (IMO 9500001)" },
    { key: "owner", label: "Owner", value: "Polaris Shipping Ltd.", confidence: 0.97, evidenceQuote: "Owner: Polaris Shipping Ltd." },
    { key: "charterer", label: "Charterer", value: "Helios Trading SA", confidence: 0.97, evidenceQuote: "Charterer: Helios Trading SA" },
    { key: "cargo", label: "Cargo", value: "55,000 MT HSFO", confidence: 0.95, evidenceQuote: "Cargo: 55,000 MT High Sulphur Fuel Oil (HSFO)" },
    { key: "load_port", label: "Load Port", value: "Rotterdam", confidence: 0.98, evidenceQuote: "Load Port: Rotterdam, NL" },
    { key: "discharge_port", label: "Discharge Port", value: "Singapore", confidence: 0.98, evidenceQuote: "Discharge Port: Singapore, SG" },
    { key: "laycan", label: "Laycan", value: "12–18 Jun 2026", confidence: 0.94, evidenceQuote: "Laycan: 12 – 18 June 2026" },
    { key: "demurrage", label: "Demurrage Rate", value: "USD 24,500/day pro rata", confidence: 0.96, evidenceQuote: "Demurrage: USD 24,500 per day pro rata." },
    { key: "despatch", label: "Despatch Terms", value: "Half demurrage", confidence: 0.86, evidenceQuote: "Despatch: Half demurrage on laytime saved, working time only." },
    { key: "law", label: "Governing Law", value: "English law (LMAA)", confidence: 0.97, evidenceQuote: "Governing Law: English law; arbitration London (LMAA terms)." },
    { key: "load_agent", label: "Load Port Agent", value: "Maas Marine Agencies B.V.", confidence: 0.95, evidenceQuote: "Load Port Agent: Maas Marine Agencies B.V." },
    { key: "discharge_agent", label: "Discharge Port Agent", value: "TBN", confidence: 0.40, evidenceQuote: "Discharge Port Agent: TBN.", isMissing: true },
    { key: "laytime_trigger", label: "Laytime Commencement Trigger", value: "Not specified", confidence: 0.35, isMissing: true },
  ],
  risks: [
    {
      id: "r1",
      title: "Discharge port agent not confirmed",
      category: "operational",
      severity: "high",
      description: "Discharge agent is listed as TBN. Cargo operations at Singapore cannot be coordinated until appointed.",
      evidenceQuote: "Discharge Port Agent: TBN.",
      businessImpact: "Risk of delayed berth coordination, demurrage exposure on arrival.",
      recommendedAction: "Confirm discharge agent with Charterer at least 5 days before ETA Singapore.",
      confidence: 0.92,
    },
    {
      id: "r2",
      title: "Ambiguous laytime commencement",
      category: "contractual",
      severity: "medium",
      description: "Clause references NOR tender but does not state turn-time, weekend rules or office-hour restrictions.",
      evidenceQuote: "Commencement upon NOR tender (see clause 6).",
      businessImpact: "Potential dispute on laytime calculation; demurrage/despatch exposure.",
      recommendedAction: "Request clarification of clause 6 or insert standard 6-hour turn-time wording.",
      confidence: 0.84,
    },
    {
      id: "r3",
      title: "Despatch wording ambiguity",
      category: "financial",
      severity: "low",
      description: "‘Working time only’ qualifier may be interpreted narrowly by Charterer.",
      evidenceQuote: "Despatch: Half demurrage on laytime saved, working time only.",
      businessImpact: "Minor downside on despatch claim if laytime is saved.",
      recommendedAction: "Note for post-fixture; align with claims team on standard interpretation.",
      confidence: 0.78,
    },
  ],
  handover: {
    markdown: `# Handover — MV Northern Pioneer (Voyage CP)

## Executive Summary
Voyage charter from **Rotterdam → Singapore**, 55,000 MT HSFO, laycan **12–18 Jun 2026**. Demurrage **USD 24,500/day pro rata**, English law / LMAA. Document is well-formed but contains **3 risk items**, including a **missing discharge agent** at Singapore.

## Key Extracted Terms
- **Vessel:** MV Northern Pioneer
- **Owner / Charterer:** Polaris Shipping Ltd. / Helios Trading SA
- **Cargo:** 55,000 MT HSFO (5% MOLOO)
- **Load / Discharge:** Rotterdam → Singapore
- **Demurrage:** USD 24,500/day pro rata
- **Despatch:** Half demurrage, working time only
- **Governing Law:** English law, LMAA arbitration

## Risk Register
1. **HIGH — Discharge agent (TBN)** at Singapore. Operational risk on arrival.
2. **MEDIUM — Laytime commencement** wording is ambiguous (see clause 6).
3. **LOW — Despatch wording** “working time only” may be narrowly read.

## Next Actions
- Chase Charterer to nominate Singapore discharge agent (T-5 days).
- Request clarification of clause 6 on laytime commencement.
- Flag despatch wording to claims team for the post-fix file.
- Pre-stem bunkers and load-port readiness check at Rotterdam.

## Recommended Owner
Operations Desk — EMEA (with Claims cc’d).
`,
    headlineRisks: [
      "Discharge agent at Singapore is TBN (high)",
      "Laytime commencement wording is ambiguous (medium)",
    ],
    nextActions: [
      "Confirm Singapore discharge agent before T-5 days.",
      "Clarify clause 6 laytime commencement.",
      "Flag despatch wording to claims team.",
      "Pre-stem bunkers & load readiness at Rotterdam.",
    ],
    owner: "Operations Desk — EMEA",
  },
  critic: {
    overallVerdict: "review",
    issues: [
      {
        id: "c1",
        section: "extraction",
        severity: "high",
        message: "Discharge port agent extracted as ‘TBN’ but should be flagged as missing, not confirmed.",
        suggestedFix: "Mark discharge_agent as isMissing=true and surface as a blocking risk.",
        status: "open",
      },
      {
        id: "c2",
        section: "risks",
        severity: "medium",
        message: "Laytime commencement risk references clause 6 — supporting evidence quote should be expanded.",
        suggestedFix: "Include the full clause 6 text in evidenceQuote for traceability.",
        status: "open",
      },
    ],
  },
  evals: [
    { key: "json_validity", label: "JSON Validity", value: 100, unit: "%", target: 100, direction: "higher_is_better", explanation: "All extracted fields conform to schema." },
    { key: "extraction_completeness", label: "Extraction Completeness", value: 90, unit: "%", target: 95, direction: "higher_is_better" },
    { key: "evidence_grounding", label: "Evidence Grounding", value: 92, unit: "%", target: 90, direction: "higher_is_better" },
    { key: "hallucination_risk", label: "Hallucination Risk", value: 10, unit: "%", target: 15, direction: "lower_is_better" },
    { key: "risk_detection", label: "Risk Detection", value: 88, unit: "%", target: 85, direction: "higher_is_better" },
    { key: "handover_usefulness", label: "Handover Usefulness", value: 92, unit: "%", target: 90, direction: "higher_is_better" },
    { key: "confidence_calibration", label: "Confidence Calibration", value: 88, unit: "%", target: 85, direction: "higher_is_better" },
  ],
  stepProfile: {
    ingest_document: { tokens: 420, costUsd: 0.0021, confidence: 0.99 },
    classify_document: { tokens: 680, costUsd: 0.0034, confidence: 0.96 },
    extract_structured_data: { tokens: 2150, costUsd: 0.0108, confidence: 0.93 },
    validate_schema: { tokens: 320, costUsd: 0.0016, confidence: 0.99 },
    detect_risks: { tokens: 1380, costUsd: 0.0069, confidence: 0.88 },
    generate_handover: { tokens: 1620, costUsd: 0.0081, confidence: 0.92 },
    critic_review: { tokens: 940, costUsd: 0.0047, confidence: 0.86 },
    run_evals: { tokens: 510, costUsd: 0.0026 },
    human_review: { tokens: 0, costUsd: 0 },
  },
} as unknown as SampleAnalysisFixture;

const sof: SampleAnalysisFixture = {
  classification: {
    type: "statement_of_facts",
    confidence: 0.94,
    alternatives: [
      { type: "port_call_note", probability: 0.04 },
      { type: "charter_party", probability: 0.02 },
    ],
  },
  extraction: [
    { key: "vessel", label: "Vessel Name", value: "MV Aegean Star", confidence: 0.98, evidenceQuote: "Vessel: MV Aegean Star" },
    { key: "port", label: "Port", value: "Santos, BR", confidence: 0.98, evidenceQuote: "STATEMENT OF FACTS — Port of Santos, BR" },
    { key: "voyage", label: "Voyage", value: "V-2026/041", confidence: 0.97, evidenceQuote: "Voyage: V-2026/041" },
    { key: "nor_tendered", label: "NOR Tendered", value: "22 Mar 03:15 LT", confidence: 0.95, evidenceQuote: "22 Mar 03:15 LT  NOR tendered (outside office hours)" },
    { key: "all_fast", label: "All Fast (Berthed)", value: "22 Mar 07:40 LT", confidence: 0.96, evidenceQuote: "22 Mar 07:40 LT  All fast at Berth 39" },
    { key: "load_start", label: "Loading Commenced", value: "22 Mar 09:10 LT", confidence: 0.96, evidenceQuote: "22 Mar 09:10 LT  Commenced loading" },
    { key: "rain_stop", label: "Rain Stoppage", value: "14:00 → 17:30 (3h 30m)", confidence: 0.9, evidenceQuote: "Stopped — heavy rain ... Resumed loading" },
    { key: "completion", label: "Completion", value: "23 Mar 06:00 LT", confidence: 0.97, evidenceQuote: "23 Mar 06:00 LT  Completed loading" },
    { key: "docs_on_board", label: "Documents On Board", value: "23 Mar 07:15 LT", confidence: 0.96, evidenceQuote: "23 Mar 07:15 LT  Documents on board, vessel sailed" },
    { key: "weather_attribution", label: "Weather Stoppage Attribution", value: "Not specified", confidence: 0.42, isMissing: true },
    { key: "office_hours_ref", label: "Office-Hours Reference", value: "Not specified", confidence: 0.45, isMissing: true },
  ],
  risks: [
    {
      id: "r1",
      title: "Rain stoppage attribution unclear",
      category: "contractual",
      severity: "medium",
      description: "3h 30m rain stoppage logged but SoF does not state whether it counts against laytime.",
      evidenceQuote: "22 Mar 14:00 LT  Stopped — heavy rain",
      businessImpact: "Direct laytime exposure; potential demurrage swing of several thousand USD.",
      recommendedAction: "Cross-check CP weather working clause; obtain port log confirmation.",
      confidence: 0.86,
    },
    {
      id: "r2",
      title: "NOR tendered outside office hours",
      category: "timing",
      severity: "low",
      description: "NOR tendered at 03:15 LT — may not be valid until next office hours per CP.",
      evidenceQuote: "22 Mar 03:15 LT  NOR tendered (outside office hours)",
      businessImpact: "Could shift laytime commencement by several hours.",
      recommendedAction: "Verify CP NOR validity clause; recompute laytime if needed.",
      confidence: 0.81,
    },
  ],
  handover: {
    markdown: `# Handover — MV Aegean Star, Port of Santos

## Executive Summary
Loading completed at Santos on **23 Mar 06:00 LT**. Documents on board **07:15 LT**. Operation is clean overall but includes a **3h 30m rain stoppage** and an **NOR tendered outside office hours** — both with potential laytime exposure.

## Timeline
- **22 Mar 03:15** — NOR tendered (outside office hours)
- **22 Mar 07:40** — All fast at Berth 39
- **22 Mar 09:10** — Commenced loading
- **22 Mar 14:00 → 17:30** — Stopped, heavy rain (3h 30m)
- **23 Mar 06:00** — Completed loading
- **23 Mar 07:15** — Documents on board, sailed

## Laytime Exposure
- Weather stoppage attribution requires CP clause confirmation.
- NOR validity may shift commencement to next office hour window.

## Next Actions
- Pull CP weather working clause and confirm rain attribution.
- Re-check NOR validity vs CP office-hour wording.
- Reconcile timeline with port log.
- Send laytime statement draft to Claims for review.

## Recommended Owner
Post-Fixture / Laytime Desk — Americas.
`,
    headlineRisks: [
      "Rain stoppage attribution unclear (medium)",
      "NOR tendered outside office hours (low)",
    ],
    nextActions: [
      "Confirm CP weather working clause vs rain stoppage.",
      "Validate NOR per CP office-hour wording.",
      "Reconcile SoF timeline with port log.",
      "Send laytime statement draft to Claims.",
    ],
    owner: "Post-Fixture / Laytime Desk — Americas",
  },
  critic: {
    overallVerdict: "review",
    issues: [
      {
        id: "c1",
        section: "risks",
        severity: "medium",
        message: "Weather stoppage flagged but requires explicit CP clause confirmation before laytime impact is finalized.",
        suggestedFix: "Add a follow-up action to fetch CP weather clause and re-evaluate.",
        status: "open",
      },
    ],
  },
  evals: [
    { key: "json_validity", label: "JSON Validity", value: 100, unit: "%", target: 100, direction: "higher_is_better" },
    { key: "extraction_completeness", label: "Extraction Completeness", value: 87, unit: "%", target: 95, direction: "higher_is_better" },
    { key: "evidence_grounding", label: "Evidence Grounding", value: 90, unit: "%", target: 90, direction: "higher_is_better" },
    { key: "hallucination_risk", label: "Hallucination Risk", value: 9, unit: "%", target: 15, direction: "lower_is_better" },
    { key: "risk_detection", label: "Risk Detection", value: 86, unit: "%", target: 85, direction: "higher_is_better" },
    { key: "handover_usefulness", label: "Handover Usefulness", value: 90, unit: "%", target: 90, direction: "higher_is_better" },
    { key: "confidence_calibration", label: "Confidence Calibration", value: 87, unit: "%", target: 85, direction: "higher_is_better" },
  ],
  stepProfile: {
    ingest_document: { tokens: 240, costUsd: 0.0012, confidence: 0.99 },
    classify_document: { tokens: 460, costUsd: 0.0023, confidence: 0.94 },
    extract_structured_data: { tokens: 1480, costUsd: 0.0074, confidence: 0.92 },
    validate_schema: { tokens: 240, costUsd: 0.0012, confidence: 0.99 },
    detect_risks: { tokens: 980, costUsd: 0.0049, confidence: 0.85 },
    generate_handover: { tokens: 1280, costUsd: 0.0064, confidence: 0.9 },
    critic_review: { tokens: 720, costUsd: 0.0036, confidence: 0.84 },
    run_evals: { tokens: 420, costUsd: 0.0021 },
    human_review: { tokens: 0, costUsd: 0 },
  },
} as unknown as SampleAnalysisFixture;

const da: SampleAnalysisFixture = {
  classification: {
    type: "da_estimate",
    confidence: 0.95,
    alternatives: [
      { type: "invoice", probability: 0.03 },
      { type: "port_call_note", probability: 0.02 },
    ],
  },
  extraction: [
    { key: "port", label: "Port", value: "Fujairah, AE", confidence: 0.98, evidenceQuote: "DISBURSEMENT ACCOUNT ESTIMATE — Port of Fujairah, AE" },
    { key: "agent", label: "Agent", value: "Gulf Marine Services", confidence: 0.97, evidenceQuote: "Agent: Gulf Marine Services" },
    { key: "vessel", label: "Vessel", value: "MV Northern Pioneer", confidence: 0.97, evidenceQuote: "Vessel: MV Northern Pioneer" },
    { key: "eta", label: "ETA", value: "04 Jul 2026", confidence: 0.96, evidenceQuote: "ETA: 04 Jul 2026" },
    { key: "pilotage", label: "Pilotage", value: "USD 3,200.00", confidence: 0.98, evidenceQuote: "Pilotage              USD  3,200.00" },
    { key: "towage", label: "Towage", value: "USD 5,800.00", confidence: 0.98, evidenceQuote: "Towage                USD  5,800.00" },
    { key: "port_dues", label: "Port Dues", value: "USD 12,400.00", confidence: 0.98, evidenceQuote: "Port Dues             USD 12,400.00" },
    { key: "misc", label: "Miscellaneous", value: "USD 7,500.00", confidence: 0.94, evidenceQuote: "Miscellaneous         USD  7,500.00" },
    { key: "garbage", label: "Garbage Removal", value: "USD 450.00", confidence: 0.98, evidenceQuote: "Garbage Removal       USD    450.00" },
    { key: "total", label: "Total Estimate", value: "USD 29,350.00", confidence: 0.99, evidenceQuote: "Total Estimate        USD 29,350.00" },
    { key: "fx", label: "FX Basis", value: "Not specified", confidence: 0.35, evidenceQuote: "Note: FX rate not specified.", isMissing: true },
    { key: "appointment_letter", label: "Agent Appointment Letter", value: "Not attached", confidence: 0.4, evidenceQuote: "Agent appointment letter not attached.", isMissing: true },
    { key: "misc_breakdown", label: "Miscellaneous Itemization", value: "Not provided", confidence: 0.3, isMissing: true },
  ],
  risks: [
    {
      id: "r1",
      title: "Oversized ‘Miscellaneous’ line item",
      category: "financial",
      severity: "high",
      description: "Miscellaneous = USD 7,500 represents ~25% of total DA with no breakdown — unusual vs Fujairah baseline.",
      evidenceQuote: "Miscellaneous         USD  7,500.00",
      businessImpact: "Risk of overpayment; weakens DA approval audit trail.",
      recommendedAction: "Request itemized breakdown of miscellaneous before approval.",
      confidence: 0.91,
    },
    {
      id: "r2",
      title: "FX basis not specified",
      category: "financial",
      severity: "medium",
      description: "DA is in USD but no FX reference / source provided for local-currency components.",
      evidenceQuote: "Note: FX rate not specified.",
      businessImpact: "Reconciliation risk on final DA vs estimate.",
      recommendedAction: "Ask agent for FX source (e.g., central bank rate, value date).",
      confidence: 0.85,
    },
    {
      id: "r3",
      title: "Agent appointment letter missing",
      category: "documentation",
      severity: "medium",
      description: "Appointment letter is not referenced/attached — affects compliance audit chain.",
      evidenceQuote: "Agent appointment letter not attached.",
      businessImpact: "Compliance / audit gap on agent engagement.",
      recommendedAction: "Obtain signed appointment letter before remitting funds.",
      confidence: 0.83,
    },
  ],
  handover: {
    markdown: `# Handover — DA Estimate, Port of Fujairah

## Executive Summary
Disbursement Account estimate from **Gulf Marine Services** for MV Northern Pioneer, ETA **04 Jul 2026**, total **USD 29,350**. Estimate is **not approval-ready**: oversized miscellaneous line, missing FX basis, and missing appointment letter.

## Cost Breakdown
- Pilotage: USD 3,200
- Towage: USD 5,800
- Port Dues: USD 12,400
- **Miscellaneous: USD 7,500** ⚠ (~25% of total, no breakdown)
- Garbage Removal: USD 450
- **Total: USD 29,350**

## DA Approval Risks
1. **HIGH — Miscellaneous USD 7,500** lacks itemization.
2. **MEDIUM — FX basis missing.**
3. **MEDIUM — Agent appointment letter not attached.**

## Next Actions
- Request itemized breakdown of miscellaneous line.
- Ask agent for FX source and value date.
- Obtain signed appointment letter before remittance.
- Re-check vs prior Fujairah port-call benchmark.

## Recommended Owner
DA / Port Costs Desk — MEA.
`,
    headlineRisks: [
      "Miscellaneous USD 7,500 unitemized (high)",
      "FX basis missing (medium)",
      "Appointment letter missing (medium)",
    ],
    nextActions: [
      "Request itemized miscellaneous breakdown.",
      "Confirm FX source and value date.",
      "Obtain signed appointment letter before remittance.",
      "Benchmark vs prior Fujairah port calls.",
    ],
    owner: "DA / Port Costs Desk — MEA",
  },
  critic: {
    overallVerdict: "review",
    issues: [
      {
        id: "c1",
        section: "handover",
        severity: "high",
        message: "Approval should be blocked until miscellaneous line is itemized.",
        suggestedFix: "Add explicit ‘Do not approve until itemized breakdown received’ note.",
        status: "open",
      },
    ],
  },
  evals: [
    { key: "json_validity", label: "JSON Validity", value: 100, unit: "%", target: 100, direction: "higher_is_better" },
    { key: "extraction_completeness", label: "Extraction Completeness", value: 89, unit: "%", target: 95, direction: "higher_is_better" },
    { key: "evidence_grounding", label: "Evidence Grounding", value: 93, unit: "%", target: 90, direction: "higher_is_better" },
    { key: "hallucination_risk", label: "Hallucination Risk", value: 8, unit: "%", target: 15, direction: "lower_is_better" },
    { key: "risk_detection", label: "Risk Detection", value: 89, unit: "%", target: 85, direction: "higher_is_better" },
    { key: "handover_usefulness", label: "Handover Usefulness", value: 93, unit: "%", target: 90, direction: "higher_is_better" },
    { key: "confidence_calibration", label: "Confidence Calibration", value: 89, unit: "%", target: 85, direction: "higher_is_better" },
  ],
  stepProfile: {
    ingest_document: { tokens: 180, costUsd: 0.0009, confidence: 0.99 },
    classify_document: { tokens: 380, costUsd: 0.0019, confidence: 0.95 },
    extract_structured_data: { tokens: 1180, costUsd: 0.0059, confidence: 0.93 },
    validate_schema: { tokens: 220, costUsd: 0.0011, confidence: 0.99 },
    detect_risks: { tokens: 1040, costUsd: 0.0052, confidence: 0.87 },
    generate_handover: { tokens: 1320, costUsd: 0.0066, confidence: 0.91 },
    critic_review: { tokens: 760, costUsd: 0.0038, confidence: 0.85 },
    run_evals: { tokens: 440, costUsd: 0.0022 },
    human_review: { tokens: 0, costUsd: 0 },
  },
} as unknown as SampleAnalysisFixture;

export const ANALYSIS_FIXTURES: Record<string, SampleAnalysisFixture> = {
  "cp-northern-pioneer": cp,
  "sof-aegean-star": sof,
  "da-fujairah": da,
};

export const getFixture = (sampleId: string): SampleAnalysisFixture | undefined =>
  ANALYSIS_FIXTURES[sampleId];
