import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { EvalMetricView } from "@/lib/evals";

const RADAR_KEYS = [
  "json_validity",
  "extraction_completeness",
  "evidence_grounding",
  "risk_detection",
  "handover_usefulness",
  "confidence_calibration",
] as const;

interface Props {
  metrics: EvalMetricView[];
}

export function QualityRadarCard({ metrics }: Props) {
  const map = new Map(metrics.map((m) => [m.key, m]));
  const data = RADAR_KEYS.map((k) => {
    const m = map.get(k);
    return {
      axis: m?.label.replace(/ /g, "\n") ?? k,
      shortAxis: shortLabel(k),
      score: m ? Math.round(m.normalized * 100) : 0,
    };
  });

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold">Quality Radar</h3>
          <p className="text-xs text-muted-foreground">
            Normalized 0–100 across the six core quality axes.
          </p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="78%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="shortAxis"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              stroke="hsl(var(--border))"
            />
            <Radar
              name="Quality"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function shortLabel(k: string): string {
  switch (k) {
    case "json_validity":
      return "Validity";
    case "extraction_completeness":
      return "Completeness";
    case "evidence_grounding":
      return "Grounding";
    case "risk_detection":
      return "Risk Recall";
    case "handover_usefulness":
      return "Handover";
    case "confidence_calibration":
      return "Calibration";
    default:
      return k;
  }
}
