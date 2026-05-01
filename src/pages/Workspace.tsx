import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Info } from "lucide-react";
import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkflowPreview } from "@/components/maritime/WorkflowPreview";
import { EmptyState } from "@/components/maritime/EmptyState";
import { getSample } from "@/data/samples";

const Workspace = () => {
  const { sampleId } = useParams();
  const sample = getSample(sampleId);

  if (!sample) {
    return (
      <AppShell>
        <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
          <PageHeader
            eyebrow="Workspace"
            title="No document selected"
            description="Pick a synthetic sample document to open it in the workspace."
          />
          <EmptyState
            icon={FileText}
            title="Workspace is empty"
            description="The analysis simulator will be implemented in Phase 2. For now, choose one of the three synthetic samples to load it here."
            action={
              <Button asChild>
                <Link to="/samples">Browse Sample Documents</Link>
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow={sample.documentTypeLabel}
          title={sample.title}
          description={sample.description}
          actions={
            <>
              <Button asChild variant="outline">
                <Link to="/samples">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Samples
                </Link>
              </Button>
              <Button
                disabled
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground opacity-60"
              >
                Run Workflow (Phase 2)
              </Button>
            </>
          }
        />

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            {sample.documentTypeLabel}
          </Badge>
          <Badge variant="outline">{sample.estimatedPages} pages</Badge>
          <Badge variant="outline">{sample.expectedRiskCount} expected risks</Badge>
          <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
            Idle
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 panel p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Raw document</h3>
              <span className="text-xs text-muted-foreground">Synthetic</span>
            </div>
            <pre className="mono text-xs leading-relaxed text-muted-foreground bg-panel-elevated/70 border border-border rounded-md p-4 max-h-[420px] overflow-auto whitespace-pre-wrap">
              {sample.rawText}
            </pre>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="panel p-5">
              <h3 className="text-sm font-semibold mb-3">Expected fields</h3>
              <ul className="space-y-2">
                {sample.expectedFields.map((f) => (
                  <li
                    key={f.label}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="mono text-foreground text-right">{f.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-5">
              <h3 className="text-sm font-semibold mb-3">Expected risks</h3>
              <ul className="space-y-2">
                {sample.expectedRisks.map((r) => (
                  <li
                    key={r.title}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">{r.title}</span>
                    <Badge
                      variant="outline"
                      className="capitalize border-border text-muted-foreground"
                    >
                      {r.severity}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Agent workflow · idle
          </div>
          <WorkflowPreview />
        </div>

        <div className="mt-6 panel p-5 flex items-start gap-3">
          <div className="h-8 w-8 rounded-md flex items-center justify-center bg-primary/10 text-primary shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Phase 2 preview</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Phase 2 will add the simulated agent workflow:{" "}
              <span className="mono text-foreground/80">
                ingest → classify → extract → validate → risks → handover →
                critic → evals
              </span>{" "}
              — with per-node status, latency, token cost and an editable
              extraction table.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Workspace;
