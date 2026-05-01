import { useState } from "react";
import {
  Check,
  Clipboard,
  ClipboardCheck,
  Repeat2,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SEVERITY_TOKENS,
  getRiskOwnerSuggestion,
  getRiskStatus,
} from "@/lib/risks";
import { cn } from "@/lib/utils";
import type {
  ExtractedField,
  RiskItem,
  RiskReviewStatus,
} from "@/types/analysis";
import {
  RiskCategoryBadge,
  RiskSeverityBadge,
  RiskStatusBadge,
} from "./RiskBadges";
import { RiskEvidenceBlock } from "./RiskEvidenceBlock";

export function RiskDetailDrawer({
  risk,
  open,
  onClose,
  onSetStatus,
  onAddComment,
  onCopyRecommendation,
  extraction,
}: {
  risk: RiskItem | null;
  open: boolean;
  onClose: () => void;
  onSetStatus: (status: RiskReviewStatus) => void;
  onAddComment: (comment: string) => void;
  onCopyRecommendation: () => Promise<void> | void;
  extraction?: ExtractedField[];
}) {
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset draft when risk changes
  const currentId = risk?.id ?? null;
  const [lastId, setLastId] = useState<string | null>(null);
  if (currentId !== lastId) {
    setLastId(currentId);
    setDraft(risk?.reviewerComment ?? "");
    setCopied(false);
  }

  if (!risk) return null;
  const status = getRiskStatus(risk);
  const sev = SEVERITY_TOKENS[risk.severity];

  const related = (() => {
    if (!extraction || !risk.relatedFieldKeys?.length) return [];
    return extraction.filter((f) => risk.relatedFieldKeys!.includes(f.key));
  })();

  const handleCopy = async () => {
    await onCopyRecommendation();
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0"
      >
        <div className={cn("border-l-4 p-6", sev.ringRow)}>
          <SheetHeader className="text-left space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <RiskSeverityBadge severity={risk.severity} />
              <RiskCategoryBadge category={risk.category} />
              <RiskStatusBadge status={status} />
              <span className="text-[11px] text-muted-foreground mono ml-auto">
                {Math.round(risk.confidence * 100)}% confidence
              </span>
            </div>
            <SheetTitle className="text-lg leading-snug">
              {risk.title}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
              {risk.description}
            </SheetDescription>
          </SheetHeader>

          <section className="mt-5 space-y-4">
            <div>
              <SectionLabel>Source evidence</SectionLabel>
              <RiskEvidenceBlock quote={risk.evidenceQuote} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Block label="Business impact" body={risk.businessImpact} />
              <Block
                label="Recommended action"
                body={risk.recommendedAction}
                tone="primary"
              />
            </div>

            {related.length > 0 && (
              <div>
                <SectionLabel>Related extracted fields</SectionLabel>
                <ul className="rounded-md border border-border bg-panel-elevated/30 divide-y divide-border">
                  {related.map((f) => (
                    <li
                      key={f.key}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                    >
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className="mono text-foreground/90 truncate max-w-[60%] text-right">
                        {f.isMissing ? "—" : f.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Meta label="Suggested owner" value={risk.owner ?? getRiskOwnerSuggestion(risk.category)} />
              <Meta
                label="Last reviewed"
                value={
                  risk.reviewedAt
                    ? new Date(risk.reviewedAt).toLocaleString()
                    : "—"
                }
              />
            </div>

            <div>
              <SectionLabel>Reviewer comment</SectionLabel>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment for the audit trail…"
                className="text-xs min-h-[80px]"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => onAddComment(draft.trim())}
                >
                  Save comment
                </Button>
              </div>
            </div>
          </section>

          <footer className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
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
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs ml-auto"
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
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
      {children}
    </div>
  );
}

function Block({
  label,
  body,
  tone = "default",
}: {
  label: string;
  body: string;
  tone?: "default" | "primary";
}) {
  return (
    <div className="rounded-md border border-border bg-panel-elevated/30 p-3">
      <div
        className={cn(
          "text-[10px] uppercase tracking-wider mb-1",
          tone === "primary" ? "text-primary/80" : "text-muted-foreground",
        )}
      >
        {label}
      </div>
      <p className="text-xs text-foreground/90 leading-snug">{body}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-panel-elevated/20 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-xs text-foreground/90">{value}</div>
    </div>
  );
}
