import { BookOpen } from "lucide-react";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  OWNER_SUGGESTION,
} from "@/lib/risks";
import { RiskCategoryBadge } from "./RiskBadges";

export function RiskTaxonomyCard() {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <BookOpen className="h-3.5 w-3.5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Risk Taxonomy</h3>
          <p className="text-[11px] text-muted-foreground">
            Domain model used by the agent for risk classification.
          </p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {CATEGORY_ORDER.map((c) => (
          <li
            key={c}
            className="rounded-md border border-border bg-panel-elevated/30 p-2.5"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <RiskCategoryBadge category={c} />
              <span className="text-[10px] text-muted-foreground">
                Owner · {OWNER_SUGGESTION[c]}
              </span>
            </div>
            <p className="text-xs text-foreground/85 leading-snug">
              {CATEGORY_DESCRIPTIONS[c].description}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground italic">
              e.g. {CATEGORY_DESCRIPTIONS[c].example}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
