import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface RequirementRow {
  requirement: string;
  where: string;
  why: string;
}

export const REQUIREMENT_ROWS: RequirementRow[] = [
  {
    requirement: "Python / FastAPI backend thinking",
    where: "Architecture page · simulation layer mirrors a service boundary that maps 1:1 onto FastAPI endpoints.",
    why: "Shows the demo can be lifted into a real backend without architectural rework.",
  },
  {
    requirement: "LLM orchestration (LangGraph-style agent flow)",
    where: "9-node agent workflow in Workspace + Architecture graph.",
    why: "Demonstrates multi-step agent design with explicit state transitions.",
  },
  {
    requirement: "Structured outputs",
    where: "Extraction tab — schema-bound fields with confidence and evidence.",
    why: "Production AI must return validated, machine-usable data, not free text.",
  },
  {
    requirement: "VLM / document readiness",
    where: "ingest_document node + Architecture roadmap.",
    why: "Maritime documents are mixed PDF / scan; design accommodates OCR + VLM.",
  },
  {
    requirement: "Evals as a first-class product surface",
    where: "Eval harness in Workspace + global /evals page.",
    why: "Treats LLM outputs as testable artifacts with quality, grounding, cost and latency.",
  },
  {
    requirement: "Prompt engineering discipline",
    where: "Schema-first extraction + critic + handover templates.",
    why: "Outputs are constrained and reviewable, not creative writing.",
  },
  {
    requirement: "AI coding agents / rapid delivery",
    where: "Whole product shipped end-to-end as a coherent demo.",
    why: "Shows ability to scope and deliver an AI product, not just a prototype.",
  },
  {
    requirement: "Clean architecture",
    where: "Modular components, typed domain model, isolated lib helpers.",
    why: "Foundations a Staff engineer is expected to set for a team.",
  },
  {
    requirement: "Business-to-technical translation",
    where: "Risk taxonomy, handover, and report copy reflect maritime ops language.",
    why: "AI value comes from solving the operator's problem, not the model's.",
  },
  {
    requirement: "Maritime domain understanding",
    where: "Charter party, SoF, DA estimate samples + risk categories.",
    why: "Demonstrates the domain literacy required to design useful workflows.",
  },
  {
    requirement: "Human-in-the-loop AI",
    where: "Editable extraction, risk Accept/Dismiss/Follow-up, critic gate, report sign-off.",
    why: "High-stakes AI must be steerable, auditable and reversible.",
  },
  {
    requirement: "Cost / latency observability",
    where: "Latency + token cost breakdown cards in Eval tab.",
    why: "Production AI is a budget conversation as much as a quality one.",
  },
  {
    requirement: "Staff-level ownership",
    where: "Architecture doc, production roadmap, engineering decisions, Marcura fit.",
    why: "Communicates trade-offs and a credible path from demo to production.",
  },
];

export function RequirementMappingTable() {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-panel-elevated/60">
            <TableHead className="w-[28%]">Requirement / Signal</TableHead>
            <TableHead className="w-[40%]">Where demonstrated</TableHead>
            <TableHead>Why it matters</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {REQUIREMENT_ROWS.map((r) => (
            <TableRow key={r.requirement} className="align-top">
              <TableCell className="font-medium text-foreground/95">{r.requirement}</TableCell>
              <TableCell className="text-sm text-foreground/85">{r.where}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.why}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
