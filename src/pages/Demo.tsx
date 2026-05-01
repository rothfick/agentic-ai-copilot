import { Link } from "react-router-dom";
import {
  ArrowRight,
  PlayCircle,
  FileBarChart,
  Activity,
  BookOpen,
  Target,
  Workflow,
  Braces,
  Quote,
  ShieldAlert,
  ClipboardList,
  Gauge,
  UserCheck,
  Sparkles,
  Coins,
} from "lucide-react";
import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoStepCard, DemoStep } from "@/components/maritime/DemoStepCard";
import { SkillMappingCard, SkillMapping } from "@/components/maritime/SkillMappingCard";
import { CredibilityBadgeRow } from "@/components/maritime/CredibilityBadgeRow";

const BEST_SAMPLE_ID = "cp-northern-pioneer";
const BEST_DEMO_PATH = `/workspace/${BEST_SAMPLE_ID}`;

const steps: DemoStep[] = [
  {
    step: 1,
    title: "Open the Charter Party sample",
    explanation: "MV Northern Pioneer voyage charter — a realistic high-complexity maritime document with ambiguous clauses and a missing discharge agent.",
    lookFor: "Document type, complexity tag, expected risk count.",
    skill: "Domain framing",
    ctaLabel: "Open sample",
    ctaTo: `/samples`,
  },
  {
    step: 2,
    title: "Start agent analysis",
    explanation: "Trigger the simulated 9-node agent workflow. Each node's status updates progressively, just like a real LangGraph run.",
    lookFor: "Workflow stepper, activity log streaming events.",
    skill: "Agentic workflow design",
    ctaLabel: "Open workspace",
    ctaTo: BEST_DEMO_PATH,
  },
  {
    step: 3,
    title: "Watch the workflow graph progress",
    explanation: "The agent moves through ingest → classify → extract → validate → risk → handover → critic → evals → human review.",
    lookFor: "Node state transitions, per-step latency.",
    skill: "Observability mindset",
    ctaLabel: "Go to workspace",
    ctaTo: BEST_DEMO_PATH,
  },
  {
    step: 4,
    title: "Review structured extraction",
    explanation: "Schema-bound fields with confidence scores and evidence quotes. Edit a low-confidence field inline.",
    lookFor: "Confidence badges, evidence quotes, edited state.",
    skill: "Structured outputs",
    ctaLabel: "Open extraction",
    ctaTo: BEST_DEMO_PATH,
  },
  {
    step: 5,
    title: "Inspect the risk register",
    explanation: "Categorized, severity-ranked risks with source evidence and operational meaning.",
    lookFor: "Severity colors, evidence drawer, risk taxonomy.",
    skill: "Risk modeling + evidence grounding",
    ctaLabel: "Open risks",
    ctaTo: BEST_DEMO_PATH,
  },
  {
    step: 6,
    title: "Approve or comment on a risk",
    explanation: "Human-in-the-loop controls: Accept, Dismiss, Mark Needs Follow-up, add a comment.",
    lookFor: "Status changes persisting, reviewer comment.",
    skill: "Human-in-the-loop AI",
    ctaLabel: "Go to risk register",
    ctaTo: BEST_DEMO_PATH,
  },
  {
    step: 7,
    title: "Review the operational handover",
    explanation: "An operator-ready summary with headline risks, next actions and ownership.",
    lookFor: "Audience-aware tone, action ownership.",
    skill: "Product thinking",
    ctaLabel: "Open handover",
    ctaTo: BEST_DEMO_PATH,
  },
  {
    step: 8,
    title: "Check the critic quality gate",
    explanation: "A second-pass critic flags issues and decides export readiness.",
    lookFor: "Quality gate verdict, issue jump-to-tab links.",
    skill: "Critic + policy gates",
    ctaLabel: "Open critic",
    ctaTo: BEST_DEMO_PATH,
  },
  {
    step: 9,
    title: "Inspect the eval metrics",
    explanation: "Quality score, grounding, hallucination risk, calibration, latency, token cost, regression preview.",
    lookFor: "Composite score, radar, latency + cost breakdown.",
    skill: "Evals as a product feature",
    ctaLabel: "Open evals",
    ctaTo: "/evals",
  },
  {
    step: 10,
    title: "Open the exportable report",
    explanation: "Executive report with print-to-PDF, JSON export, and copyable executive summary.",
    lookFor: "Print preview, export buttons, audit trail.",
    skill: "Business artifact delivery",
    ctaLabel: "Open reports",
    ctaTo: "/reports",
  },
];

