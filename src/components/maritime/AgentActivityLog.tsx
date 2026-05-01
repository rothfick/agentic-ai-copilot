import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ActivityLogEntry } from "@/types/analysis";

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AgentActivityLog({ entries }: { entries: ActivityLogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div className="panel p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Agent activity</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {entries.length} event{entries.length === 1 ? "" : "s"}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 min-h-[160px] max-h-[360px] overflow-auto rounded-md border border-border bg-panel-elevated/60 p-3 mono text-xs space-y-2"
      >
        {entries.length === 0 ? (
          <div className="text-muted-foreground italic">
            Awaiting agent activity…
          </div>
        ) : (
          entries.map((e, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-muted-foreground shrink-0">
                {fmtTime(e.at)}
              </span>
              <span
                className={cn(
                  "shrink-0 px-1.5 rounded text-[10px] uppercase tracking-wider",
                  e.level === "success" &&
                    "bg-success/15 text-success",
                  e.level === "warn" &&
                    "bg-warning/15 text-warning",
                  e.level === "error" &&
                    "bg-destructive/15 text-destructive",
                  e.level === "info" &&
                    "bg-primary/15 text-primary"
                )}
              >
                {e.node.replace(/_/g, " ")}
              </span>
              <span className="text-foreground/90">{e.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
