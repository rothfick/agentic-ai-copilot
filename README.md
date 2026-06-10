<!-- README_PRESENTATION_START -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=140&color=0:020617,100:7C3AED&text=Agentic%20AI%20Copilot&fontColor=FFFFFF&fontSize=30&fontAlignY=42&desc=AI%20workflow%20simulator%20with%20schema%20extraction%2C%20risk%20review%20and%20evals&descAlignY=68&descSize=15" alt="Agentic AI Copilot banner" />
</p>

<p align="center">
  <img alt="TypeScript: React" src="https://img.shields.io/badge/TypeScript-React-3178C6?style=for-the-badge" /> <img alt="AI: Agent Workflow" src="https://img.shields.io/badge/AI-Agent%20Workflow-7C3AED?style=for-the-badge" /> <img alt="Quality: Evals" src="https://img.shields.io/badge/Quality-Evals-0EA5E9?style=for-the-badge" /> <img alt="Trust: Evidence Grounding" src="https://img.shields.io/badge/Trust-Evidence%20Grounding-059669?style=for-the-badge" /> <img alt="Review: Human-in-the-loop" src="https://img.shields.io/badge/Review-Human--in--the--loop-F97316?style=for-the-badge" />
</p>

<table>
  <tr><td><strong>Role signal</strong></td><td>AI QA, eval-driven workflows, assistant feature validation</td></tr>
<tr><td><strong>What to inspect</strong></td><td><code>extraction.ts</code>, <code>evals.ts</code>, risk review, deterministic fixtures</td></tr>
<tr><td><strong>Best for</strong></td><td>JetBrains AI Assistant, QA AI Engineer, AI product testing roles</td></tr>
</table>

<!-- README_PRESENTATION_END -->

# Agentic AI Copilot

Deterministic AI workflow simulator for maritime document intelligence, operational risk review, evidence-grounded extraction, evaluation metrics, and human-in-the-loop handover.

This repository is a TypeScript/React product prototype that models how an AI copilot could assist operations teams with complex maritime documents such as charter parties, statements of facts, port call notes, DA estimates, invoices, and handover e-mails.

The important design choice: the current app does not call a live LLM. It uses deterministic fixtures and typed workflow state so the architecture, UX, eval layer, risk review, and report output can be inspected reliably without provider variance, API keys, or token cost.

## What This Project Demonstrates

- AI Assistant product thinking;
- agentic workflow modelling;
- schema-bound extraction;
- evidence-grounded field review;
- risk detection and review workflow;
- human-in-the-loop editing and confirmation;
- evaluation metrics for AI quality;
- latency and cost modelling;
- regression-preview thinking;
- report generation surfaces;
- typed React/TypeScript domain model;
- deterministic simulation architecture;
- recruiter-ready explanation of how the simulator could become a production LangGraph/FastAPI system.

## Product Concept

Maritime operations teams handle dense documents where mistakes can create financial, operational, or compliance exposure. A useful AI copilot should not simply summarize text. It should:

- classify the document;
- extract fields into a schema;
- show source evidence;
- mark low-confidence or missing fields;
- identify operational risks;
- let humans review and override;
- produce a handover summary;
- run quality checks;
- export a decision-ready report.

This repository models that workflow end to end.

## Supported Sample Documents

The app includes synthetic sample documents for:

- Charter Party;
- Statement of Facts;
- Port Call Note;
- DA Estimate;
- Invoice;
- Handover E-mail.

Each sample contains expected fields and expected risks so the UI can demonstrate extraction, risk review, and evaluation behavior.

## Technology Stack

| Area | Tools |
|---|---|
| Language | TypeScript |
| UI | React, Vite |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Routing | React Router |
| Data state | TanStack Query |
| Charts/metrics | Recharts |
| Validation/modeling | Zod-style typed data patterns |
| Testing | Vitest, Testing Library |
| Notifications | Sonner |

