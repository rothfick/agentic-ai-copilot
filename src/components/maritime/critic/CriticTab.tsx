import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/maritime/EmptyState";
import { cn } from "@/lib/utils";
import type { AnalysisRun, CriticIssue, CriticIssueStatus } from "@/types/analysis";
import { SEVERITY_TOKENS, SEVERITY_LABEL } from "@/lib/risks";
import {
  CRITIC_SECTION_LABEL,
  CRITIC_VERDICT_LABEL,
  CRITIC_VERDICT_TOKEN,
  getCriticRecommendations,
  getCriticStats,
  getQualityGateStatus,
  type GateState,
} from "@/lib/critic";

interface CriticTabProps {
  run: AnalysisRun | null;
  onSetIssueStatus: (id: string, status: CriticIssueStatus) => void;
  onSetIssueComment: (id: string, comment: string) => void;
  onJumpToTab: (tab: string) => void;
}

export function CriticTab({
  run,
  onSetIssueStatus,
  onSetIssueComment,
  onJumpToTab,
}: CriticTabProps) {
  const critic = run?.critic;
  const criticStep = run?.steps.find((s) => s.node === "critic_review");
  const isRunning = criticStep?.status === "running";
  const notStarted =
    !critic && (run?.status === "pending" || (criticStep?.status === "idle" ?? true));

  if (notStarted && !isRunning) {
    return (
      <EmptyState
        icon={Bot}
        title="No critic review yet"
        description="Run the agent workflow to produce a second-pass review of extraction, risks, and handover."
      />
    );
  }
  if (isRunning || (!critic && run?.status === "running")) {
    return <CriticSkeleton />;
  }
  if (!critic) {
    return (
      <EmptyState
        icon={Bot}
        title="Waiting for critic review…"
        description="The critic step has not produced output yet."
      />
    );
  }

  const stats = getCriticStats(critic.issues);
  const verdict = critic.overallVerdict;
  const recs = getCriticRecommendations(run);
  const gate = getQualityGateStatus(run);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel p-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">AI Critic Review</h2>
            <Badge
              variant="outline"
              className={cn("text-[11px]", CRITIC_VERDICT_TOKEN[verdict])}
            >
              Verdict: {CRITIC_VERDICT_LABEL[verdict]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Second-pass review that challenges extraction, risk coverage,
            grounding, and handover readiness before human approval.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <SummaryStat label="Open Issues" value={stats.open} tone={stats.open > 0 ? "warning" : "default"} />
        <SummaryStat label="Accepted Fixes" value={stats.accepted} tone="success" />
        <SummaryStat label="Dismissed" value={stats.dismissed} />
        <SummaryStat
          label="Highest Severity"
          value={stats.highestSeverity ? SEVERITY_LABEL[stats.highestSeverity] : "—"}
          tone={stats.highestSeverity === "critical" || stats.highestSeverity === "high" ? "warning" : "default"}
        />
        <SummaryStat label="Sections Reviewed" value={`${stats.sectionsReviewed}/3`} />
        <SummaryStat
          label="Overall Verdict"
          value={CRITIC_VERDICT_LABEL[verdict]}
          tone={verdict === "pass" ? "success" : verdict === "fail" ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="panel">
            <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Critic Issues</h3>
              <span className="text-xs text-muted-foreground">{critic.issues.length} total</span>
            </div>
            {critic.issues.length === 0 ? (
              <div className="p-6 flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-success" />
                <span>No issues raised — extraction, risks, and handover passed critic review.</span>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {critic.issues.map((issue) => (
                  <CriticIssueCard
                    key={issue.id}
                    issue={issue}
                    onSetStatus={onSetIssueStatus}
                    onSetComment={onSetIssueComment}
                    onJumpToTab={onJumpToTab}
                  />
                ))}
              </ul>
            )}
          </div>

          <CriticRecommendationsSummary
            blockingIssue={recs.blockingIssue}
            nextStep={recs.nextStep}
            exportReadiness={recs.exportReadiness}
            ready={gate.ready}
          />
        </div>

        <div className="space-y-4">
          <CriticQualityGate run={run} />
        </div>
      </div>
    </div>
  );
}

function CriticSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <div className="panel p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-lg font-semibold mt-1",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </div>
    </div>
  );
}

