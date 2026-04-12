import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { api, type Deployment } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Rocket, LayoutDashboard, FolderGit2, Settings, LogOut, ArrowLeft, RotateCcw, Terminal, Clock, GitBranch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] || styles.queued}`}>{status}</span>;
};

const DashboardSidebar = () => {
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
          <button key={l.id} onClick={() => navigate(l.path)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
            <l.icon className="h-4 w-4" />{l.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border/30">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4" />Logout
        </button>
      </div>
    </aside>
  );
};

const LogViewer = ({ logs }: { logs: string[] }) => (
  <div className="glass rounded-xl overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
      <div className="w-3 h-3 rounded-full bg-destructive/60" />
      <div className="w-3 h-3 rounded-full bg-warning/60" />
      <div className="w-3 h-3 rounded-full bg-success/60" />
      <span className="ml-2 text-xs text-muted-foreground font-mono">Build Logs</span>
    </div>
    <div className="terminal-bg p-4 max-h-80 overflow-y-auto space-y-1">
      {logs.length > 0 ? (
        logs.map((line, i) => (
          <p key={i} className="text-sm font-mono text-muted-foreground">
            <span className="text-muted-foreground/50 mr-3 select-none">{String(i + 1).padStart(3, " ")}</span>
            {line}
          </p>
        ))
      ) : (
        <p className="text-sm text-muted-foreground/50 font-mono">No logs available. Deploy to see build output.</p>
      )}
    </div>
  </div>
);

const ProjectDetails = () => {
  const { "*": repoPath } = useParams();
  const navigate = useNavigate();
  const [deploying, setDeploying] = useState(false);

  const { data: deployments, isLoading } = useQuery({
    queryKey: ["project-deployments", repoPath],
    queryFn: () => api.get<Deployment[]>(`/deployments?project=${repoPath}`),
  });

  const handleRedeploy = async () => {
    setDeploying(true);
    try {
      await api.post("/deploy", { repo: repoPath, branch: "main" });
      toast.success("Redeployment started!");
    } catch {
      toast.error("Redeployment failed.");
    } finally {
      setDeploying(false);
    }
  };

  const repoName = repoPath?.split("/").pop() || "Project";

  const sampleLogs = [
    "$ deployx build",
    "Cloning repository...",
    "Installing dependencies...",
    "npm install completed in 4.2s",
    "Building project...",
    "Build completed successfully",
    "Deploying to edge network...",
    "✓ Deployment live",
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-64 p-8">
        <button onClick={() => navigate("/projects")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{repoName}</h1>
            <p className="text-sm text-muted-foreground font-mono">{repoPath}</p>
          </div>
          <Button onClick={handleRedeploy} disabled={deploying} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {deploying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
            Redeploy
          </Button>
        </div>

        {/* Deployment History */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Deployment History
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Branch</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Commit</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Time</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-5 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                ) : deployments && deployments.length > 0 ? (
                  deployments.map((d) => (
                    <tr key={d.id} className="border-b border-border/10 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-5 py-3 text-sm text-muted-foreground flex items-center gap-1"><GitBranch className="h-3 w-3" />{d.branch || "main"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{d.commit_message || "—"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{d.duration ? `${d.duration}s` : "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No deployments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logs */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Terminal className="h-4 w-4" /> Build Logs
          </h2>
          <LogViewer logs={sampleLogs} />
        </div>

        {/* Env vars */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Environment Variables</h2>
          <div className="glass rounded-xl p-6">
            <div className="space-y-3">
              {[
                { key: "NODE_ENV", value: "production" },
                { key: "API_URL", value: "••••••••" },
              ].map((env) => (
                <div key={env.key} className="flex items-center gap-4 text-sm">
                  <code className="text-primary font-mono bg-primary/5 px-2 py-1 rounded">{env.key}</code>
                  <span className="text-muted-foreground font-mono">{env.value}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 border-border hover:bg-secondary">
              Add Variable
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
