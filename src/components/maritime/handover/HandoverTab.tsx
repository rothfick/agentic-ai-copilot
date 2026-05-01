import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Info,
  ListChecks,
  MessageSquareQuote,
  RefreshCw,
  Save,
  ShieldAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/maritime/EmptyState";
import { cn } from "@/lib/utils";
import type { AnalysisRun } from "@/types/analysis";
import type { SampleDocument } from "@/data/samples";
import {
  HANDOVER_STATUS_LABEL,
  HANDOVER_STATUS_TOKEN,
  copyToClipboard,
  getHandoverActions,
  getHandoverContent,
  getHandoverStatus,
  getLinkedRisksForHandover,
  getQuestionsForSample,
} from "@/lib/handover";
import { SEVERITY_TOKENS, SEVERITY_LABEL, getRiskStatus, STATUS_LABEL, STATUS_TOKENS } from "@/lib/risks";

interface HandoverTabProps {
  run: AnalysisRun | null;
  sample: SampleDocument;
  onUpdateContent: (markdown: string) => void;
  onCancelEdit: () => void;
  onApprove: () => void;
  onToggleAction: (id: string) => void;
  onJumpToTab: (tab: string) => void;
}

export function HandoverTab({
  run,
  sample,
  onUpdateContent,
  onCancelEdit,
  onApprove,
  onToggleAction,
  onJumpToTab,
}: HandoverTabProps) {
  const handover = run?.handover;
  const status = getHandoverStatus(run);

  // Loading: pipeline running but handover step not done.
  const handoverStep = run?.steps.find((s) => s.node === "generate_handover");
  const isGenerating = handoverStep?.status === "running";
  const notStartedYet =
    !handover &&
    (run?.status === "pending" || !handoverStep || handoverStep.status === "idle");

  if (notStartedYet && !isGenerating) {
    return (
      <EmptyState
        icon={FileText}
        title="No handover generated yet"
        description="Run the agent workflow to generate an operations handover from the structured extraction and risk analysis."
      />
    );
  }
  if (isGenerating || (!handover && run?.status === "running")) {
    return <HandoverSkeleton />;
  }
  if (!handover) {
    return (
      <EmptyState
        icon={FileText}
        title="Waiting for handover generation…"
        description="The handover step has not produced output yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <HandoverHeader
        status={status}
        handover={handover}
        onApprove={onApprove}
      />
      <HandoverSummaryCards run={run!} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <HandoverContentPanel
            run={run!}
            onUpdateContent={onUpdateContent}
            onCancelEdit={onCancelEdit}
          />
          <HandoverActionChecklist
            run={run!}
            onToggle={onToggleAction}
          />
          <HandoverQuestionsPanel sample={sample} />
        </div>
        <div className="space-y-6">
          <LinkedRisksPanel run={run!} onJumpToTab={onJumpToTab} />
        </div>
      </div>
    </div>
  );
}

function HandoverSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

// ------- Header -------
function HandoverHeader({
  status,
  handover,
  onApprove,
}: {
  status: ReturnType<typeof getHandoverStatus>;
  handover: NonNullable<AnalysisRun["handover"]>;
  onApprove: () => void;
}) {
  const handleCopy = async () => {
    const ok = await copyToClipboard(getHandoverContent(handover));
    if (ok) toast.success("Handover copied to clipboard");
    else toast.error("Clipboard unavailable — please copy manually");
  };
  const handleRegenerate = () => {
    toast.message("Regeneration", {
      description:
        "Will be available when real LLM execution is enabled. Current version uses deterministic simulation.",
    });
  };

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Operational Handover</h2>
            <Badge
              variant="outline"
              className={cn("text-[11px]", HANDOVER_STATUS_TOKEN[status])}
            >
              {HANDOVER_STATUS_LABEL[status]}
            </Badge>
            {handover.userEdited && (
              <Badge variant="outline" className="border-secondary/40 bg-secondary/10 text-secondary text-[11px]">
                Human edited
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            AI-generated maritime handover built from structured extraction, risk
            analysis, and source-grounded recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4" /> Copy Handover
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={status === "approved"}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          >
            <CheckCircle2 className="h-4 w-4" />
            {status === "approved" ? "Approved" : "Approve Handover"}
          </Button>
        </div>
      </div>
      {status === "approved" && handover.approvedAt && (
        <div className="mt-3 text-xs text-success">
          Approved at {new Date(handover.approvedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

// ------- Summary cards -------
function HandoverSummaryCards({ run }: { run: AnalysisRun }) {
  const handover = run.handover!;
  const linked = getLinkedRisksForHandover(run);
  const status = getHandoverStatus(run);
  const items = [
    { label: "Headline Risks", value: handover.headlineRisks.length },
    { label: "Next Actions", value: handover.nextActions.length },
    { label: "Assigned Owner", value: handover.owner ?? "—" },
    {
      label: "Generated At",
      value: new Date(handover.generatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    { label: "Linked Risks", value: linked.length },
    { label: "Human Status", value: HANDOVER_STATUS_LABEL[status] },
  ];
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className="panel p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {it.label}
          </div>
          <div className="text-sm font-semibold mt-1 truncate">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

// ------- Content panel (with edit) -------
function HandoverContentPanel({
  run,
  onUpdateContent,
  onCancelEdit,
}: {
  run: AnalysisRun;
  onUpdateContent: (markdown: string) => void;
  onCancelEdit: () => void;
}) {
  const handover = run.handover!;
  const content = getHandoverContent(handover);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const startEdit = () => {
    setDraft(content);
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    onCancelEdit();
  };
  const save = () => {
    onUpdateContent(draft);
    setEditing(false);
    toast.success("Handover updated");
  };

  return (
    <div className="panel">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Handover Content</h3>
          {handover.userEdited && (
            <Badge variant="outline" className="border-secondary/40 bg-secondary/10 text-secondary text-[10px]">
              Edited{" "}
              {handover.editedAt
                ? new Date(handover.editedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Badge>
          )}
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={cancel}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button size="sm" onClick={save}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Edit3 className="h-4 w-4" /> Edit Handover
          </Button>
        )}
      </div>
      <div className="p-5">
        {editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={22}
            className="mono text-xs leading-relaxed bg-background/60"
          />
        ) : (
          <MarkdownView source={content} />
        )}
      </div>
    </div>
  );
}

// Minimal markdown renderer (headings, lists, bold).
function MarkdownView({ source }: { source: string }) {
  const blocks = useMemo(() => renderMarkdown(source), [source]);
  return (
    <article className="prose-handover space-y-4 text-sm leading-relaxed text-foreground/90">
      {blocks}
    </article>
  );
}

function renderMarkdown(src: string): JSX.Element[] {
  const lines = src.split("\n");
  const out: JSX.Element[] = [];
  let listBuffer: string[] = [];
  let listKey = 0;
  const flushList = () => {
    if (listBuffer.length > 0) {
      const items = [...listBuffer];
      out.push(
        <ul key={`list-${listKey++}`} className="list-disc pl-5 space-y-1.5 marker:text-primary/70">
          {items.map((t, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inlineMd(t) }} />
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };
  let key = 0;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("# ")) {
      flushList();
      out.push(
        <h1 key={key++} className="text-xl font-bold text-foreground tracking-tight">
          {line.slice(2)}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      out.push(
        <h2 key={key++} className="text-base font-semibold text-foreground/95 mt-2 border-b border-border/60 pb-1">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      flushList();
      out.push(
        <h3 key={key++} className="text-sm font-semibold text-foreground/90 mt-1">
          {line.slice(4)}
        </h3>,
      );
    } else if (/^\s*[-*]\s+/.test(line)) {
      listBuffer.push(line.replace(/^\s*[-*]\s+/, ""));
    } else if (/^\s*\d+\.\s+/.test(line)) {
      listBuffer.push(line.replace(/^\s*\d+\.\s+/, ""));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      out.push(
        <p key={key++} dangerouslySetInnerHTML={{ __html: inlineMd(line) }} />,
      );
    }
  }
  flushList();
  return out;
}

function inlineMd(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="mono text-xs px-1 rounded bg-muted/50">$1</code>');
}

// ------- Action checklist -------
function HandoverActionChecklist({
  run,
  onToggle,
}: {
  run: AnalysisRun;
  onToggle: (id: string) => void;
}) {
  const actions = getHandoverActions(run);
  const completed = run.handover?.completedActionIds ?? [];
  if (actions.length === 0) return null;

  const handleCopy = (text: string) => {
    copyToClipboard(text).then((ok) =>
      ok ? toast.success("Action copied") : toast.error("Clipboard unavailable"),
    );
  };

  return (
    <div className="panel">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Action Checklist</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {completed.length}/{actions.length} complete
        </span>
      </div>
      <ul className="divide-y divide-border/60">
        {actions.map((a) => {
          const done = completed.includes(a.id);
          return (
            <li
              key={a.id}
              className={cn(
                "flex items-start gap-3 px-5 py-3",
                done && "opacity-60",
              )}
            >
              <Checkbox
                checked={done}
                onCheckedChange={() => onToggle(a.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm",
                    done && "line-through text-muted-foreground",
                  )}
                >
                  {a.text}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {a.priority && (
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", SEVERITY_TOKENS[a.priority].badge)}
                    >
                      {SEVERITY_LABEL[a.priority]} priority
                    </Badge>
                  )}
                  {run.handover?.owner && (
                    <span className="text-[11px] text-muted-foreground">
                      Owner: {run.handover.owner}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(a.text)}
                aria-label="Copy action"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ------- Questions panel -------
function HandoverQuestionsPanel({ sample }: { sample: SampleDocument }) {
  const questions = getQuestionsForSample(sample.id);
  if (questions.length === 0) return null;
  const handleCopy = (text: string) => {
    copyToClipboard(text).then((ok) =>
      ok ? toast.success("Question copied") : toast.error("Clipboard unavailable"),
    );
  };
  const handleCopyAll = () => {
    const all = questions.map((q, i) => `${i + 1}. (${q.audience}) ${q.text}`).join("\n");
    copyToClipboard(all).then((ok) =>
      ok ? toast.success("All questions copied") : toast.error("Clipboard unavailable"),
    );
  };
  return (
    <div className="panel">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Questions for Counterparty / Agent</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={handleCopyAll}>
          <Copy className="h-3.5 w-3.5" /> Copy all
        </Button>
      </div>
      <ul className="divide-y divide-border/60">
        {questions.map((q) => (
          <li key={q.id} className="px-5 py-3 flex items-start gap-3">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary text-[10px] mt-0.5"
            >
              {q.audience}
            </Badge>
            <div className="flex-1 text-sm">{q.text}</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(q.text)}
              aria-label="Copy question"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------- Linked risks panel -------
function LinkedRisksPanel({
  run,
  onJumpToTab,
}: {
  run: AnalysisRun;
  onJumpToTab: (tab: string) => void;
}) {
  const linked = getLinkedRisksForHandover(run);
  return (
    <div className="panel">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Linked Risks</h3>
        </div>
        <span className="text-xs text-muted-foreground">{linked.length}</span>
      </div>
      {linked.length === 0 ? (
        <div className="p-5 flex items-start gap-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>No high or critical risks linked to this handover.</span>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {linked.map((r) => {
            const status = getRiskStatus(r);
            return (
              <li key={r.id} className="px-5 py-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", SEVERITY_TOKENS[r.severity].badge)}
                  >
                    {SEVERITY_LABEL[r.severity]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", STATUS_TOKENS[status])}
                  >
                    {STATUS_LABEL[status]}
                  </Badge>
                </div>
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">
                  {r.recommendedAction}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-0 h-7 text-primary hover:text-primary"
                  onClick={() => onJumpToTab("risks")}
                >
                  Open in Risks tab <ExternalLink className="h-3 w-3" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
