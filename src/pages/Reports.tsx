import { useMemo } from "react";
import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { ReportCard } from "@/components/maritime/report/ReportCard";
import { getDemoReportCards } from "@/lib/report";
import {
  CheckCircle2,
  ShieldCheck,
  FileSearch,
  GitBranch,
  Gauge,
  FileBarChart,
  ScrollText,
} from "lucide-react";

const Reports = () => {
  const cards = useMemo(() => getDemoReportCards(), []);

  const exportReady = cards.filter((c) => c.status === "export_ready").length;
  const review = cards.filter((c) => c.status === "human_review_required").length;
  const draft = cards.filter((c) => c.status === "draft").length;

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Export"
          title="Analysis Reports"
          description="Export-ready maritime AI analysis reports combining structured extraction, risk review, handover, critic findings, and evaluation metrics."
        />

        {/* Status overview */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-8">
          <StatusChip
            icon={ScrollText}
            label="Total reports"
            value={String(cards.length)}
          />
          <StatusChip
            icon={CheckCircle2}
            label="Export ready"
            value={String(exportReady)}
            tone="ok"
          />
          <StatusChip
            icon={ShieldCheck}
            label="Human review required"
            value={String(review)}
            tone="warn"
          />
          <StatusChip icon={FileBarChart} label="Drafts" value={String(draft)} />
        </div>

        {/* Sample reports */}
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-3">Demo Reports</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <ReportCard key={c.sampleId} card={c} />
            ))}
          </div>
        </div>

        {/* What this report demonstrates */}
        <div className="panel p-6 md:p-8">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mono mb-2">
            What this report demonstrates
          </div>
          <h3 className="text-lg font-semibold mb-4">
            Production-grade AI product engineering, end-to-end
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Capability
              icon={FileSearch}
              title="Schema-bound extraction"
              body="Typed fields with versioned schemas — outputs are machine-validatable."
            />
            <Capability
              icon={ScrollText}
              title="Evidence grounding"
              body="Every extracted value and risk is backed by a verbatim source quote."
            />
            <Capability
              icon={ShieldCheck}
              title="Risk taxonomy"
              body="Categorised, severity-ranked risks mapped to operational impact."
            />
            <Capability
              icon={GitBranch}
              title="Human-in-the-loop"
              body="Operators review, edit, and approve before downstream use."
            />
            <Capability
              icon={Gauge}
              title="AI eval harness"
              body="JSON validity, grounding, hallucination, recall, latency, cost."
            />
            <Capability
              icon={FileBarChart}
              title="Export readiness"
              body="Print-ready PDF and machine-readable JSON for ops handover."
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

function StatusChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="panel p-4 flex items-center gap-3">
      <div
        className={
          tone === "ok"
            ? "h-9 w-9 rounded-md flex items-center justify-center bg-success/10 text-success"
            : tone === "warn"
              ? "h-9 w-9 rounded-md flex items-center justify-center bg-warning/10 text-warning"
              : "h-9 w-9 rounded-md flex items-center justify-center bg-primary/10 text-primary"
        }
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
          {label}
        </div>
        <div className="text-lg font-semibold mono">{value}</div>
      </div>
    </div>
  );
}

function Capability({
  icon: Icon,
  title,
  body,
}: {
  icon: any;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-primary" />
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="text-xs text-muted-foreground">{body}</div>
    </div>
  );
}

export default Reports;
