import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, FileText } from "lucide-react";
import { SEVERITY_LABEL } from "@/lib/risks";
import { STATUS_LABEL, type ReportCardData } from "@/lib/report";

export function ReportCard({ card }: { card: ReportCardData }) {
  const sev = card.highestSeverity;
  return (
    <Card className="panel p-5 flex flex-col gap-4 hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-wider text-primary/80 mono">
              {card.typeLabel}
            </span>
          </div>
          <h3 className="text-base font-semibold leading-tight">{card.title}</h3>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] shrink-0",
            card.status === "export_ready" && "border-success/40 bg-success/10 text-success",
            card.status === "approved" && "border-primary/40 bg-primary/10 text-primary",
            card.status === "human_review_required" && "border-warning/40 bg-warning/10 text-warning",
            card.status === "draft" && "border-border text-muted-foreground",
          )}
        >
          {STATUS_LABEL[card.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Top severity"
          value={sev ? SEVERITY_LABEL[sev] : "None"}
          tone={
            sev === "critical" || sev === "high"
              ? "danger"
              : sev === "medium"
                ? "warn"
                : "ok"
          }
        />
        <Stat label="Risks" value={String(card.riskCount)} />
        <Stat
          label="Quality"
          value={`${card.qualityScore} · ${card.grade}`}
          tone={card.qualityScore >= 90 ? "ok" : card.qualityScore >= 80 ? undefined : "warn"}
        />
      </div>

      <Button asChild variant="outline" className="mt-auto">
        <Link to={`/reports/sample/${card.sampleId}`}>
          Open Report <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-2 bg-card/40",
        tone === "ok" && "border-success/30",
        tone === "warn" && "border-warning/30",
        tone === "danger" && "border-destructive/30",
        !tone && "border-border",
      )}
    >
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mono">
        {label}
      </div>
      <div className="text-sm mt-0.5 mono">{value}</div>
    </div>
  );
}
