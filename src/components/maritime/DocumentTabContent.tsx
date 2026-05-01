import { useState } from "react";
import { FileText, ShieldCheck, Pencil, AlertTriangle } from "lucide-react";
import type { SampleDocument } from "@/data/samples";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PREVIEW_CHAR_LIMIT = 600;

export function DocumentTabContent({ sample }: { sample: SampleDocument }) {
  const [showFull, setShowFull] = useState(sample.rawText.length <= PREVIEW_CHAR_LIMIT);
  const text = showFull
    ? sample.rawText
    : `${sample.rawText.slice(0, PREVIEW_CHAR_LIMIT)}…`;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-4">
        <div className="panel p-5">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3 w-3" />
                Source document
              </div>
              <h3 className="mt-1 text-base font-semibold truncate">{sample.title}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                {sample.documentTypeLabel}
              </Badge>
              <Badge variant="outline">Synthetic</Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <Stat label="Pages" value={String(sample.estimatedPages)} />
            <Stat label="Complexity" value={sample.complexity} />
            <Stat label="Expected risks" value={String(sample.expectedRiskCount)} />
          </div>

          <div className="rounded-md border border-border bg-panel-elevated/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Raw document text
              </div>
              {sample.rawText.length > PREVIEW_CHAR_LIMIT && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setShowFull((v) => !v)}
                >
                  {showFull ? "Collapse" : "Show full text"}
                </Button>
              )}
            </div>
            <pre className="mono text-xs leading-relaxed text-foreground/90 max-h-[420px] overflow-auto whitespace-pre-wrap">
              {text}
            </pre>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="panel p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            Source Evidence Guide
          </h3>
          <ul className="mt-3 space-y-2.5 text-xs">
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                Each extracted field is matched against an evidence quote in the
                source text. Click <span className="text-foreground">View</span> on any field to inspect.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                Fields without an evidence quote are considered weaker grounding
                and should be verified manually.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Pencil className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                Human edits are tracked. Original AI output is preserved for
                audit alongside the human-confirmed value.
              </span>
            </li>
          </ul>
        </div>

        <div className="panel p-4 text-xs text-muted-foreground">
          This document is synthetic and was generated for demo purposes. No
          real customer data is used.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-panel-elevated/40 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
