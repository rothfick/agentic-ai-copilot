import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck } from "lucide-react";

const titles: Record<string, string> = {
  "/": "Overview",
  "/dashboard": "Dashboard",
  "/samples": "Sample Documents",
  "/workspace": "Workspace",
  "/evals": "Evaluations",
  "/reports": "Reports",
  "/demo": "Demo Walkthrough",
  "/architecture": "Architecture",
  "/portfolio-readme": "Portfolio README",
  "/marcura-fit": "Marcura Fit",
};

export function TopBar() {
  const { pathname } = useLocation();
  const title =
    titles[pathname] ??
    (pathname.startsWith("/workspace") ? "Workspace" : "MaritimeOps");

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">MaritimeOps AI Copilot</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-medium text-foreground">{title}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-warning/40 bg-warning/10 text-warning"
          >
            <Sparkles className="h-3 w-3" />
            Simulation Mode
          </Badge>
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/40 bg-primary/10 text-primary"
          >
            <ShieldCheck className="h-3 w-3" />
            Portfolio Demo
          </Badge>
        </div>
      </div>
    </header>
  );
}
