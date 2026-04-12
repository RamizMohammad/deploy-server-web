import { useQuery } from "@tanstack/react-query";
import { api, type GithubRepo, type Deployment, loginWithGithub } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Rocket, LayoutDashboard, FolderGit2, Settings, LogOut, Loader2, GitBranch, Clock, ArrowUpRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    success: "bg-success/10 text-success border-success/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    building: "bg-warning/10 text-warning border-warning/20",
    queued: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] || styles.queued}`}>
      {status}
    </span>
  );
};

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
              active === l.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border/30">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

const StatsCard = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) => (
  <div className="glass-hover rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </div>
);

const RepoCard = ({ repo }: { repo: GithubRepo }) => {
  const [deploying, setDeploying] = useState(false);
  const navigate = useNavigate();

  const handleDeploy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeploying(true);
    try {
      await api.post("/deploy", { repo: repo.full_name, branch: repo.default_branch });
      toast.success(`Deploying ${repo.name}...`);
    } catch {
      toast.error("Deployment failed. Please try again.");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/projects/${repo.full_name}`)}
      className="glass-hover rounded-xl p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{repo.name}</h3>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
        {repo.description || "No description"}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(repo.updated_at).toLocaleDateString()}
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleDeploy}
          disabled={deploying}
          className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {deploying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Deploy"}
        </Button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [search, setSearch] = useState("");

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: () => api.get<GithubRepo[]>("/auth/github/repos"),
  });

  const { data: deployments } = useQuery({
    queryKey: ["deployments"],
    queryFn: () => api.get<Deployment[]>("/deployments"),
  });

  const filteredRepos = repos?.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar active="dashboard" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your projects and deployments.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard label="Total Projects" value={repos?.length ?? 0} icon={FolderGit2} />
          <StatsCard label="Deployments" value={deployments?.length ?? 0} icon={ArrowUpRight} />
          <StatsCard label="Successful" value={deployments?.filter((d) => d.status === "success").length ?? 0} icon={GitBranch} />
          <StatsCard label="Failed" value={deployments?.filter((d) => d.status === "failed").length ?? 0} icon={Clock} />
        </div>

        {/* Repos */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">Your Repositories</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50 h-9"
              />
            </div>
          </div>
          {reposLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : filteredRepos && filteredRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <FolderGit2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No repositories found. Connect your GitHub account to get started.</p>
              <Button onClick={loginWithGithub} className="bg-primary text-primary-foreground">Connect GitHub</Button>
            </div>
          )}
        </div>

        {/* Recent Deployments */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-5">Recent Deployments</h2>
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Project</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Branch</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {deployments && deployments.length > 0 ? (
                  deployments.slice(0, 5).map((d) => (
                    <tr key={d.id} className="border-b border-border/10 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{d.project_name}</td>
                      <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{d.branch || "main"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No deployments yet. Deploy a project to see activity here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
