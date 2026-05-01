import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface DemoStep {
  step: number;
  title: string;
  explanation: string;
  lookFor: string;
  skill: string;
  ctaLabel: string;
  ctaTo?: string;
}

export function DemoStepCard({ step }: { step: DemoStep }) {
  return (
    <div className="panel-elevated p-5 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
            {step.step}
          </div>
          <h3 className="text-base font-semibold leading-tight">{step.title}</h3>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {step.explanation}
      </p>
      <div className="space-y-2 text-xs mb-4">
        <div>
          <span className="text-muted-foreground">What to look for: </span>
          <span className="text-foreground/90">{step.lookFor}</span>
        </div>
        <div className="flex items-start gap-1.5 flex-wrap">
          <span className="text-muted-foreground">Skill: </span>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[10px]">
            {step.skill}
          </Badge>
        </div>
      </div>
      {step.ctaTo && (
        <div className="mt-auto pt-2">
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link to={step.ctaTo}>
              {step.ctaLabel} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
