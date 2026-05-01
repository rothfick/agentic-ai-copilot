import { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="panel p-5 group transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
      <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 text-primary mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
