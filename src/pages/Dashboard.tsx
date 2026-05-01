import { FileStack, Gauge, ShieldCheck, DollarSign } from "lucide-react";
import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { StatCard } from "@/components/maritime/StatCard";
import { RecentRunsTable } from "@/components/maritime/RecentRunsTable";
import { UploadPlaceholderCard } from "@/components/maritime/UploadPlaceholderCard";
import { SampleDocumentCard } from "@/components/maritime/SampleDocumentCard";
import { PortfolioReadinessCard } from "@/components/maritime/PortfolioReadinessCard";
import { SAMPLES } from "@/data/samples";

const Dashboard = () => {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Cockpit"
          title="Operations Intelligence Dashboard"
          description="Monitor recent runs, AI quality and operational risk across your maritime document pipeline."
          actions={
            <span className="inline-flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-xs text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Simulation layer ready
            </span>
          }
        />

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard label="Total Runs" value="3" icon={FileStack} hint="Last 24h" />
          <StatCard
            label="Avg Extraction Completeness"
            value="91%"
            icon={Gauge}
            trend={{ value: "+4%", positive: true }}
          />
          <StatCard
            label="Avg Evidence Grounding"
            value="92%"
            icon={ShieldCheck}
            hint="Critic verified"
          />
          <StatCard
            label="Avg Cost / Document"
            value="$0.08"
            icon={DollarSign}
            hint="Across 8 nodes"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-10">
          <div className="lg:col-span-2">
            <RecentRunsTable />
          </div>
          <UploadPlaceholderCard />
        </div>

        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-1">
              Try it now
            </div>
            <h2 className="text-lg font-semibold">Run a Sample</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((s) => (
            <SampleDocumentCard key={s.id} sample={s} />
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