## Repository Structure

```text
src/
  data/
    samples.ts
    analysisFixtures.ts

  lib/
    extraction.ts
    evals.ts
    risks.ts
    portfolioCopy.ts

  types/
    analysis.ts

  components/maritime/
    DocumentClassificationCard
    ExtractedDataTable
    ExtractionSummaryCards
    MissingFieldsPanel
    SchemaValidationCard
    RiskReviewTab
    EvalsTab
    HandoverTab
    Report components
    WorkflowArchitectureGraph

  pages/
    Dashboard
    Samples
    Workspace
    Evals
    Reports
    Architecture
    Demo
    MarcuraFit
```

## Workflow Model

The simulated workflow is organized around an `AnalysisRun` lifecycle. The UI surfaces the progression from document intake to extraction, risk review, evaluation, and report generation.

Core workflow concepts:

- document classification;
- schema registry per document type;
- extracted fields with confidence and evidence;
- missing field detection;
- human edits and confirmations;
- risk taxonomy and severity;
- critic review;
- evaluation metrics;
- export-ready report data.

## Evaluation Layer

The evaluation layer is one of the most important parts of the project. It treats AI output quality as a product feature rather than an afterthought.

`src/lib/evals.ts` includes deterministic helpers for:

- JSON validity;
- extraction completeness;
- evidence grounding;
- risk detection;
- hallucination risk;
- handover usefulness;
- calibration;
- latency breakdown;
- token/cost breakdown;
- regression preview;
- aggregate dashboard status.

This makes the project especially relevant for AI QA, AI Assistant testing, and eval-driven product engineering roles.

## Evidence-Grounded Extraction

The extraction UI does not simply display generated fields. It models operational trust:

- every field has a confidence score;
- fields can be missing, extracted, low confidence, edited, or confirmed;
- critical missing fields are highlighted;
- source evidence is part of the review experience;
- schema validation is visible to the operator.

## Risk Review

The risk review area includes:

- severity;
- category;
- status;
- owner suggestion;
- filtering and sorting;
- detailed risk drawer;
- evidence blocks;
- human comments and decisions.

Risk categories include contractual, operational, compliance, financial, timing, documentation, and data quality.

## Architecture Roadmap

The app is deliberately built as a deterministic frontend simulation today, but the architecture page maps it to a production direction:

- FastAPI backend;
- LangGraph orchestration;
- LangSmith / OpenTelemetry tracing;
- OCR and VLM ingestion;
- object storage for documents;
- Postgres for runs, extraction, risks, and audit trail;
- queue workers for long-running steps;
- provider abstraction for OpenAI, Anthropic, or Gemini;
- RBAC for operator/admin roles;
- feedback dataset for continuous eval improvement.

## Running Locally

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Lint:

```bash
npm run lint
```

## What To Review First

1. `src/data/samples.ts` for document fixtures.
2. `src/data/analysisFixtures.ts` for deterministic run outputs.
3. `src/lib/extraction.ts` for schema-bound extraction logic.
4. `src/lib/evals.ts` for AI quality/evaluation thinking.
5. `src/lib/risks.ts` for risk taxonomy and review helpers.
6. `src/pages/Architecture.tsx` for production architecture mapping.
7. `src/components/maritime/evals/EvalsTab.tsx` for eval UX.
8. `src/components/maritime/risks/RiskReviewTab.tsx` for human review workflow.

## Recruiter Signal

This is one of the strongest AI-focused portfolio projects in the profile.

It demonstrates:

- AI Assistant feature design;
- AI QA and eval thinking;
- schema validation;
- evidence grounding;
- risk-based testing mindset;
- human-in-the-loop workflow design;
- frontend product engineering;
- ability to explain how a prototype becomes production architecture.

It is relevant for QA AI Engineer, AI QA, AI Assistant QA, SDET for AI products, product-minded QA Lead, and developer-tool / workflow automation roles.
