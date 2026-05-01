// Centralized recruiter-facing copy and small clipboard helper.
// Pure strings + a tiny utility — no business logic, no side effects.

export const projectPitch =
  "MaritimeOps AI Copilot is an agentic AI document intelligence system for maritime operations. It classifies operational documents, extracts schema-bound data, detects evidence-grounded risks, generates handovers, runs critic review, and measures AI quality through evals.";

export const cvBullet =
  "Built MaritimeOps AI Copilot, an agentic maritime document intelligence system with structured extraction, evidence-grounded risk analysis, operational handovers, critic review, human-in-the-loop controls, and automated AI evals for quality, grounding, hallucination risk, latency, and cost.";

export const linkedInPost = `I didn't build another chat-with-PDF demo.

I built MaritimeOps AI Copilot — a maritime AI ops console that shows the full AI product lifecycle: extraction, risk, handover, critic review, evals, and export.

Highlights:
• 9-node simulated agent workflow (ingest → classify → extract → validate → risk → handover → critic → evals → human review)
• Evidence-grounded structured outputs with editable fields
• Operational risk register with human-in-the-loop review
• AI Critic + Quality Gate for export readiness
• Eval harness: JSON validity, grounding, hallucination risk, calibration, latency, cost
• Exportable executive report (JSON + print-to-PDF)

Built as a Staff AI Engineer portfolio piece for maritime AI roles.`;

export const applicationMessage = `Hi Marcura Team,

I built a focused demo called MaritimeOps AI Copilot — an agentic document intelligence console for maritime operations. It classifies charter parties, SoFs and DA estimates, extracts schema-bound data with evidence, surfaces operational risk, generates handovers, runs an AI critic and quality gate, and reports against an eval harness covering grounding, hallucination risk, latency and cost.

The simulation layer is intentionally deterministic so the architecture, UX and product thinking are visible end-to-end. I designed it to map cleanly onto a production stack (FastAPI + LangGraph + provider abstraction + LangSmith/OTel tracing + Postgres + queue workers).

I'd love a short conversation about how this thinking maps to your roadmap.

— [Your Name]`;

export const architectureSummary = `MaritimeOps AI Copilot — Architecture Summary

Frontend: React 18 + Vite + TypeScript + Tailwind, modular maritime UI kit.
Simulation layer: deterministic AnalysisRun lifecycle with progressive node outputs.
Agent workflow (9 nodes): ingest → classify → extract → validate → risk → handover → critic → evals → human review.
Domain model: MaritimeDocument, AnalysisRun, ExtractedField, RiskItem, HandoverSummary, CriticReview, EvaluationMetric, Report.
Eval layer: JSON validity, completeness, grounding, hallucination risk, calibration, latency, cost, regression.
Report layer: executive report with print-to-PDF and JSON export.
Production roadmap: FastAPI + LangGraph orchestration, OCR/VLM ingestion, provider abstraction (OpenAI/Anthropic/Gemini), LangSmith/OTel tracing, Postgres + object storage, queue workers, RBAC, audit log, feedback dataset for eval improvement.`;

export const readmeMarkdown = `# MaritimeOps AI Copilot

> ${projectPitch}

## Why I built this

Most AI demos stop at "chat with PDF". Maritime operations need much more: schema-bound extraction, evidence grounding, operational risk modeling, human-in-the-loop review, critic gates, and measurable AI quality. This project shows that full lifecycle as a coherent product.

## Key features

- **Agentic workflow** — 9-node simulated graph: ingest → classify → extract → validate → risk → handover → critic → evals → human review
- **Structured extraction** — schema-bound fields with confidence, evidence quotes and inline edits
- **Risk register** — categorized, severity-ranked, evidence-grounded, with Accept / Dismiss / Follow-up actions
- **Operational handover** — operator-ready summary with headline risks and next actions
- **AI Critic + Quality Gate** — readiness checks before export
- **Eval harness** — JSON validity, completeness, grounding, hallucination risk, calibration, latency, cost, regression
- **Exportable report** — print-to-PDF + JSON export + executive copy blocks

## Architecture overview

\`\`\`
Frontend (React + Vite + TS + Tailwind)
  └─ Simulation layer (deterministic AnalysisRun lifecycle)
       └─ 9-node agent workflow → progressive UI reveal
            └─ Domain model → Extraction · Risk · Handover · Critic · Evals · Report
\`\`\`

Production target: FastAPI + LangGraph + provider abstraction (OpenAI / Anthropic / Gemini) + LangSmith / OpenTelemetry tracing + Postgres + object storage + queue workers + RBAC + audit log.

## Evaluation strategy

Treat LLM outputs as testable artifacts. Every run produces metrics across:
JSON validity · extraction completeness · evidence grounding · hallucination risk · risk detection · handover usefulness · confidence calibration · latency · token cost.

A regression preview compares detected risks against a golden set.

## Tech stack

React 18 · Vite · TypeScript · TailwindCSS · shadcn/ui · Recharts · React Router · Lucide.

## Demo walkthrough

1. Open sample: *Charter Party — MV Northern Pioneer*
2. Start Agent Analysis
3. Watch the 9-node workflow progress
4. Review structured extraction (edit a field)
5. Inspect the risk register and evidence
6. Approve / comment on risks
7. Review the operational handover
8. Check the critic quality gate
9. Inspect eval metrics
10. Open the exportable report

## Staff AI Engineer competency mapping

- Agentic workflow design · structured outputs · evidence grounding
- Risk modeling · human-in-the-loop AI · evals as a product surface
- Cost / latency observability · clean architecture · UX for complex AI

## Future production roadmap

FastAPI backend · LangGraph orchestration · OCR + VLM ingestion · provider abstraction · LangSmith / OTel tracing · Postgres · queue workers · RBAC + audit log · feedback dataset for continuous eval improvement.

## CV bullet

> ${cvBullet}

## LinkedIn post

${linkedInPost}

## Application message

${applicationMessage}
`;

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy fallback
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
