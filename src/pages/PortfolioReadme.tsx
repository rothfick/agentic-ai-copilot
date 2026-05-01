import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { CopyBlock } from "@/components/maritime/CopyBlock";
import { CredibilityBadgeRow } from "@/components/maritime/CredibilityBadgeRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  readmeMarkdown,
  projectPitch,
  cvBullet,
  linkedInPost,
  applicationMessage,
} from "@/lib/portfolioCopy";

const PortfolioReadme = () => {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Portfolio README"
          title="MaritimeOps AI Copilot"
          description={projectPitch}
        />

        <div className="mb-8">
          <CredibilityBadgeRow />
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Why I built this</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              Most AI demos stop at "chat with PDF". Maritime operations need much more: schema-bound extraction,
              evidence grounding, operational risk modeling, human-in-the-loop review, critic gates, and measurable
              AI quality.
            </p>
            <p>
              MaritimeOps AI Copilot shows that full lifecycle as a coherent product — designed so the architecture,
              UX and product thinking are visible end-to-end.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Key features</CardTitle></CardHeader>
            <CardContent className="text-sm text-foreground/90">
              <ul className="space-y-1.5 list-disc pl-4">
                <li>9-node simulated agent workflow</li>
                <li>Structured extraction with evidence + edits</li>
                <li>Operational risk register with HITL actions</li>
                <li>Operator-ready handover summary</li>
                <li>AI critic + quality gate</li>
                <li>Eval harness (quality, grounding, latency, cost)</li>
                <li>Exportable executive report</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Tech stack</CardTitle></CardHeader>
            <CardContent className="text-sm text-foreground/90">
              <ul className="space-y-1.5 list-disc pl-4">
                <li>React 18 · Vite · TypeScript</li>
                <li>TailwindCSS · shadcn/ui · Recharts</li>
                <li>React Router · Lucide icons</li>
                <li>Deterministic simulation layer</li>
                <li>Modular typed domain model</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3"><CardTitle className="text-base">Staff AI Engineer competency mapping</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Agentic workflow design · structured outputs · evidence grounding · risk modeling · human-in-the-loop AI ·
            evals as product surface · cost / latency observability · clean architecture · UX for complex AI systems ·
            business-to-technical translation.
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="pb-3"><CardTitle className="text-base">Future production roadmap</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            FastAPI backend · LangGraph orchestration · OCR + VLM ingestion · provider abstraction (OpenAI / Anthropic /
            Gemini) · LangSmith / OpenTelemetry tracing · Postgres + object storage · queue workers · RBAC + audit log ·
            feedback dataset for continuous eval improvement.
          </CardContent>
        </Card>

        <div className="space-y-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">Application copy</div>
            <h2 className="text-lg font-semibold mb-3">Copy-ready blocks</h2>
          </div>

          <CopyBlock label="README.md (Markdown)" text={readmeMarkdown} />
          <CopyBlock label="CV bullet" text={cvBullet} />
          <CopyBlock label="LinkedIn post" text={linkedInPost} />
          <CopyBlock label="Application message" text={applicationMessage} />
        </div>
      </div>
    </AppShell>
  );
};

export default PortfolioReadme;
