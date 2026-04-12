import { useQuery } from "@tanstack/react-query";
import { api, type GithubRepo, loginWithGithub } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Rocket, LayoutDashboard, FolderGit2, Settings, LogOut, Search, Grid3X3, List, Clock, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";

const DashboardSidebar = ({ active }: { active: string }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const links = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "projects", label: "Projects", icon: FolderGit2, path: "/projects" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border/30 bg-card/50 backdrop-blur-xl flex flex-col z-40">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border/30">
        <Rocket className="h-5 w-5 text-primary" />
        <span className="font-bold text-foreground">DeployX</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => (
          <button
            key={l.id}
            onClick={() => navigate(l.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === l.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border/30">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

const Projects = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  const { data: repos, isLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: () => api.get<GithubRepo[]>("/auth/github/repos"),
  });

  const filtered = repos?.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeploy = async (repo: GithubRepo, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post("/deploy", { repo: repo.full_name, branch: repo.default_branch });
      toast.success(`Deploying ${repo.name}...`);
    } catch {
      toast.error("Deployment failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar active="projects" />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Projects</h1>
            <p className="text-muted-foreground">All your connected repositories.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50 h-9" />
            </div>
            <div className="flex border border-border/50 rounded-lg overflow-hidden">
              <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className={view === "grid" ? "h-40 rounded-xl" : "h-16 rounded-xl"} />)}
          </div>
        ) : filtered && filtered.length > 0 ? (
          view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((repo) => (
                <div key={repo.id} onClick={() => navigate(`/projects/${repo.full_name}`)} className="glass-hover rounded-xl p-5 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{repo.name}</h3>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">{repo.description || "No description"}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />{repo.language}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                    <Button size="sm" onClick={(e) => handleDeploy(repo, e)} className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">Deploy</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((repo) => (
                <div key={repo.id} onClick={() => navigate(`/projects/${repo.full_name}`)} className="glass-hover rounded-xl px-5 py-3 cursor-pointer flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <FolderGit2 className="h-4 w-4 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{repo.name}</h3>
                      <p className="text-xs text-muted-foreground">{repo.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {repo.language && <span className="text-xs text-muted-foreground">{repo.language}</span>}
                    <Button size="sm" onClick={(e) => handleDeploy(repo, e)} className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90">Deploy</Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="glass rounded-xl p-12 text-center">
            <FolderGit2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No projects found.</p>
            <Button onClick={loginWithGithub} className="bg-primary text-primary-foreground">Connect GitHub</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
