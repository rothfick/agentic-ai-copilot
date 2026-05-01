import { AppShell } from "@/components/maritime/AppShell";
import { PageHeader } from "@/components/maritime/PageHeader";
import { MetricPreviewCard } from "@/components/maritime/MetricPreviewCard";
import { Badge } from "@/components/ui/badge";

const METRICS: { label: string; value: string; hint: string; tone?: "success" | "warning" | "primary" | "default" }[] = [
  { label: "JSON Validity", value: "100%", hint: "Schema parse rate", tone: "success" },
  { label: "Extraction Completeness", value: "91%", hint: "Required fields populated", tone: "primary" },
  { label: "Evidence Grounding", value: "92%", hint: "Quotes found in source", tone: "primary" },
  { label: "Hallucination Risk", value: "Low", hint: "Critic verified", tone: "success" },
  { label: "Risk Detection", value: "0.88", hint: "Recall vs golden set", tone: "primary" },
  { label: "Handover Usefulness", value: "0.84", hint: "Rubric score", tone: "primary" },
  { label: "Confidence Calibration", value: "0.07", hint: "Lower is better", tone: "warning" },
  { label: "Avg Latency", value: "9.8s", hint: "Across 8 nodes" },
  { label: "Avg Token Cost", value: "$0.076", hint: "Per document" },
];

const RADAR_AXES = [
  "Validity",
  "Completeness",
  "Grounding",
  "Risk Recall",
  "Handover",
  "Calibration",
];

const Evals = () => {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Quality"
          title="Evaluations"
          description="Production-grade evals for an agentic document pipeline. Phase 6 wires these to live runs; Phase 1 ships the dashboard shape."
          actions={
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              Static preview
            </Badge>
          }
        />

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mb-8">
          {METRICS.map((m) => (
            <MetricPreviewCard key={m.label} {...m} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 panel p-6">
            <h3 className="text-sm font-semibold mb-4">Quality radar</h3>
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Concentric rings */}
              {[0.25, 0.5, 0.75, 1].map((r) => (
                <div
                  key={r}
                  className="absolute rounded-full border border-border/60"
                  style={{
                    inset: `${(1 - r) * 50}%`,
                  }}
                />
              ))}
              {/* Spokes */}
              {RADAR_AXES.map((axis, i) => {
                const angle = (i / RADAR_AXES.length) * Math.PI * 2 - Math.PI / 2;
                const x = 50 + Math.cos(angle) * 50;
                const y = 50 + Math.sin(angle) * 50;
                return (
                  <div
                    key={axis}
                    className="absolute top-1/2 left-1/2 h-px origin-left bg-border/60"
                    style={{
                      width: "50%",
                      transform: `rotate(${(i / RADAR_AXES.length) * 360 - 90}deg)`,
                    }}
                  >
                    <span
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-muted-foreground"
                      style={{
                        left: "100%",
                        top: 0,
                        transform: `rotate(${-((i / RADAR_AXES.length) * 360 - 90)}deg) translate(8px,-2px)`,
                      }}
                    >
                      {axis}
                    </span>
                    <span className="sr-only">{`${axis} ${x}${y}`}</span>
                  </div>
                );
              })}
              {/* Polygon */}
              <svg viewBox="0 0 100 100" className="absolute inset-0">
                <polygon
                  points={RADAR_AXES.map((_, i) => {
                    const v = [0.95, 0.91, 0.92, 0.88, 0.84, 0.93][i];
                    const angle = (i / RADAR_AXES.length) * Math.PI * 2 - Math.PI / 2;
                    const x = 50 + Math.cos(angle) * 50 * v;
                    const y = 50 + Math.sin(angle) * 50 * v;
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="hsl(189 94% 53% / 0.18)"
                  stroke="hsl(189 94% 53%)"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>

          <div className="lg:col-span-2 panel p-6">
            <h3 className="text-sm font-semibold mb-3">What we evaluate</h3>
            <ul className="space-y-3 text-sm">
              {[
                ["JSON validity", "Output passes the typed schema."],
                ["Extraction completeness", "% of required fields present."],
                ["Evidence grounding", "Quoted evidence found in the source."],
                ["Hallucination risk", "Critic + grounding heuristic."],
                ["Risk detection", "Recall vs labelled risks."],
                ["Handover usefulness", "Rubric: clarity, actions, owner."],
                ["Confidence calibration", "|avg confidence − accuracy|."],
                ["Latency & token cost", "Operational economics per run."],
              ].map(([t, d]) => (
                <li key={t}>
                  <div className="text-foreground font-medium">{t}</div>
                  <div className="text-muted-foreground text-xs">{d}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Evals;
