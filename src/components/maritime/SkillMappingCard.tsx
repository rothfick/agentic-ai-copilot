import { LucideIcon } from "lucide-react";

export interface SkillMapping {
  skill: string;
  description: string;
  icon: LucideIcon;
}

export function SkillMappingCard({ mapping }: { mapping: SkillMapping }) {
  const Icon = mapping.icon;
  return (
    <div className="panel-elevated p-4 flex gap-3">
      <div className="h-9 w-9 shrink-0 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="text-sm font-semibold">{mapping.skill}</div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {mapping.description}
        </p>
      </div>
    </div>
  );
}
