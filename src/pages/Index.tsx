import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileSearch,
  ShieldAlert,
  ClipboardList,
  Activity,
  Anchor,
  PlayCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/maritime/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "@/components/maritime/FeatureCard";
import { WorkflowPreview } from "@/components/maritime/WorkflowPreview";
import { MetricPreviewCard } from "@/components/maritime/MetricPreviewCard";
import { CredibilityBadgeRow } from "@/components/maritime/CredibilityBadgeRow";

const lifecycle = [
  "Document",
  "Extraction",
  "Risks",
  "Handover",
  "Critic",
  "Evals",
  "Report",
];

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
            detect risk, generate handovers, run a critic gate, and measure AI
            quality — all in one workflow.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
            >
              <Link to="/demo">
                <PlayCircle className="h-4 w-4" /> Start Recruiter Demo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/architecture">
                <BookOpen className="h-4 w-4" /> View Architecture
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/dashboard">
                Open Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Built as a Staff AI Engineer portfolio demo · synthetic data only.
          </div>

          {/* Lifecycle strip */}
          <div className="mt-10">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Product Lifecycle
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {lifecycle.map((step, i) => (
                <div key={step} className="flex items-center gap-1.5">
                  <span className="text-xs px-2.5 py-1 rounded-md border border-primary/25 bg-primary/5 text-foreground/90">
                    {step}
                  </span>
                  {i < lifecycle.length - 1 && (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Agentic Workflow
            </div>
            <WorkflowPreview />
          </div>
        </div>
      </section>

      {/* Why this is not chat-with-PDF */}
      <section className="px-6 md:px-10 lg:px-14 pt-4 pb-12 max-w-6xl mx-auto">
        <div className="panel-elevated p-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">
            Why this is not chat-with-PDF
          </div>
          <h2 className="text-xl font-semibold mb-3">
            A full AI product lifecycle, not a single model demo.
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed mb-5">
            Most AI demos stop at "ask a document a question". MaritimeOps shows
            the full operator workflow: schema-bound extraction with evidence,
            an operational risk register, human-in-the-loop review, an AI
            critic + quality gate, an eval harness, and a decision-ready
            exportable report.
          </p>
          <CredibilityBadgeRow />
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 md:px-10 lg:px-14 py-4 max-w-6xl mx-auto">
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
      <section className="px-6 md:px-10 lg:px-14 py-12 max-w-6xl mx-auto">
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
            <MetricPreviewCard label="JSON Validity" value="100%" tone="success" />
            <MetricPreviewCard label="Evidence Grounding" value="92%" tone="primary" />
            <MetricPreviewCard label="Hallucination Risk" value="Low" tone="success" hint="Critic verified" />
            <MetricPreviewCard label="Avg Latency" value="12.4s" hint="across 8 nodes" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-10 lg:px-14 pb-20 max-w-6xl mx-auto">
        <div className="panel-elevated p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-base font-semibold mb-1">See it end-to-end in 5 minutes</div>
            <p className="text-sm text-muted-foreground">
              Start the recruiter walkthrough — guided demo of every surface.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              <Link to="/demo">
                <PlayCircle className="h-4 w-4" /> Start Recruiter Demo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/portfolio-readme">Portfolio README</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/marcura-fit">Marcura Fit</Link>
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default Index;
