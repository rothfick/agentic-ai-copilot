import { useState } from "react";
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
import { ExtractionTab } from "@/components/maritime/ExtractionTab";
import { DocumentTabContent } from "@/components/maritime/DocumentTabContent";
import { RiskReviewTab } from "@/components/maritime/risks/RiskReviewTab";
import { HandoverTab } from "@/components/maritime/handover/HandoverTab";
import { CriticTab } from "@/components/maritime/critic/CriticTab";
import { EvalsTab } from "@/components/maritime/evals/EvalsTab";
import { getSample } from "@/data/samples";
import { useAnalysisRun } from "@/hooks/useAnalysisRun";
import {
  getExtractionFields,
  getSchemaForRun,
  summarizeExtraction,
} from "@/lib/extraction";
import { cn } from "@/lib/utils";

function fmtMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

const Workspace = () => {
  const { sampleId } = useParams();
  const sample = getSample(sampleId);
  const [activeTab, setActiveTab] = useState("workflow");
  const {
    run,
    start,
    reset,
    updateField,
    confirmField,
    setClassificationOverride,
    setRiskStatus,
    setRiskComment,
    updateHandoverContent,
    cancelHandoverEdit,
    approveHandover,
    toggleHandoverAction,
    setCriticIssueStatus,
    setCriticIssueComment,
  } = useAnalysisRun(sample);

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

  const schema = getSchemaForRun(run);
  const fields = getExtractionFields(run);
  const summary = summarizeExtraction(fields, schema);

  const extractionReady = Boolean(run?.extraction && run.extraction.length > 0);
  const groundingPct = run?.evals?.find((e) => e.key === "evidence_grounding")?.value;

  const statusBadge = (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        status === "pending" && "border-border text-muted-foreground",
        status === "running" && "border-primary/40 bg-primary/10 text-primary",
        status === "complete" && "border-success/40 bg-success/10 text-success",
        status === "error" && "border-destructive/40 bg-destructive/10 text-destructive"
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
                  ? (run.classificationOverride?.type ?? run.classification.type).replace(/_/g, " ")
                  : "—"
              }
              hint={
                run.classification
                  ? run.classificationOverride
                    ? "Manual override"
                    : `${Math.round(run.classification.confidence * 100)}% confidence`
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
              value={extractionReady ? `${summary.completed}/${summary.required}` : "—"}
              hint={
                extractionReady
                  ? `${Math.round(summary.overallConfidence * 100)}% confidence`
                  : "Pending"
              }
              icon={ClipboardList}
              tone={extractionReady ? "primary" : "default"}
            />
            <ResultStatCard
              label="Grounding"
              value={groundingPct !== undefined ? `${groundingPct}%` : "—"}
              hint="Evidence-backed"
              icon={Gauge}
              tone={groundingPct !== undefined ? "success" : "default"}
            />
            <ResultStatCard
              label="Token Cost"
              value={
                run.totals.costUsd > 0 ? `$${run.totals.costUsd.toFixed(4)}` : "$0.00"
              }
              hint={`${run.totals.tokens} tokens`}
              icon={Coins}
            />
            <ResultStatCard
              label="Latency"
              value={fmtMs(run.totals.latencyMs)}
              hint={isRunning ? "Live" : isComplete ? "Total" : "Idle"}
              icon={Timer}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="extraction" className="gap-1.5">
              Extraction
              {extractionReady && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] px-1.5 py-0">
                  {summary.completed}/{summary.required}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="handover">Handover</TabsTrigger>
            <TabsTrigger value="critic">Critic</TabsTrigger>
            <TabsTrigger value="evals">Evals</TabsTrigger>
          </TabsList>

          {/* DOCUMENT TAB */}
          <TabsContent value="document" className="mt-4">
            <DocumentTabContent sample={sample} />
          </TabsContent>

          {/* WORKFLOW TAB */}
          <TabsContent value="workflow" className="mt-4">
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <WorkflowStepper
                  steps={run?.steps ?? []}
                  currentIndex={run?.currentStepIndex ?? -1}
                />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <AgentActivityLog entries={run?.activityLog ?? []} />
                {extractionReady && (
                  <div className="panel p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        Extraction ready
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {summary.completed}/{summary.required} fields ·{" "}
                        {summary.missing} missing
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab("extraction")}
                    >
                      Jump to Extraction
                    </Button>
                  </div>
                )}
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

          {/* EXTRACTION TAB — Phase 3 main focus */}
          <TabsContent value="extraction" className="mt-4">
            <ExtractionTab
              run={run}
              onUpdateField={updateField}
              onConfirmField={confirmField}
              onOverrideClassification={setClassificationOverride}
            />
          </TabsContent>

          {/* RISKS — Phase 4 */}
          <TabsContent value="risks" className="mt-4">
            <RiskReviewTab
              run={run}
              onSetRiskStatus={setRiskStatus}
              onSetRiskComment={setRiskComment}
            />
          </TabsContent>

          {/* HANDOVER — Phase 5 */}
          <TabsContent value="handover" className="mt-4">
            <HandoverTab
              run={run}
              sample={sample}
              onUpdateContent={updateHandoverContent}
              onCancelEdit={cancelHandoverEdit}
              onApprove={approveHandover}
              onToggleAction={toggleHandoverAction}
              onJumpToTab={setActiveTab}
            />
          </TabsContent>

          {/* CRITIC — Phase 5 */}
          <TabsContent value="critic" className="mt-4">
            <CriticTab
              run={run}
              onSetIssueStatus={setCriticIssueStatus}
              onSetIssueComment={setCriticIssueComment}
              onJumpToTab={setActiveTab}
            />
          </TabsContent>

          {/* EVALS — Phase 6 */}
          <TabsContent value="evals" className="mt-4">
            <EvalsTab run={run} sample={sample} />
          </TabsContent>
        </Tabs>

        {isComplete && (
          <div className="mt-6 panel p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <div className="text-sm">
              Analysis complete — pipeline finished, awaiting human review.
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Workspace;