// --- Issue card ---
function CriticIssueCard({
  issue,
  onSetStatus,
  onSetComment,
  onJumpToTab,
}: {
  issue: CriticIssue;
  onSetStatus: (id: string, status: CriticIssueStatus) => void;
  onSetComment: (id: string, comment: string) => void;
  onJumpToTab: (tab: string) => void;
}) {
  const [showComment, setShowComment] = useState(false);
  const [draft, setDraft] = useState(issue.comment ?? "");

  const sectionToTab: Record<CriticIssue["section"], string> = {
    extraction: "extraction",
    risks: "risks",
    handover: "handover",
  };

  const statusBadge =
    issue.status === "accepted"
      ? "border-success/40 bg-success/10 text-success"
      : issue.status === "dismissed"
        ? "border-border bg-muted/40 text-muted-foreground"
        : "border-warning/40 bg-warning/10 text-warning";

  const handleAccept = () => {
    onSetStatus(issue.id, "accepted");
    toast.success("Fix accepted — apply manually if needed");
  };

  return (
    <li
      className={cn(
        "px-5 py-4 border-l-2",
        SEVERITY_TOKENS[issue.severity].ringRow,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px]", SEVERITY_TOKENS[issue.severity].badge)}
            >
              {SEVERITY_LABEL[issue.severity]}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
              {CRITIC_SECTION_LABEL[issue.section]}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] capitalize", statusBadge)}>
              {issue.status}
            </Badge>
          </div>
          <div className="text-sm font-medium text-foreground">{issue.message}</div>
          {issue.suggestedFix && (
            <div className="text-xs text-muted-foreground">
              <span className="text-foreground/80 font-medium">Suggested fix: </span>
              {issue.suggestedFix}
            </div>
          )}
          {issue.comment && (
            <div className="mono text-[11px] bg-muted/40 border border-border/60 rounded px-2 py-1 text-foreground/80">
              {issue.comment}
            </div>
          )}
          {showComment && (
            <div className="space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Reviewer comment…"
                className="text-xs"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onSetComment(issue.id, draft);
                    setShowComment(false);
                    toast.success("Comment saved");
                  }}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowComment(false);
                    setDraft(issue.comment ?? "");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleAccept}
          disabled={issue.status === "accepted"}
        >
          <Check className="h-3.5 w-3.5" /> Accept Fix
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSetStatus(issue.id, "dismissed")}
          disabled={issue.status === "dismissed"}
        >
          <X className="h-3.5 w-3.5" /> Dismiss
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowComment((v) => !v)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {issue.comment ? "Edit Comment" : "Add Comment"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onJumpToTab(sectionToTab[issue.section])}
        >
          Jump to {CRITIC_SECTION_LABEL[issue.section]}
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </li>
  );
}

// --- Quality gate ---
function CriticQualityGate({ run }: { run: AnalysisRun | null }) {
  const gate = getQualityGateStatus(run);

  const stateIcon: Record<GateState, JSX.Element> = {
    pass: <CheckCircle2 className="h-4 w-4 text-success" />,
    warn: <AlertTriangle className="h-4 w-4 text-warning" />,
    fail: <AlertTriangle className="h-4 w-4 text-destructive" />,
    pending: <Info className="h-4 w-4 text-muted-foreground" />,
  };

  return (
    <div className="panel">
      <div className="px-5 py-3 border-b border-border/60 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Quality Gate</h3>
      </div>
      <ul className="divide-y divide-border/60">
        {gate.checks.map((c) => (
          <li key={c.key} className="px-5 py-3 flex items-start gap-3">
            <div className="mt-0.5">{stateIcon[c.state]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{c.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.detail}</div>
            </div>
          </li>
        ))}
      </ul>
      <div
        className={cn(
          "px-5 py-3 border-t border-border/60 text-sm font-medium",
          gate.ready ? "text-success" : "text-warning",
        )}
      >
        {gate.ready
          ? "✓ Ready for export"
          : "⚠ Human review required before export"}
      </div>
    </div>
  );
}

// --- Recommendations summary ---
function CriticRecommendationsSummary({
  blockingIssue,
  nextStep,
  exportReadiness,
  ready,
}: {
  blockingIssue: string;
  nextStep: string;
  exportReadiness: string;
  ready: boolean;
}) {
  const handleCopy = () => {
    const text = `${blockingIssue}\n${nextStep}\n${exportReadiness}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast.success("Recommendations copied"),
        () => toast.error("Clipboard unavailable"),
      );
    }
  };
  return (
    <div className="panel p-5 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Critic Recommendations</h3>
        <Button size="sm" variant="ghost" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" /> Copy
        </Button>
      </div>
      <p className="text-sm text-foreground/90">{blockingIssue}</p>
      <p className="text-sm text-muted-foreground">{nextStep}</p>
      <p
        className={cn(
          "text-sm font-medium",
          ready ? "text-success" : "text-warning",
        )}
      >
        {exportReadiness}
      </p>
    </div>
  );
}
