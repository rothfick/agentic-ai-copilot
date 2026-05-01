import { ReportSection } from "./ReportSection";
import { formatMs } from "@/lib/evals";
import type { MaritimeReport } from "@/lib/report";

export function ReportTechnicalAppendix({ report }: { report: MaritimeReport }) {
  return (
    <ReportSection
      number="N"
      title="Technical Appendix"
      description="Workflow graph, simulation notes, and the production roadmap for this system."
    >
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mono mb-2">
          Workflow graph
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {report.run.workflowSteps.map((s, i) => (
            <span key={s.node} className="flex items-center gap-1.5">
              <span className="rounded-md border border-border px-2 py-1 mono text-[11px] bg-card/40">
                {s.label}
                {s.durationMs ? (
                  <span className="ml-1.5 text-muted-foreground">
                    {formatMs(s.durationMs)}
                  </span>
                ) : null}
              </span>
              {i < report.run.workflowSteps.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground">
        <span className="text-foreground/90 font-medium">Simulation notice.</span>{" "}
        This run was produced by a deterministic frontend simulator. No real LLM API
        calls were made. Token counts and costs are illustrative only.
      </div>

      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mono mb-2">
          Production adapters (planned)
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 text-xs">
          {[
            ["Real LLM provider", "OpenAI / Anthropic / Gemini via a typed gateway."],
            ["Tracing", "LangSmith / OpenTelemetry per-node spans."],
            ["Backend", "FastAPI service exposing the AnalysisRun lifecycle."],
            ["Document pipeline", "PDF / OCR + chunking + retrieval."],
            ["Storage", "Postgres + object store for documents and runs."],
            ["Eval harness", "Golden-set CI with regression alerts."],
          ].map(([title, body]) => (
            <li key={title} className="rounded-md border border-border bg-card/40 p-2.5">
              <div className="text-foreground/90 font-medium">{title}</div>
              <div className="text-muted-foreground mt-0.5">{body}</div>
            </li>
          ))}
        </ul>
      </div>
    </ReportSection>
  );
}
