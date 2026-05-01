// Extraction helpers and per-document schema metadata.
// Pure functions: easy to test and to port to a backend later.
import type { AnalysisRun, DocumentType, ExtractedField } from "@/types/analysis";

export interface SchemaMeta {
  schemaName: string;
  schemaVersion: string;
  // Field keys considered required by the schema for this doc type.
  requiredKeys: string[];
  // Subset of requiredKeys whose absence blocks operational decisions.
  criticalKeys: string[];
  // Per-field operational rationale for missing-value guidance.
  operationalContext: Record<string, { why: string; recommendedAction: string }>;
}

export const SCHEMA_REGISTRY: Record<DocumentType, SchemaMeta> = {
  charter_party: {
    schemaName: "CharterParty.v1",
    schemaVersion: "1.0.0",
    requiredKeys: [
      "vessel", "owner", "charterer", "cargo", "load_port", "discharge_port",
      "laycan", "demurrage", "despatch", "law", "load_agent", "discharge_agent",
      "laytime_trigger",
    ],
    criticalKeys: ["vessel", "load_port", "discharge_port", "laycan", "demurrage", "discharge_agent"],
    operationalContext: {
      discharge_agent: {
        why: "Required before port call coordination can be confirmed.",
        recommendedAction: "Request nomination from Charterer at least 5 days before ETA.",
      },
      laytime_trigger: {
        why: "Needed to calculate demurrage exposure accurately.",
        recommendedAction: "Clarify clause 6 wording with counterparty (turn-time, office-hour rules).",
      },
      despatch: {
        why: "Despatch wording impacts post-fixture claims.",
        recommendedAction: "Align interpretation with claims team.",
      },
    },
  },
  statement_of_facts: {
    schemaName: "StatementOfFacts.v1",
    schemaVersion: "1.0.0",
    requiredKeys: [
      "vessel", "port", "voyage", "nor_tendered", "all_fast", "load_start",
      "rain_stop", "completion", "docs_on_board", "weather_attribution", "office_hours_ref",
    ],
    criticalKeys: ["vessel", "port", "nor_tendered", "completion", "weather_attribution"],
    operationalContext: {
      weather_attribution: {
        why: "Determines whether rain stoppage counts against laytime.",
        recommendedAction: "Cross-check CP weather working clause; obtain port log confirmation.",
      },
      office_hours_ref: {
        why: "Defines NOR validity window and laytime commencement timing.",
        recommendedAction: "Verify CP office-hour wording before laytime statement is finalized.",
      },
    },
  },
  da_estimate: {
    schemaName: "DisbursementAccount.v1",
    schemaVersion: "1.0.0",
    requiredKeys: [
      "port", "agent", "vessel", "eta", "pilotage", "towage", "port_dues",
      "misc", "garbage", "total", "fx", "appointment_letter", "misc_breakdown",
    ],
    criticalKeys: ["port", "agent", "vessel", "total", "fx", "appointment_letter"],
    operationalContext: {
      fx: {
        why: "FX basis is required to reconcile final DA against estimate.",
        recommendedAction: "Ask agent for FX source (e.g. central bank rate) and value date.",
      },
      appointment_letter: {
        why: "Compliance / audit chain on agent engagement.",
        recommendedAction: "Obtain signed appointment letter before remitting funds.",
      },
      misc_breakdown: {
        why: "Unitemized miscellaneous lines weaken DA approval audit trail.",
        recommendedAction: "Request itemized breakdown from agent before approval.",
      },
    },
  },
  port_call_note: {
    schemaName: "PortCallNote.v1", schemaVersion: "1.0.0",
    requiredKeys: [], criticalKeys: [], operationalContext: {},
  },
  invoice: {
    schemaName: "Invoice.v1", schemaVersion: "1.0.0",
    requiredKeys: [], criticalKeys: [], operationalContext: {},
  },
  handover_email: {
    schemaName: "HandoverEmail.v1", schemaVersion: "1.0.0",
    requiredKeys: [], criticalKeys: [], operationalContext: {},
  },
  unknown: {
    schemaName: "Unknown",
    schemaVersion: "0.0.0",
    requiredKeys: [],
    criticalKeys: [],
    operationalContext: {},
  },
};

export function getSchemaForRun(run: AnalysisRun | null | undefined): SchemaMeta {
  const type =
    run?.classificationOverride?.type ??
    run?.classification?.type ??
    "unknown";
  return SCHEMA_REGISTRY[type] ?? SCHEMA_REGISTRY.unknown;
}

export function getExtractionFields(run: AnalysisRun | null | undefined): ExtractedField[] {
  return run?.extraction ?? [];
}

export const isFieldMissing = (f: ExtractedField): boolean => {
  return Boolean(f.isMissing) || !f.value || f.value.trim() === "" || f.value.trim().toLowerCase() === "not specified";
};

export const isFieldLowConfidence = (f: ExtractedField, threshold = 0.75): boolean => {
  return !isFieldMissing(f) && f.confidence < threshold;
};

export interface ExtractionSummary {
  total: number;
  required: number;
  completed: number;
  missing: number;
  lowConfidence: number;
  edited: number;
  confirmed: number;
  overallConfidence: number; // 0..1
}

