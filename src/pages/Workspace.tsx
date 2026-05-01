import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Info,
  Play,
  RotateCcw,
  Gauge,
  ShieldAlert,
  Coins,
  Timer,
  CheckCircle2,
  ScanLine,
  ClipboardList,
} from "lucide-react";
import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/maritime/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowStepper } from "@/components/maritime/WorkflowStepper";
import { AgentActivityLog } from "@/components/maritime/AgentActivityLog";
import { ResultStatCard } from "@/components/maritime/ResultStatCard";
import { getSample } from "@/data/samples";
import { useAnalysisRun } from "@/hooks/useAnalysisRun";
import { cn } from "@/lib/utils";

function fmtMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

const Workspace = () => {
  const { sampleId } = useParams();
  const sample = getSample(sampleId);
  const { run, start, reset } = useAnalysisRun(sample);

  if (!sample) {
    return (
      <AppShell>
        <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
          <PageHeader
            eyebrow="Workspace"
            title="No document selected"
            description="Pick a synthetic sample document to open it in the workspace."
          />
          <EmptyState
            icon={FileText}
            title="Workspace is empty"
            description="Choose one of the three synthetic samples to load it here and run the simulated agent workflow."
            action={
              <Button asChild>
                <Link to="/samples">Browse Sample Documents</Link>
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const status = run?.status ?? "pending";
  const isRunning = status === "running";
  const isComplete = status === "complete";
  const currentStep =
    run && run.currentStepIndex >= 0 ? run.steps[run.currentStepIndex] : null;

  const completenessPct = run?.evals?.find(
    (e) => e.key === "extraction_completeness"
  )?.value;
  const groundingPct = run?.evals?.find(
    (e) => e.key === "evidence_grounding"
  )?.value;

  const statusBadge = (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        status === "pending" && "border-border text-muted-foreground",
        status === "running" &&
          "border-primary/40 bg-primary/10 text-primary",
        status === "complete" &&
          "border-success/40 bg-success/10 text-success",
        status === "error" &&
          "border-destructive/40 bg-destructive/10 text-destructive"
      )}
    >
      {status}
    </Badge>
  );

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow={sample.documentTypeLabel}
          title={sample.title}
          description={sample.description}
          actions={
            <>
              <Button asChild variant="outline">
                <Link to="/samples">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Samples
                </Link>
              </Button>
              {!isRunning && !isComplete && (
                <Button
                  onClick={start}
                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                >
                  <Play className="mr-1 h-4 w-4" /> Start Agent Analysis
                </Button>
              )}
              {(isRunning || isComplete) && (
                <Button onClick={reset} variant="outline" disabled={isRunning}>
                  <RotateCcw className="mr-1 h-4 w-4" /> Reset
                </Button>
              )}
            </>
          }
        />

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            {sample.documentTypeLabel}
          </Badge>
          <Badge variant="outline">{sample.estimatedPages} pages</Badge>
          <Badge variant="outline">{sample.expectedRiskCount} expected risks</Badge>
          {statusBadge}
          {currentStep && isRunning && (
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Running · {currentStep.label}
            </Badge>
          )}
          {isComplete && (
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
              Awaiting human review
            </Badge>
          )}
        </div>

        {/* Live result stat cards */}
        {run && (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
            <ResultStatCard
              label="Document Type"
              value={
                run.classification
                  ? run.classification.type.replace(/_/g, " ")
                  : "—"
              }
              hint={
                run.classification
                  ? `${Math.round(run.classification.confidence * 100)}% confidence`
                  : "Pending classification"
              }
              icon={ScanLine}
              tone={run.classification ? "primary" : "default"}
            />
            <ResultStatCard
              label="Risks Found"
              value={run.risks ? String(run.risks.length) : "—"}
              hint={
                run.risks
                  ? `${run.risks.filter((r) => r.severity === "high" || r.severity === "critical").length} high+`
                  : "Pending risks"
              }
              icon={ShieldAlert}
              tone={run.risks ? "warning" : "default"}
            />
            <ResultStatCard
              label="Extraction"
              value={
                completenessPct !== undefined
                  ? `${completenessPct}%`
                  : run.extraction
                  ? `${run.extraction.length} fields`
                  : "—"
              }
              hint={
                completenessPct !== undefined
                  ? "Completeness"
                  : run.extraction
                  ? "Extracted"
                  : "Pending"
              }
              icon={ClipboardList}
              tone={run.extraction ? "primary" : "default"}
            />
            <ResultStatCard
              label="Grounding"
              value={
                groundingPct !== undefined ? `${groundingPct}%` : "—"
              }
              hint="Evidence-backed"
              icon={Gauge}
              tone={groundingPct !== undefined ? "success" : "default"}
            />
            <ResultStatCard
              label="Token Cost"
              value={
                run.totals.costUsd > 0
                  ? `$${run.totals.costUsd.toFixed(4)}`
                  : "$0.00"
              }
              hint={`${run.totals.tokens} tokens`}
              icon={Coins}
            />
            <ResultStatCard
              label="Latency"
              value={fmtMs(run.totals.latencyMs)}
              hint={
                isRunning
                  ? "Live"
                  : isComplete
                  ? "Total"
                  : "Idle"
              }
              icon={Timer}
            />
          </div>
        )}

        <Tabs defaultValue="workflow" className="w-full">
          <TabsList>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* WORKFLOW TAB */}
          <TabsContent value="workflow" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <WorkflowStepper
                  steps={run?.steps ?? []}
                  currentIndex={run?.currentStepIndex ?? -1}
                />
              </div>
              <div className="lg:col-span-2">
                <AgentActivityLog entries={run?.activityLog ?? []} />
              </div>
            </div>
            {!run || (status === "pending" && run.activityLog.length === 0) ? (
              <div className="mt-6 panel p-5 flex items-start gap-3">
                <div className="h-8 w-8 rounded-md flex items-center justify-center bg-primary/10 text-primary shrink-0">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Ready to run</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click <span className="text-foreground">Start Agent Analysis</span> to run the simulated workflow:{" "}
                    <span className="mono text-foreground/80">
                      ingest → classify → extract → validate → risks → handover → critic → evals → human review
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* DOCUMENT TAB */}
          <TabsContent value="document" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3 panel p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Raw document</h3>
                  <span className="text-xs text-muted-foreground">Synthetic</span>
                </div>
                <pre className="mono text-xs leading-relaxed text-muted-foreground bg-panel-elevated/70 border border-border rounded-md p-4 max-h-[420px] overflow-auto whitespace-pre-wrap">
                  {sample.rawText}
                </pre>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="panel p-5">
                  <h3 className="text-sm font-semibold mb-3">Document metadata</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground">{sample.documentTypeLabel}</span>
                    </li>
                    <li className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Pages</span>
                      <span className="text-foreground">{sample.estimatedPages}</span>
                    </li>
                    <li className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Complexity</span>
                      <span className="text-foreground">{sample.complexity}</span>
                    </li>
                    <li className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Expected risks</span>
                      <span className="text-foreground">{sample.expectedRiskCount}</span>
                    </li>
                  </ul>
                </div>
                <div className="panel p-4 text-xs text-muted-foreground">
                  This document is synthetic and was generated for demo purposes.
                  No real customer data is used.
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SUMMARY TAB */}
          <TabsContent value="summary" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="panel p-5">
                <h3 className="text-sm font-semibold mb-3">Run status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {statusBadge}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current step</span>
                    <span className="text-foreground">
                      {currentStep ? currentStep.label : isComplete ? "Done" : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span className="text-foreground mono text-xs">
                      {run ? new Date(run.createdAt).toLocaleTimeString() : "—"}
                    </span>
                  </div>
                  {run?.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="text-foreground mono text-xs">
                        {new Date(run.completedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="panel p-5">
                <h3 className="text-sm font-semibold mb-3">Classification</h3>
                {run?.classification ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground capitalize">
                        {run.classification.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="text-foreground">
                        {Math.round(run.classification.confidence * 100)}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                        Alternatives
                      </div>
                      {run.classification.alternatives.map((a) => (
                        <div key={a.type} className="flex justify-between text-xs">
                          <span className="text-muted-foreground capitalize">
                            {a.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-foreground">
                            {Math.round(a.probability * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Pending classification.</p>
                )}
              </div>
              <div className="panel p-5">
                <h3 className="text-sm font-semibold mb-3">Totals</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latency</span>
                    <span className="text-foreground mono">
                      {fmtMs(run?.totals.latencyMs ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="text-foreground mono">
                      {run?.totals.tokens ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="text-foreground mono">
                      ${(run?.totals.costUsd ?? 0).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* EARLY RESULTS PREVIEW */}
          <TabsContent value="results" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="panel p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">Extraction</h3>
                  {run?.extraction && (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      {run.extraction.length} fields
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {run?.extraction
                    ? `${run.extraction.filter((f) => !f.isMissing).length} extracted, ${run.extraction.filter((f) => f.isMissing).length} missing.`
                    : "Awaiting extraction step."}
                </p>
              </div>
              <div className="panel p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">Risks</h3>
                  {run?.risks && (
                    <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                      {run.risks.length} flagged
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {run?.risks
                    ? `${run.risks.filter((r) => r.severity === "high" || r.severity === "critical").length} high+ · ${run.risks.filter((r) => r.severity === "medium").length} medium · ${run.risks.filter((r) => r.severity === "low").length} low.`
                    : "Awaiting risk detection."}
                </p>
              </div>
              <div className="panel p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">Handover</h3>
                  {run?.handover && (
                    <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                      Generated
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {run?.handover
                    ? `${run.handover.nextActions.length} next actions · owner: ${run.handover.owner ?? "TBD"}.`
                    : "Awaiting handover generation."}
                </p>
              </div>
              <div className="panel p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">Critic</h3>
                  {run?.critic && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        run.critic.overallVerdict === "pass" &&
                          "border-success/30 bg-success/10 text-success",
                        run.critic.overallVerdict === "review" &&
                          "border-warning/30 bg-warning/10 text-warning",
                        run.critic.overallVerdict === "fail" &&
                          "border-destructive/30 bg-destructive/10 text-destructive"
                      )}
                    >
                      {run.critic.overallVerdict}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {run?.critic
                    ? `${run.critic.issues.length} issue${run.critic.issues.length === 1 ? "" : "s"} raised.`
                    : "Awaiting critic review."}
                </p>
              </div>
              <div className="panel p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">Evaluations</h3>
                  {run?.evals && (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                      {run.evals.length} metrics
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {run?.evals
                    ? `Computed across ${run.evals.length} dimensions including grounding and hallucination risk.`
                    : "Awaiting evaluation step."}
                </p>
              </div>
              <div className="panel p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">Human Review</h3>
                  {isComplete && (
                    <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                      Waiting
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {isComplete ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      Analysis complete — waiting for human review.
                    </>
                  ) : (
                    "Pending end of pipeline."
                  )}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default Workspace;
