import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ReportSection({
  number,
  title,
  description,
  actions,
  children,
  className,
}: {
  number: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("report-section panel p-6 md:p-8", className)}>
      <div className="flex items-start justify-between gap-4 mb-5 border-b border-border pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-1 mono">
            Section {number}
          </div>
          <h2 className="text-lg md:text-xl font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 no-print">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
