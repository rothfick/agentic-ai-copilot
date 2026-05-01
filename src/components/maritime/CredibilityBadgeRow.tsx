import {
  Workflow,
  Braces,
  Quote,
  UserCheck,
  Activity,
  FileBarChart,
  FlaskConical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const badges = [
  { label: "Agentic Workflow", icon: Workflow },
  { label: "Structured Outputs", icon: Braces },
  { label: "Evidence Grounding", icon: Quote },
  { label: "Human Review", icon: UserCheck },
  { label: "Eval Harness", icon: Activity },
  { label: "Exportable Report", icon: FileBarChart },
  { label: "Simulation Mode", icon: FlaskConical },
];

export function CredibilityBadgeRow() {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <Badge
          key={b.label}
          variant="outline"
          className="gap-1.5 border-primary/30 bg-primary/5 text-foreground/90 px-2.5 py-1"
        >
          <b.icon className="h-3 w-3 text-primary" />
          <span className="text-[11px]">{b.label}</span>
        </Badge>
      ))}
    </div>
  );
}
