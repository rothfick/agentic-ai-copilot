import { NavLink, useLocation } from "react-router-dom";
import {
  Compass,
  LayoutDashboard,
  FileStack,
  Workflow,
  Activity,
  FileBarChart,
  Anchor,
  PlayCircle,
  BookOpen,
  FileText,
  Target,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Product",
    items: [
      { title: "Overview", url: "/", icon: Compass },
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Sample Documents", url: "/samples", icon: FileStack },
      { title: "Workspace", url: "/workspace", icon: Workflow },
    ],
  },
  {
    label: "Demo",
    items: [
      { title: "Demo Walkthrough", url: "/demo", icon: PlayCircle },
    ],
  },
  {
    label: "Engineering",
    items: [
      { title: "Evals", url: "/evals", icon: Activity },
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "Architecture", url: "/architecture", icon: BookOpen },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { title: "Portfolio README", url: "/portfolio-readme", icon: FileText },
      { title: "Marcura Fit", url: "/marcura-fit", icon: Target },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className="px-4 py-5 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-secondary shadow-[var(--shadow-glow)]">
            <Anchor className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">MaritimeOps</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                AI Copilot
              </div>
            </div>
          )}
        </div>

        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "rounded-md transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <NavLink to={item.url} end={item.url === "/"} className="flex items-center gap-3">
                          <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {!collapsed && (
          <div className="mt-auto p-4">
            <div className="rounded-lg border border-border/60 bg-panel-elevated/60 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Synthetic data only
              </div>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                Portfolio demo. No real maritime data is processed.
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
