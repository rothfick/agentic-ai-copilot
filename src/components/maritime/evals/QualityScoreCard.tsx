import { cn } from "@/lib/utils";
import type { EvalGrade, QualityScore } from "@/lib/evals";

const GRADE_TONE: Record<EvalGrade, string> = {
  A: "text-success border-success/40 bg-success/10",
  B: "text-primary border-primary/40 bg-primary/10",
  C: "text-warning border-warning/40 bg-warning/10",
  D: "text-destructive border-destructive/40 bg-destructive/10",
};

const RING_TONE: Record<EvalGrade, string> = {
  A: "stroke-success",
  B: "stroke-primary",
  C: "stroke-warning",
  D: "stroke-destructive",
};

interface Props {
  quality: QualityScore;
}

export function QualityScoreCard({ quality }: Props) {
  const { score, grade, explanation } = quality;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="panel p-6 flex flex-col md:flex-row gap-6 items-center md:items-stretch">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="stroke-border/60 fill-none"
            strokeWidth="10"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            className={cn("fill-none transition-[stroke-dashoffset] duration-700", RING_TONE[grade])}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-semibold tracking-tight">{score}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">/ 100</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Overall Quality
          </span>
          <span
            className={cn(
              "text-xs font-semibold rounded-md border px-2 py-0.5",
              GRADE_TONE[grade],
            )}
          >
            Grade {grade}
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-1">AI Quality Score</h3>
        <p className="text-sm text-muted-foreground">{explanation}</p>
        <div className="mt-3 text-xs text-muted-foreground">
          Composite of JSON validity, completeness, grounding, risk recall, handover
          usefulness, calibration and inverse hallucination risk.
        </div>
      </div>
    </div>
  );
}
