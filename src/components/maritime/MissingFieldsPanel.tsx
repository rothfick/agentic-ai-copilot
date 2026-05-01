import { AlertCircle, MailQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExtractedField } from "@/types/analysis";
import type { SchemaMeta } from "@/lib/extraction";

interface Props {
  missing: ExtractedField[];
  schema: SchemaMeta;
  onAdd: (key: string) => void;
}

export function MissingFieldsPanel({ missing, schema, onAdd }: Props) {
  if (!missing.length) {
    return (
      <div className="panel p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-success" />
          Missing Fields
        </h3>
        <p className="mt-2 text-xs text-muted-foreground">
          All required schema fields are present. No missing operational input.
        </p>
      </div>
    );
  }
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          Missing Fields
        </h3>
        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
          {missing.length}
        </Badge>
      </div>
      <ul className="space-y-3">
        {missing.map((f) => {
          const ctx = schema.operationalContext[f.key];
          const isCritical = schema.criticalKeys.includes(f.key);
          return (
            <li
              key={f.key}
              className="rounded-md border border-border bg-panel-elevated/40 p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {f.label}
                    {isCritical && (
                      <Badge
                        variant="outline"
                        className="border-destructive/30 bg-destructive/10 text-destructive text-[10px] py-0"
                      >
                        Critical
                      </Badge>
                    )}
                  </div>
                  <div className="mono text-[10px] text-muted-foreground">{f.key}</div>
                </div>
              </div>
              {ctx && (
                <>
                  <p className="text-xs text-muted-foreground mt-1">{ctx.why}</p>
                  <p className="text-xs text-foreground/80 mt-1">
                    <span className="text-muted-foreground">Recommended:</span>{" "}
                    {ctx.recommendedAction}
                  </p>
                </>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => onAdd(f.key)}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add missing value
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground"
                >
                  <MailQuestion className="h-3 w-3 mr-1" /> Mark as requested
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
