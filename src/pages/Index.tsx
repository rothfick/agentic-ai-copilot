import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileSearch,
  ShieldAlert,
  ClipboardList,
  Activity,
  Anchor,
} from "lucide-react";
import { AppShell } from "@/components/maritime/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "@/components/maritime/FeatureCard";
import { WorkflowPreview } from "@/components/maritime/WorkflowPreview";
import { MetricPreviewCard } from "@/components/maritime/MetricPreviewCard";

const Index = () => {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="relative px-6 md:px-10 lg:px-14 pt-16 pb-20 max-w-6xl mx-auto">
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary gap-1.5"
          >
            <Anchor className="h-3 w-3" /> MaritimeOps AI Copilot
          </Badge>
          <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Agentic AI for{" "}
            <span className="text-gradient">Maritime Operations</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Classify maritime documents, extract structured operational data,
            detect risk, generate handovers, and evaluate AI quality — all in
            one workflow.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
            >
              <Link to="/dashboard">
                Open Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/samples">Try Sample Document</Link>
            </Button>
            <span className="text-xs text-muted-foreground ml-1">
              Built as a Staff AI Engineer portfolio demo · synthetic data only
            </span>
          </div>

          <div className="mt-10">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Agentic Workflow
            </div>
            <WorkflowPreview />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 md:px-10 lg:px-14 py-12 max-w-6xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={FileSearch}
            title="Document Intelligence"
            description="Classify Charter Parties, SoFs, DA estimates and handover emails with confidence scores."
          />
          <FeatureCard
            icon={ShieldAlert}
            title="Risk Detection"
            description="Surface contractual, operational, compliance and financial risks with evidence quotes."
          />
          <FeatureCard
            icon={ClipboardList}
            title="Operational Handover"
            description="Generate operator-ready handovers with headline risks, next actions and clear ownership."
          />
          <FeatureCard
            icon={Activity}
            title="AI Quality Evals"
            description="JSON validity, evidence grounding, hallucination risk, calibration, latency and cost."
          />
        </div>
      </section>

      {/* Eval preview */}
      <section className="px-6 md:px-10 lg:px-14 pb-20 max-w-6xl mx-auto">
        <div className="panel-elevated p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-1">
                Live evals preview
              </div>
              <h2 className="text-lg font-semibold">
                Quality is measured, not assumed
              </h2>
            </div>
            <Badge
              variant="outline"
              className="border-success/40 bg-success/10 text-success"
            >
              Last run · passed
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricPreviewCard
              label="JSON Validity"
              value="100%"
              tone="success"
            />
            <MetricPreviewCard
              label="Evidence Grounding"
              value="92%"
              tone="primary"
            />
            <MetricPreviewCard
              label="Hallucination Risk"
              value="Low"
              tone="success"
              hint="Critic verified"
            />
            <MetricPreviewCard
              label="Avg Latency"
              value="12.4s"
              hint="across 8 nodes"
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default Index;
