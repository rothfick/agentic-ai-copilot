import { useState } from "react";
import {
  Check,
  ChevronRight,
  Clipboard,
  ClipboardCheck,
  Eye,
  MessageSquarePlus,
  Repeat2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  SEVERITY_TOKENS,
  getRiskOwnerSuggestion,
  getRiskStatus,
} from "@/lib/risks";
import type { RiskItem, RiskReviewStatus } from "@/types/analysis";
import { RiskCategoryBadge, RiskSeverityBadge, RiskStatusBadge } from "./RiskBadges";
import { RiskEvidenceBlock } from "./RiskEvidenceBlock";

interface Props {
  risk: RiskItem;
  onSelect: () => void;
  onSetStatus: (status: RiskReviewStatus) => void;
  onAddComment: (comment: string) => void;
  onCopyRecommendation: () => Promise<void> | void;
  selected?: boolean;
}

export function RiskCard({
  risk,
  onSelect,
  onSetStatus,
  onAddComment,
  onCopyRecommendation,
  selected,
}: Props) {
  const status = getRiskStatus(risk);
  const sev = SEVERITY_TOKENS[risk.severity];
  const [commentOpen, setCommentOpen] = useState(false);
  const [draft, setDraft] = useState(risk.reviewerComment ?? "");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopyRecommendation();
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <article
      className={cn(
        "panel border-l-4 p-4 transition-all",
        sev.ringRow,
        selected && "ring-1 ring-primary/40 shadow-[var(--shadow-glow)]",
        status === "dismissed" && "opacity-70",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <RiskSeverityBadge severity={risk.severity} />
            <RiskCategoryBadge category={risk.category} />
            <RiskStatusBadge status={status} />
            <span className="text-[11px] text-muted-foreground mono">
              {Math.round(risk.confidence * 100)}% conf.
            </span>
          </div>
          <h4 className="text-sm font-semibold leading-tight">{risk.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground leading-snug">
            {risk.description}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs shrink-0"
          onClick={onSelect}
        >
          Open <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Button>
      </header>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <RiskEvidenceBlock quote={risk.evidenceQuote} />
        <div className="rounded-md border border-border bg-panel-elevated/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Business impact
          </div>
          <p className="text-xs text-foreground/90 leading-snug">
            {risk.businessImpact}
          </p>
          <div className="mt-2 text-[10px] uppercase tracking-wider text-primary/80">
            Recommended action
          </div>
          <p className="text-xs text-foreground/90 leading-snug">
            {risk.recommendedAction}
          </p>
          <div className="mt-2 text-[10px] text-muted-foreground">
            Suggested owner ·{" "}
            <span className="text-foreground/80">
              {risk.owner ?? getRiskOwnerSuggestion(risk.category)}
            </span>
          </div>
        </div>
      </div>

      {risk.reviewerComment && !commentOpen && (
        <div className="mt-3 rounded-md border border-border bg-panel-elevated/20 p-2.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Reviewer comment
          </div>
          <p className="text-xs text-foreground/85 italic">
            “{risk.reviewerComment}”
          </p>
        </div>
      )}

      {commentOpen && (
        <div className="mt-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a reviewer comment for the audit trail…"
            className="text-xs min-h-[64px]"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => {
                setCommentOpen(false);
                setDraft(risk.reviewerComment ?? "");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                onAddComment(draft.trim());
                setCommentOpen(false);
              }}
            >
              Save comment
            </Button>
          </div>
        </div>
      )}

      <footer className="mt-3 flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant={status === "accepted" ? "default" : "outline"}
          className="h-8 text-xs"
          onClick={() => onSetStatus("accepted")}
        >
          <Check className="h-3.5 w-3.5" /> Accept
        </Button>
        <Button
          size="sm"
          variant={status === "needs_follow_up" ? "default" : "outline"}
          className="h-8 text-xs"
          onClick={() => onSetStatus("needs_follow_up")}
        >
          <Repeat2 className="h-3.5 w-3.5" /> Needs Follow-up
        </Button>
        <Button
          size="sm"
          variant={status === "dismissed" ? "default" : "outline"}
          className="h-8 text-xs"
          onClick={() => onSetStatus("dismissed")}
        >
          <X className="h-3.5 w-3.5" /> Dismiss
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={() => setCommentOpen((v) => !v)}
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          {risk.reviewerComment ? "Edit comment" : "Add comment"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={onSelect}
        >
          <Eye className="h-3.5 w-3.5" /> Open evidence
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <ClipboardCheck className="h-3.5 w-3.5 text-success" /> Copied
            </>
          ) : (
            <>
              <Clipboard className="h-3.5 w-3.5" /> Copy recommendation
            </>
          )}
        </Button>
      </footer>
    </article>
  );
}
