import { Sparkles, Loader2, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AnalysisRun, EvaluationMetric } from "@/types/analysis";
import type { SampleDocument } from "@/data/samples";
import {
  buildMetricViews,
  getEvalDashboardStatus,
  getGroundingStats,
  getLatencyBreakdown,
  getOverallQualityScore,
  getRegressionPreview,
  getTokenCostBreakdown,
  METRIC_META,
  type DashboardStatus,
} from "@/lib/evals";
import { QualityScoreCard } from "./QualityScoreCard";
import { EvalMetricCard } from "./EvalMetricCard";
import { QualityRadarCard } from "./QualityRadarCard";
import { LatencyBreakdownCard } from "./LatencyBreakdownCard";
import { TokenCostBreakdownCard } from "./TokenCostBreakdownCard";
import { GroundingPanel } from "./GroundingPanel";
import { RegressionPreviewCard } from "./RegressionPreviewCard";

const STATUS_TONE: Record<DashboardStatus, string> = {
  Excellent: "border-success/40 bg-success/10 text-success",
  Passing: "border-primary/40 bg-primary/10 text-primary",
  "Needs Review": "border-warning/40 bg-warning/10 text-warning",
  Failing: "border-destructive/40 bg-destructive/10 text-destructive",
};

interface Props {
  run: AnalysisRun | null;
  sample: SampleDocument;
}

export function EvalsTab({ run, sample }: Props) {
  const evalsStep = run?.steps.find((s) => s.node === "run_evals");
  const evalsRunning = evalsStep?.status === "running";
  const evalsDone = Boolean(run?.evals && run.evals.length > 0);

  if (!run || run.status === "pending") {
    return (
      <div className="panel p-10 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
        <h3 className="text-base font-semibold">Waiting for evaluation metrics…</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Start the agent analysis to compute schema validity, grounding, risk recall,
          handover usefulness, calibration, latency and cost.
        </p>
      </div>
    );
  }

  if (evalsRunning || (!evalsDone && run.status === "running")) {
    return <EvalsLoading />;
  }

  if (!evalsDone) {
    return (
      <div className="panel p-10 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
        <h3 className="text-base font-semibold">No evaluation metrics yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The evaluation step has not produced metrics for this run.
        </p>
      </div>
    );
  }

  // Build full metric set: 7 quality + latency + cost (computed from totals).
  const baseEvals = run.evals as EvaluationMetric[];
  const latencyMetric: EvaluationMetric = {
    key: "latency",
    label: METRIC_META.latency.label,
    value: run.totals.latencyMs,
    unit: METRIC_META.latency.unit,
    target: METRIC_META.latency.target,
    direction: METRIC_META.latency.direction,
    explanation: METRIC_META.latency.explanation,
  };
  const costMetric: EvaluationMetric = {
    key: "token_cost",
    label: METRIC_META.token_cost.label,
    value: run.totals.costUsd,
    unit: METRIC_META.token_cost.unit,
    target: METRIC_META.token_cost.target,
    direction: METRIC_META.token_cost.direction,
    explanation: METRIC_META.token_cost.explanation,
  };
  const allMetrics = [...baseEvals, latencyMetric, costMetric];
  const views = buildMetricViews(allMetrics);

  const quality = getOverallQualityScore(baseEvals);
  const dashStatus = getEvalDashboardStatus(baseEvals);
  const latency = getLatencyBreakdown(run.steps);
  const cost = getTokenCostBreakdown(run.steps);
  const grounding = getGroundingStats(run);
  const regression = getRegressionPreview(run, sample);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Quality &amp; Evaluation
          </div>
          <h2 className="text-xl font-semibold">AI Quality &amp; Evaluation</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Automated quality checks for structured extraction, grounding, risk detection,
            handover readiness, latency, and token cost.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 self-start md:self-center rounded-md border px-3 py-1.5 text-sm font-semibold",
            STATUS_TONE[dashStatus],
          )}
        >
          {dashStatus}
        </span>
      </div>

      {/* Score + Radar */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <QualityScoreCard quality={quality} />
        </div>
        <div className="lg:col-span-3">
          <QualityRadarCard metrics={views} />
        </div>
      </div>

      {/* Metric cards */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
          Eval Metrics
        </h3>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {views.map((m) => (
            <EvalMetricCard key={m.key} metric={m} />
          ))}
        </div>
      </div>

      {/* Latency + Cost */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LatencyBreakdownCard data={latency} />
        <TokenCostBreakdownCard data={cost} />
      </div>

      {/* Grounding + Regression */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GroundingPanel data={grounding} />
        <RegressionPreviewCard data={regression} />
      </div>
    </div>
  );
}

function EvalsLoading() {
  return (
    <div className="space-y-6">
      <div className="panel p-6 flex items-center gap-3">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
        <div>
          <div className="text-sm font-semibold">Computing evaluation metrics…</div>
          <div className="text-xs text-muted-foreground">
            Running schema validity, grounding, risk recall and calibration checks.
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="lg:col-span-2 h-44" />
        <Skeleton className="lg:col-span-3 h-72" />
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}
