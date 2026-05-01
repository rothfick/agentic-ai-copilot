// Deterministic frontend simulation of the maritime agent workflow.
// No real LLM calls. Designed to be replaced by a FastAPI backend later.
import type {
  ActivityLogEntry,
  AgentNode,
  AnalysisRun,
  AnalysisStep,
} from "@/types/analysis";
import type { SampleDocument } from "@/data/samples";
import { getFixture } from "@/data/analysisFixtures";

interface NodeMeta {
  node: AgentNode;
  label: string;
  description: string;
  durationRange: [number, number];
}

export const WORKFLOW_NODES: NodeMeta[] = [
  { node: "ingest_document", label: "Ingest", description: "Normalize document and prepare for analysis.", durationRange: [600, 900] },
  { node: "classify_document", label: "Classify", description: "Identify document type and confidence.", durationRange: [900, 1300] },
  { node: "extract_structured_data", label: "Extract", description: "Extract typed fields with evidence quotes.", durationRange: [1400, 2200] },
  { node: "validate_schema", label: "Validate", description: "Validate fields against the schema contract.", durationRange: [500, 800] },
  { node: "detect_risks", label: "Risks", description: "Detect contractual, operational and financial risks.", durationRange: [1000, 1600] },
  { node: "generate_handover", label: "Handover", description: "Generate operator-ready handover summary.", durationRange: [1200, 1800] },
  { node: "critic_review", label: "Critic", description: "Self-review extraction, risks and handover.", durationRange: [900, 1400] },
  { node: "run_evals", label: "Evals", description: "Compute quality metrics for this run.", durationRange: [700, 1100] },
  { node: "human_review", label: "Human", description: "Awaiting human-in-the-loop review.", durationRange: [0, 0] },
];

// Deterministic hash → stable per-document timing within the documented ranges.
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickInRange(seed: number, range: [number, number]): number {
  if (range[0] === range[1]) return range[0];
  const span = range[1] - range[0];
  return range[0] + (seed % (span + 1));
}

export function createInitialRun(document: SampleDocument): AnalysisRun {
  const steps: AnalysisStep[] = WORKFLOW_NODES.map((n) => ({
    node: n.node,
    label: n.label,
    description: n.description,
    status: "idle",
  }));
  return {
    id: `run_${document.id}_${Date.now().toString(36)}`,
    documentId: document.id,
    status: "pending",
    currentStepIndex: -1,
    steps,
    feedback: [],
    totals: { latencyMs: 0, tokens: 0, costUsd: 0 },
    createdAt: new Date().toISOString(),
    activityLog: [],
  };
}

const ACTIVITY_MESSAGES: Record<AgentNode, string> = {
  ingest_document: "Document normalized and queued for classification.",
  classify_document: "Document classification complete.",
  extract_structured_data: "Structured fields extracted with evidence quotes.",
  validate_schema: "Schema validation passed.",
  detect_risks: "Risk detection complete.",
  generate_handover: "Operator handover generated.",
  critic_review: "Critic review complete.",
  run_evals: "Evaluation metrics calculated.",
  human_review: "Awaiting human-in-the-loop review.",
};

