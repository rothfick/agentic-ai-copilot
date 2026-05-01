import { Link } from "react-router-dom";
import { FileText, AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SampleDocument } from "@/data/samples";

const complexityStyles = {
  Low: "border-success/40 bg-success/10 text-success",
  Medium: "border-warning/40 bg-warning/10 text-warning",
  High: "border-high/40 bg-[hsl(var(--high))]/10 text-[hsl(var(--high))]",
} as const;

export function SampleDocumentCard({ sample }: { sample: SampleDocument }) {
  return (
    <div className="panel p-5 flex flex-col gap-4 group transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {sample.documentTypeLabel}
            </div>
            <h3 className="text-sm font-semibold truncate">{sample.title}</h3>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("shrink-0", complexityStyles[sample.complexity])}
        >
          {sample.complexity}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {sample.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="mono">{sample.estimatedPages} pages</span>
        <span className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-warning" />
          {sample.expectedRiskCount} expected risks
        </span>
      </div>

      <pre className="mono text-[11px] leading-relaxed text-muted-foreground bg-panel-elevated/70 border border-border rounded-md p-3 max-h-32 overflow-hidden whitespace-pre-wrap">
        {sample.rawText.split("\n").slice(0, 5).join("\n")}
        {"\n…"}
      </pre>

      <Button asChild className="mt-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90">
        <Link to={`/workspace/${sample.id}`}>
          Run Analysis
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
