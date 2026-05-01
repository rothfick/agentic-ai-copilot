export type DocumentType =
  | "charter_party"
  | "statement_of_facts"
  | "port_call_note"
  | "da_estimate"
  | "invoice"
  | "handover_email"
  | "unknown";

export type Complexity = "Low" | "Medium" | "High";

export interface SampleDocument {
  id: string;
  title: string;
  documentType: DocumentType;
  documentTypeLabel: string;
  description: string;
  complexity: Complexity;
  estimatedPages: number;
  expectedRiskCount: number;
  rawText: string;
  expectedFields: { label: string; value: string }[];
  expectedRisks: { title: string; severity: "low" | "medium" | "high" | "critical" }[];
}

export const SAMPLES: SampleDocument[] = [
  {
    id: "cp-northern-pioneer",
    title: "Charter Party — MV Northern Pioneer",
    documentType: "charter_party",
    documentTypeLabel: "Charter Party",
    description:
      "Voyage charter for HSFO Rotterdam → Singapore. Contains laytime, demurrage and despatch terms with one ambiguous clause and a missing discharge agent.",
    complexity: "High",
    estimatedPages: 14,
    expectedRiskCount: 3,
    rawText: `CHARTER PARTY — VOYAGE
Owner: Polaris Shipping Ltd.
Charterer: Helios Trading SA
Vessel: MV Northern Pioneer (IMO 9500001)
Cargo: 55,000 MT High Sulphur Fuel Oil (HSFO), 5% MOLOO
Load Port: Rotterdam, NL
Discharge Port: Singapore, SG
Laycan: 12 – 18 June 2026
Laytime: 72 running hours, SHINC. Commencement upon NOR tender (see clause 6).
Demurrage: USD 24,500 per day pro rata.
Despatch: Half demurrage on laytime saved, working time only.
Governing Law: English law; arbitration London (LMAA terms).
Load Port Agent: Maas Marine Agencies B.V.
Discharge Port Agent: TBN.`,
    expectedFields: [
      { label: "Vessel", value: "MV Northern Pioneer" },
      { label: "Owner", value: "Polaris Shipping Ltd." },
      { label: "Charterer", value: "Helios Trading SA" },
      { label: "Cargo", value: "55,000 MT HSFO" },
      { label: "Load / Discharge", value: "Rotterdam → Singapore" },
      { label: "Demurrage", value: "USD 24,500 / day pro rata" },
      { label: "Governing Law", value: "English (LMAA)" },
    ],
    expectedRisks: [
      { title: "Discharge port agent missing (TBN)", severity: "high" },
      { title: "Ambiguous laytime commencement", severity: "medium" },
      { title: "Despatch wording ambiguity", severity: "low" },
    ],
  },
  {
    id: "sof-aegean-star",
    title: "Statement of Facts — MV Aegean Star, Port of Santos",
    documentType: "statement_of_facts",
    documentTypeLabel: "Statement of Facts",
    description:
      "Loading port SoF with NOR, berthing, loading operations and a weather stoppage event that may affect laytime calculation.",
    complexity: "Medium",
    estimatedPages: 4,
    expectedRiskCount: 2,
    rawText: `STATEMENT OF FACTS — Port of Santos, BR
Vessel: MV Aegean Star
Voyage: V-2026/041

22 Mar 03:15 LT  NOR tendered (outside office hours)
22 Mar 07:40 LT  All fast at Berth 39
22 Mar 09:10 LT  Commenced loading
22 Mar 14:00 LT  Stopped — heavy rain
22 Mar 17:30 LT  Resumed loading
23 Mar 06:00 LT  Completed loading
23 Mar 07:15 LT  Documents on board, vessel sailed`,
    expectedFields: [
      { label: "Vessel", value: "MV Aegean Star" },
      { label: "Port", value: "Santos, BR" },
      { label: "NOR Tendered", value: "22 Mar 03:15 LT" },
      { label: "All Fast", value: "22 Mar 07:40 LT" },
      { label: "Completed", value: "23 Mar 06:00 LT" },
    ],
    expectedRisks: [
      { title: "Rain stoppage attribution unclear", severity: "medium" },
      { title: "NOR tendered outside office hours", severity: "low" },
    ],
  },
  {
    id: "da-fujairah",
    title: "Port Call / DA Estimate — Port of Fujairah",
    documentType: "da_estimate",
    documentTypeLabel: "DA Estimate",
    description:
      "Disbursement Account estimate from local agent. Contains an unusually large miscellaneous line and missing FX reference.",
    complexity: "Medium",
    estimatedPages: 2,
    expectedRiskCount: 3,
    rawText: `DISBURSEMENT ACCOUNT ESTIMATE — Port of Fujairah, AE
Agent: Gulf Marine Services
Vessel: MV Northern Pioneer
ETA: 04 Jul 2026

Pilotage              USD  3,200.00
Towage                USD  5,800.00
Port Dues             USD 12,400.00
Miscellaneous         USD  7,500.00
Garbage Removal       USD    450.00
-----------------------------------
Total Estimate        USD 29,350.00

Note: FX rate not specified. Agent appointment letter not attached.`,
    expectedFields: [
      { label: "Port", value: "Fujairah, AE" },
      { label: "Agent", value: "Gulf Marine Services" },
      { label: "Total Estimate", value: "USD 29,350.00" },
      { label: "FX", value: "Not specified" },
    ],
    expectedRisks: [
      { title: "Oversized 'Miscellaneous' line item", severity: "high" },
      { title: "FX rate not specified", severity: "medium" },
      { title: "No agent appointment letter referenced", severity: "medium" },
    ],
  },
];

export const getSample = (id?: string) =>
  SAMPLES.find((s) => s.id === id);
