import { useState } from "react";
import { AlertTriangle, ScanLine, ChevronsUpDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  ClassificationResult,
  DocumentType,
  ClassificationOverride,
} from "@/types/analysis";
import type { SchemaMeta } from "@/lib/extraction";

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  charter_party: "Charter Party",
  statement_of_facts: "Statement of Facts",
  port_call_note: "Port Call Note",
  da_estimate: "DA Estimate",
  invoice: "Invoice",
  handover_email: "Handover Email",
  unknown: "Unknown",
};

const TYPE_OPTIONS: DocumentType[] = [
  "charter_party",
  "statement_of_facts",
  "port_call_note",
  "da_estimate",
  "invoice",
  "handover_email",
];

interface Props {
  classification?: ClassificationResult;
  override?: ClassificationOverride;
  schema: SchemaMeta;
  onOverride: (type: DocumentType | null) => void;
}

export function DocumentClassificationCard({
  classification,
  override,
  schema,
  onOverride,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!classification) {
    return (
      <div className="panel p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ScanLine className="h-4 w-4" />
          Awaiting document classification…
        </div>
      </div>
    );
  }

  const effectiveType = override?.type ?? classification.type;
  const confidencePct = Math.round(classification.confidence * 100);
  const lowConfidence = classification.confidence < 0.85 && !override;

  return (
    <div className="panel p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Document Classification
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary text-sm px-3 py-1"
            >
              {DOC_TYPE_LABELS[effectiveType]}
            </Badge>
            {override && (
              <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                Manual override
              </Badge>
            )}
            <Badge variant="outline" className="border-border">
              <span className="mono text-[11px]">{schema.schemaName}</span>
            </Badge>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Confidence
          </div>
          <div
            className={cn(
              "mt-1 text-2xl font-semibold",
              lowConfidence ? "text-warning" : "text-foreground"
            )}
          >
            {confidencePct}%
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-panel-elevated overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              lowConfidence
                ? "bg-warning"
                : "bg-gradient-to-r from-primary to-secondary"
            )}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Detected: {DOC_TYPE_LABELS[classification.type]}</span>
          <span className="mono">{schema.schemaVersion}</span>
        </div>
      </div>

      {classification.alternatives?.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Alternatives
          </div>
          <div className="flex flex-wrap gap-1.5">
            {classification.alternatives.map((alt) => (
              <Badge
                key={alt.type}
                variant="outline"
                className="border-border bg-panel-elevated/60 text-xs"
              >
                {DOC_TYPE_LABELS[alt.type]}
                <span className="ml-1.5 mono text-muted-foreground">
                  {Math.round(alt.probability * 100)}%
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {lowConfidence && (
        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Low classification confidence</div>
            <div className="text-warning/80 mt-0.5">
              Confidence is below 85%. Consider manually overriding the document type.
            </div>
          </div>
        </div>
      )}

      {override && (
        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold">Manual override applied — rerun recommended.</div>
            <div className="text-warning/80 mt-0.5">
              Original detection: {DOC_TYPE_LABELS[classification.type]} ({confidencePct}%).
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs hover:bg-warning/20 hover:text-warning"
            onClick={() => onOverride(null)}
          >
            Revert
          </Button>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Schema bound for extraction:{" "}
            <span className="text-foreground mono">{schema.schemaName}</span>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Override type
                <ChevronsUpDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-1">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                Manual document type
              </div>
              {TYPE_OPTIONS.map((t) => {
                const selected = effectiveType === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      onOverride(t === classification.type ? null : t);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent/40 transition-colors",
                      selected && "text-primary"
                    )}
                  >
                    <span>{DOC_TYPE_LABELS[t]}</span>
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
