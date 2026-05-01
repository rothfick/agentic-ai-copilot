import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { SampleDocumentCard } from "@/components/maritime/SampleDocumentCard";
import { SAMPLES } from "@/data/samples";

const Samples = () => {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Library"
          title="Sample Documents"
          description="Three synthetic maritime documents engineered to exercise the full agentic workflow: classification, extraction, risk detection and handover generation."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((s) => (
            <SampleDocumentCard key={s.id} sample={s} />
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Samples;