export interface RunCallbacks {
  onUpdate: (run: AnalysisRun) => void;
  isCancelled?: () => boolean;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function runSimulatedAnalysis(
  document: SampleDocument,
  initial: AnalysisRun,
  cb: RunCallbacks
): Promise<AnalysisRun> {
  const fixture = getFixture(document.id);
  let run: AnalysisRun = {
    ...initial,
    status: "running",
    currentStepIndex: 0,
  };
  cb.onUpdate(run);

  const seedBase = hashSeed(document.id);

  for (let i = 0; i < WORKFLOW_NODES.length; i++) {
    if (cb.isCancelled?.()) return run;
    const meta = WORKFLOW_NODES[i];
    const stepSeed = seedBase + i * 7919;
    const duration = pickInRange(stepSeed, meta.durationRange);

    // Mark running.
    const startedAt = new Date().toISOString();
    run = {
      ...run,
      currentStepIndex: i,
      steps: run.steps.map((s, idx) =>
        idx === i ? { ...s, status: "running", startedAt } : s
      ),
    };
    cb.onUpdate(run);

    // Human review is a waiting state — do not auto-tick.
    if (meta.node === "human_review") {
      const log: ActivityLogEntry = {
        at: new Date().toISOString(),
        node: meta.node,
        message: ACTIVITY_MESSAGES[meta.node],
        level: "warn",
      };
      run = {
        ...run,
        status: "complete",
        completedAt: new Date().toISOString(),
        steps: run.steps.map((s, idx) =>
          idx === i
            ? { ...s, status: "done", completedAt: log.at, durationMs: 0 }
            : s
        ),
        activityLog: [...run.activityLog, log],
      };
      cb.onUpdate(run);
      return run;
    }

    await sleep(duration);
    if (cb.isCancelled?.()) return run;

    // Per-node side effects: attach outputs.
    const profile = fixture?.stepProfile[meta.node];
    const tokens = profile?.tokens ?? 0;
    const costUsd = profile?.costUsd ?? 0;
    const confidence = profile?.confidence;

    const completedAt = new Date().toISOString();
    let updatedRun: AnalysisRun = {
      ...run,
      steps: run.steps.map((s, idx) =>
        idx === i
          ? {
              ...s,
              status: "done",
              completedAt,
              durationMs: duration,
              tokens,
              costUsd,
              confidence,
            }
          : s
      ),
      totals: {
        latencyMs: run.totals.latencyMs + duration,
        tokens: run.totals.tokens + tokens,
        costUsd: +(run.totals.costUsd + costUsd).toFixed(6),
      },
    };

    if (fixture) {
      switch (meta.node) {
        case "classify_document":
          updatedRun.classification = fixture.classification;
          break;
        case "extract_structured_data":
          updatedRun.extraction = fixture.extraction;
          break;
        case "detect_risks":
          updatedRun.risks = fixture.risks;
          break;
        case "generate_handover":
          updatedRun.handover = {
            ...fixture.handover,
            generatedAt: new Date().toISOString(),
          };
          break;
        case "critic_review":
          updatedRun.critic = fixture.critic;
          break;
        case "run_evals":
          updatedRun.evals = fixture.evals;
          break;
      }
    }

    // Activity log.
    let message = ACTIVITY_MESSAGES[meta.node];
    if (meta.node === "classify_document" && updatedRun.classification) {
      const pct = Math.round(updatedRun.classification.confidence * 100);
      message = `Detected ${updatedRun.classification.type.replaceAll("_", " ")} structure with ${pct}% confidence.`;
    } else if (meta.node === "extract_structured_data" && updatedRun.extraction) {
      message = `Validated ${updatedRun.extraction.length} extracted fields against schema candidates.`;
    } else if (meta.node === "detect_risks" && updatedRun.risks) {
      const cats = new Set(updatedRun.risks.map((r) => r.category));
      message = `Flagged ${updatedRun.risks.length} risks across ${cats.size} categories.`;
    } else if (meta.node === "generate_handover" && updatedRun.handover) {
      message = `Generated handover with ${updatedRun.handover.nextActions.length} next actions.`;
    } else if (meta.node === "critic_review" && updatedRun.critic) {
      const open = updatedRun.critic.issues.filter((x) => x.status === "open").length;
      message = `Critic requested human review for ${open} issue${open === 1 ? "" : "s"}.`;
    } else if (meta.node === "run_evals" && updatedRun.evals) {
      message = `Computed ${updatedRun.evals.length} evaluation metrics.`;
    }

    const log: ActivityLogEntry = {
      at: completedAt,
      node: meta.node,
      message,
      level: "success",
    };
    updatedRun = { ...updatedRun, activityLog: [...updatedRun.activityLog, log] };
    run = updatedRun;
    cb.onUpdate(run);
  }

  return run;
}
