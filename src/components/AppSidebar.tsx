import { NavLink } from "@/components/NavLink";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { FolderGit2, Globe, LayoutDashboard, LogOut, Rocket, ScrollText, Search, Settings, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { title: "Overview", url: "/app", icon: LayoutDashboard },
  { title: "Projects", url: "/app/projects", icon: FolderGit2 },
  { title: "Domains", url: "/app/domains", icon: Globe },
  { title: "Logs", url: "/app/logs", icon: ScrollText },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

interface AppSidebarProps {
  onOpenCommandPalette: () => void;
}

export function AppSidebar({ onOpenCommandPalette }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-800/70 bg-[#080B10]/90 backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800/70 px-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_rgba(14,165,233,0.18)]">
          <Rocket className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block font-bold tracking-tight text-foreground">Launchly</span>
            <span className="block text-[11px] text-muted-foreground">Cloud control plane</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pt-4">
          <button
            onClick={() => onOpenCommandPalette()}
            className="flex w-full items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/70 px-3 py-2.5 text-sm text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="rounded border border-zinc-800 bg-black/40 px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
          </button>
        </div>
      )}

      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/app"}
                      className="rounded-lg text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
                      activeClassName="border border-primary/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(139,92,246,0.13))] text-foreground shadow-[0_12px_40px_rgba(14,165,233,0.08)]"
                    >
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

      <SidebarFooter className="border-t border-zinc-800/70 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Production workspace
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground/70">Repos warm in the background.</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign Out"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