const skills: SkillMapping[] = [
  { skill: "Agentic workflow design", description: "Multi-step graph with explicit state transitions and progressive UI reveal.", icon: Workflow },
  { skill: "Structured outputs", description: "Schema-bound, evidence-cited fields suitable for downstream systems.", icon: Braces },
  { skill: "Evidence grounding", description: "Every extracted value and risk traces back to a source quote.", icon: Quote },
  { skill: "Risk modeling", description: "Categorized, severity-ranked, operationally meaningful risk register.", icon: ShieldAlert },
  { skill: "Human-in-the-loop AI", description: "Editable fields, review actions, critic gate, sign-off trail.", icon: UserCheck },
  { skill: "Eval harness", description: "Quality, grounding, hallucination risk, calibration, latency, cost, regression.", icon: Activity },
  { skill: "Product thinking", description: "Each surface answers a real operator question, not a model question.", icon: ClipboardList },
  { skill: "UX for complex AI", description: "Dense information made calm, scannable and trustworthy.", icon: Sparkles },
  { skill: "Cost / latency awareness", description: "Per-node latency and token cost surfaced as first-class metrics.", icon: Coins },
];

const Demo = () => {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Recruiter Walkthrough"
          title="Recruiter Demo Walkthrough"
          description="A guided 3–5 minute path through MaritimeOps AI Copilot — designed to show the full AI product lifecycle, not a chat-with-PDF demo."
          actions={
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90"
            >
              <Link to={BEST_DEMO_PATH}>
                <PlayCircle className="h-4 w-4" /> Start Best Demo
              </Link>
            </Button>
          }
        />

        {/* Narrative */}
        <Card className="mb-8 bg-gradient-to-br from-panel-elevated to-panel border-primary/20">
          <CardHeader className="pb-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-1">Demo Narrative</div>
            <CardTitle className="text-xl">From document to decision, in one workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              This demo shows how an AI agent transforms a maritime document into structured extraction, risk review,
              operational handover, critic review, evals and an exportable report — with human-in-the-loop controls
              at every gate.
            </p>
            <div className="mt-5">
              <CredibilityBadgeRow />
            </div>
          </CardContent>
        </Card>

        {/* Quick launch */}
        <div className="mb-10 grid gap-3 grid-cols-2 md:grid-cols-5">
          <Button asChild className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <Link to={BEST_DEMO_PATH}>
              <PlayCircle className="h-4 w-4" /> Start Best Demo
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/reports"><FileBarChart className="h-4 w-4" /> Open Reports</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/evals"><Activity className="h-4 w-4" /> Open Evals</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/architecture"><BookOpen className="h-4 w-4" /> Read Architecture</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/marcura-fit"><Target className="h-4 w-4" /> Read Marcura Fit</Link>
          </Button>
        </div>

        {/* Demo path */}
        <div className="mb-12">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-1">Recommended Demo Path</div>
          <h2 className="text-lg font-semibold mb-5">Ten steps · ~5 minutes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => <DemoStepCard key={s.step} step={s} />)}
          </div>
        </div>

        {/* What this proves */}
        <div className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-1">What this proves</div>
          <h2 className="text-lg font-semibold mb-5">Skills demonstrated end-to-end</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((s) => <SkillMappingCard key={s.skill} mapping={s} />)}
          </div>
        </div>

        <div className="panel-elevated p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-base font-semibold mb-1">Ready to dive in?</div>
            <p className="text-sm text-muted-foreground">Start the best demo path with one click.</p>
          </div>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <Link to={BEST_DEMO_PATH}>
              Start Best Demo <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default Demo;
