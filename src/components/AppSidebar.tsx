import { useNavigate, useLocation } from "react-router-dom";
import { useDeploymentStore } from "@/stores/deploymentStore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { Rocket, LayoutDashboard, FolderGit2, Globe, ScrollText, Settings, LogOut, Search } from "lucide-react";

const navItems = [
  { title: "Overview", url: "/app", icon: LayoutDashboard },
  { title: "Projects", url: "/app/projects", icon: FolderGit2 },
  { title: "Domains", url: "/app/domains", icon: Globe },
  { title: "Logs", url: "/app/logs", icon: ScrollText },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { setCommandPaletteOpen } = useDeploymentStore();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border/30">
        <Rocket className="h-5 w-5 text-primary shrink-0" />
        {!collapsed && <span className="font-bold text-foreground tracking-tight">Launchly</span>}
      </div>

      {!collapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground bg-secondary/50 border border-border/30 hover:border-border/60 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded border border-border/30 font-mono">⌘K</kbd>
          </button>
        </div>
      )}

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/app"} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 p-3">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign Out"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
