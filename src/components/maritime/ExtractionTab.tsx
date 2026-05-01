import { useMemo } from "react";
import { Loader2, ClipboardList, ArrowRight } from "lucide-react";
import type { AnalysisRun, DocumentType } from "@/types/analysis";
import {
  getExtractionFields,
  getMissingFields,
  getSchemaForRun,
  summarizeExtraction,
  validateExtraction,
} from "@/lib/extraction";
import { DocumentClassificationCard } from "./DocumentClassificationCard";
import { ExtractedDataTable } from "./ExtractedDataTable";
import { ExtractionSummaryCards } from "./ExtractionSummaryCards";
import { MissingFieldsPanel } from "./MissingFieldsPanel";
import { SchemaValidationCard } from "./SchemaValidationCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  run: AnalysisRun | null;
  onUpdateField: (key: string, value: string) => void;
  onConfirmField: (key: string) => void;
  onOverrideClassification: (type: DocumentType | null) => void;
}

export function ExtractionTab({
  run,
  onUpdateField,
  onConfirmField,
  onOverrideClassification,
}: Props) {
  const schema = useMemo(() => getSchemaForRun(run), [run]);
  const fields = getExtractionFields(run);
  const summary = useMemo(() => summarizeExtraction(fields, schema), [fields, schema]);
  const validation = useMemo(() => validateExtraction(run, schema), [run, schema]);
  const missing = getMissingFields(fields);

  const extractStep = run?.steps.find((s) => s.node === "extract_structured_data");
  const extractStatus = extractStep?.status ?? "idle";

  // Empty / loading states.
  if (!run) {
    return (
      <div className="panel p-8 text-center">
        <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-base font-semibold">No analysis run yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start the agent workflow to populate schema-bound extraction output.
        </p>
      </div>
    );
  }

  if (extractStatus === "idle") {
    return (
      <div className="panel p-8 text-center">
        <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-base font-semibold">Waiting for extraction output…</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The <span className="mono">extract_structured_data</span> agent has not run yet.
        </p>
      </div>
    );
  }

  if (extractStatus === "running" || !run.extraction) {
    return (
      <div className="panel p-8 text-center">
        <Loader2 className="h-10 w-10 mx-auto text-primary mb-3 animate-spin" />
        <h3 className="text-base font-semibold">Extracting structured fields…</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Schema-bound output with evidence quotes is being generated.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky-ish status banner */}
      <div className="sticky top-0 z-10 -mx-2 px-2 py-2 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <Badge
            variant="outline"
            className="border-success/30 bg-success/10 text-success"
          >
            Extraction ready for human review
          </Badge>
          <span className="text-xs text-muted-foreground">
            Schema-bound output · Evidence-grounded fields · Human edits tracked
          </span>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
          <a href="#missing">
            Jump to missing
            <ArrowRight className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>

      <ExtractionSummaryCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DocumentClassificationCard
            classification={run.classification}
            override={run.classificationOverride}
            schema={schema}
            onOverride={onOverrideClassification}
          />
        </div>
        <div className="lg:col-span-2">
          <SchemaValidationCard schema={schema} report={validation} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Structured Extraction</h3>
            <p className="text-xs text-muted-foreground">
              Inline-edit any field — changes are tracked as human edits.
            </p>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            {fields.length} fields
          </Badge>
        </div>
        <ExtractedDataTable
          fields={fields}
          onUpdate={onUpdateField}
          onConfirm={onConfirmField}
        />
      </div>

      <div id="missing">
        <MissingFieldsPanel
          missing={missing}
          schema={schema}
          onAdd={(key) => {
            // Soft cue: add an empty edit so the row enters edited state with a value of "" (still missing).
            // The user will then click Edit on the row to fill it.
            onUpdateField(key, "");
          }}
        />
      </div>
    </div>
  );
}