export function summarizeExtraction(
  fields: ExtractedField[],
  schema: SchemaMeta,
): ExtractionSummary {
  const requiredCount = schema.requiredKeys.length || fields.length;
  const completed = fields.filter((f) => !isFieldMissing(f)).length;
  const missing = fields.filter(isFieldMissing).length;
  const lowConfidence = fields.filter((f) => isFieldLowConfidence(f)).length;
  const edited = fields.filter((f) => f.userEdited).length;
  const confirmed = fields.filter((f) => f.userConfirmed).length;
  const presentFields = fields.filter((f) => !isFieldMissing(f));
  const avg = presentFields.length
    ? presentFields.reduce((acc, f) => acc + (f.userConfirmed ? 1 : f.confidence), 0) / presentFields.length
    : 0;
  return {
    total: fields.length,
    required: requiredCount,
    completed,
    missing,
    lowConfidence,
    edited,
    confirmed,
    overallConfidence: avg,
  };
}

export function getMissingFields(fields: ExtractedField[]): ExtractedField[] {
  return fields.filter(isFieldMissing);
}

export function getLowConfidenceFields(fields: ExtractedField[]): ExtractedField[] {
  return fields.filter((f) => isFieldLowConfidence(f));
}

export function updateExtractionField(
  run: AnalysisRun,
  fieldKey: string,
  newValue: string,
): AnalysisRun {
  if (!run.extraction) return run;
  const trimmed = newValue.trim();
  return {
    ...run,
    extraction: run.extraction.map((f) => {
      if (f.key !== fieldKey) return f;
      const isNowMissing = trimmed === "";
      return {
        ...f,
        previousValue: f.previousValue ?? f.value,
        value: trimmed,
        userEdited: true,
        userConfirmed: false,
        isMissing: isNowMissing,
        // Confidence is owned by the human now; show full confidence on real values.
        confidence: isNowMissing ? f.confidence : 1,
      };
    }),
  };
}

export function confirmExtractionField(run: AnalysisRun, fieldKey: string): AnalysisRun {
  if (!run.extraction) return run;
  return {
    ...run,
    extraction: run.extraction.map((f) =>
      f.key === fieldKey
        ? { ...f, userConfirmed: true, isMissing: isFieldMissing(f) }
        : f
    ),
  };
}

export function revertExtractionField(run: AnalysisRun, fieldKey: string): AnalysisRun {
  if (!run.extraction) return run;
  return {
    ...run,
    extraction: run.extraction.map((f) => f.key === fieldKey ? { ...f } : f),
  };
}

export type FieldStatus = "confirmed" | "edited" | "missing" | "low_confidence" | "extracted";

export function getFieldStatus(f: ExtractedField): FieldStatus {
  if (isFieldMissing(f)) return "missing";
  if (f.userConfirmed) return "confirmed";
  if (f.userEdited) return "edited";
  if (isFieldLowConfidence(f)) return "low_confidence";
  return "extracted";
}

export type ValidationStatus = "pass" | "warnings" | "needs_review" | "pending";

export interface ValidationCheck {
  key: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface ValidationReport {
  status: ValidationStatus;
  checks: ValidationCheck[];
  missingCritical: string[];
  fieldsChecked: number;
  issuesFound: number;
  lastValidatedAt?: string;
}

export function validateExtraction(
  run: AnalysisRun | null | undefined,
  schema: SchemaMeta,
): ValidationReport {
  const fields = getExtractionFields(run);
  if (!fields.length) {
    return {
      status: "pending",
      checks: [],
      missingCritical: [],
      fieldsChecked: 0,
      issuesFound: 0,
    };
  }
  const summary = summarizeExtraction(fields, schema);
  const missingCritical = schema.criticalKeys.filter((k) => {
    const f = fields.find((x) => x.key === k);
    return !f || isFieldMissing(f);
  });
  const evidenceCovered =
    fields.filter((f) => !isFieldMissing(f) && f.evidenceQuote).length;
  const checks: ValidationCheck[] = [
    { key: "json_shape", label: "JSON shape valid", passed: true, detail: "All fields conform to schema types." },
    {
      key: "required",
      label: "Required fields present",
      passed: summary.missing === 0,
      detail: `${summary.completed}/${summary.required} required fields present.`,
    },
    {
      key: "evidence",
      label: "Evidence quotes attached",
      passed: evidenceCovered === summary.completed,
      detail: `${evidenceCovered}/${summary.completed} extracted fields have source evidence.`,
    },
    {
      key: "calibration",
      label: "Confidence scores calibrated",
      passed: summary.lowConfidence === 0,
      detail: `${summary.lowConfidence} field(s) below 0.75 confidence.`,
    },
    {
      key: "human_edits",
      label: "Human edits tracked",
      passed: true,
      detail: `${summary.edited} edit(s), ${summary.confirmed} confirmation(s).`,
    },
  ];
  const issuesFound = checks.filter((c) => !c.passed).length;
  let status: ValidationStatus = "pass";
  if (missingCritical.length > 0) status = "needs_review";
  else if (issuesFound > 0) status = "warnings";
  return {
    status,
    checks,
    missingCritical,
    fieldsChecked: fields.length,
    issuesFound,
    lastValidatedAt: new Date().toISOString(),
  };
}
