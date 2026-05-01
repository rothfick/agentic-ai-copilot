import { useMemo, useState } from "react";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DEFAULT_FILTERS,
  filterRisks,
  getRiskReviewStatus,
  getRiskSummaryStats,
  sortRisks,
  type RiskFiltersState,
  type RiskSortKey,
} from "@/lib/risks";
import type {
  AnalysisRun,
  RiskItem,
  RiskReviewStatus,
} from "@/types/analysis";
import { RiskCard } from "./RiskCard";
import { RiskDetailDrawer } from "./RiskDetailDrawer";
import { RiskFilters } from "./RiskFilters";
import { RiskIntelligenceSummary } from "./RiskIntelligenceSummary";
import { RiskSummaryCards } from "./RiskSummaryCards";
import { RiskTaxonomyCard } from "./RiskTaxonomyCard";

interface Props {
  run: AnalysisRun | null;
  onSetRiskStatus: (riskId: string, status: RiskReviewStatus) => void;
  onSetRiskComment: (riskId: string, comment: string) => void;
}

export function RiskReviewTab({ run, onSetRiskStatus, onSetRiskComment }: Props) {
  const [filters, setFilters] = useState<RiskFiltersState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<RiskSortKey>("severity");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const risks: RiskItem[] = run?.risks ?? [];
  const stats = useMemo(() => getRiskSummaryStats(risks), [risks]);
  const banner = getRiskReviewStatus(stats);

  const visible = useMemo(
    () => sortRisks(filterRisks(risks, filters), sort),
    [risks, filters, sort],
  );

  const selected = risks.find((r) => r.id === selectedId) ?? null;

  // ---------- Loading / empty states ----------
  const detectStep = run?.steps.find((s) => s.node === "detect_risks");
  const detectStatus = detectStep?.status ?? "idle";

  // No run at all (handled at workspace level too — fallback safety).
  if (!run) {
    return (
      <div className="panel p-8">
        <h3 className="text-base font-semibold">Operational Risk Review</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start the agent analysis to populate the risk register.
        </p>
      </div>
    );
  }

  // Detection still pending.
  if (detectStatus === "idle" || detectStatus === "running") {
    return (
      <div className="space-y-4">
        <Header banner={banner} />
        <div className="panel p-6 flex items-start gap-3">
          {detectStatus === "running" ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="text-sm font-medium">
              {detectStatus === "running"
                ? "Detecting risks…"
                : "Waiting for risk detection…"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              The agent will surface contractual, operational, financial and
              compliance risks once the detect_risks node completes.
            </p>
            <div className="mt-4 grid gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detection done but zero risks.
  if (risks.length === 0) {
    return (
      <div className="space-y-4">
        <Header banner={banner} />
        <div className="panel p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold">No material risks detected</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            The agent did not flag any operational risks for this document.
            Human review is still recommended for maritime operations.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Main layout ----------
  const handleCopy = async (recommendation: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(recommendation);
        toast.success("Recommendation copied to clipboard");
      } else {
        throw new Error("clipboard unavailable");
      }
    } catch {
      toast.message("Copy unavailable", {
        description: recommendation,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Header banner={banner} />

      <RiskSummaryCards stats={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <RiskIntelligenceSummary risks={risks} />

          <RiskFilters
            filters={filters}
            onChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            totalRisks={risks.length}
            visibleRisks={visible.length}
          />

          {visible.length === 0 ? (
            <div className="panel p-8 text-center text-sm text-muted-foreground">
              No risks match the current filters.
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((r) => (
                <RiskCard
                  key={r.id}
                  risk={r}
                  selected={selectedId === r.id}
                  onSelect={() => setSelectedId(r.id)}
                  onSetStatus={(s) => onSetRiskStatus(r.id, s)}
                  onAddComment={(c) => onSetRiskComment(r.id, c)}
                  onCopyRecommendation={() => handleCopy(r.recommendedAction)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <RiskTaxonomyCard />
        </div>
      </div>

      <RiskDetailDrawer
        risk={selected}
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        onSetStatus={(s) => selected && onSetRiskStatus(selected.id, s)}
        onAddComment={(c) => selected && onSetRiskComment(selected.id, c)}
        onCopyRecommendation={() =>
          selected ? handleCopy(selected.recommendedAction) : Promise.resolve()
        }
        extraction={run.extraction}
      />
    </div>
  );
}

function Header({
  banner,
}: {
  banner: ReturnType<typeof getRiskReviewStatus>;
}) {
  const map: Record<
    typeof banner,
    { label: string; cls: string }
  > = {
    no_risks: {
      label: "No risks detected",
      cls: "border-success/40 bg-success/10 text-success",
    },
    review_required: {
      label: "Review required",
      cls: "border-warning/40 bg-warning/10 text-warning",
    },
    critical_attention: {
      label: "Critical attention",
      cls: "border-destructive/40 bg-destructive/15 text-destructive",
    },
    review_complete: {
      label: "Review complete",
      cls: "border-success/40 bg-success/10 text-success",
    },
  };
  const b = map[banner];
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">Operational Risk Review</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          AI-detected risks grounded in source evidence and mapped to maritime
          operational impact.
        </p>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
          b.cls,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        {b.label}
      </span>
    </div>
  );
}
