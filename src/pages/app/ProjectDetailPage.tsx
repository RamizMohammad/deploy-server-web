import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { ArrowLeft, RotateCcw, ExternalLink, GitBranch, Clock, Terminal, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deploymentLogsQueryOptions, deploymentsQueryOptions, projectQueryOptions, queryKeys } from "@/lib/query";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  success: { color: "text-success", bg: "bg-success/10 border-success/20", label: "Live" },
  building: { color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Building" },
  failed: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Failed" },
  queued: { color: "text-muted-foreground", bg: "bg-muted border-border", label: "Queued" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusConfig[status] || statusConfig.queued;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${s.bg} ${s.color}`}>
      {(status === "building" || status === "queued") && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {status === "success" && <CheckCircle2 className="h-3 w-3" />}
      {status === "failed" && <XCircle className="h-3 w-3" />}
      {s.label}
    </span>
  );
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery({
    ...projectQueryOptions(id ?? ""),
    enabled: Boolean(id),
  });

  const { data: allDeployments = [], isLoading: deploymentsLoading } = useQuery(deploymentsQueryOptions);

  const deployments = useMemo(() => {
    if (!project) return [];
    return allDeployments.filter((deployment) => deployment.project_name === project.repo_name);
  }, [allDeployments, project]);

  useEffect(() => {
    if (deployments.length === 0) {
      setSelectedDeploymentId(null);
      return;
    }

    const selectedStillExists = deployments.some((deployment) => deployment.id === selectedDeploymentId);
    if (!selectedDeploymentId || !selectedStillExists) {
      setSelectedDeploymentId(deployments[0].id);
    }
  }, [deployments, selectedDeploymentId]);

  const selectedDeployment = useMemo(
    () => deployments.find((d) => d.id === selectedDeploymentId) || null,
    [deployments, selectedDeploymentId]
  );

  const { data: selectedLogsResponse } = useQuery({
    ...deploymentLogsQueryOptions(selectedDeploymentId ?? ""),
    enabled: Boolean(selectedDeploymentId),
  });

  const selectedLogs = selectedLogsResponse?.logs || "";

  const openDeploymentLogs = (deploymentId: string) => {
    setSelectedDeploymentId(deploymentId);
  };

  const handleRedeploy = async () => {
    if (!project) return;
    setDeploying(true);
    try {
      await api.post("/deploy", {
        repo_name: project.repo_name,
        branch: project.branch || "main",
      });
      toast.success("Redeployment started");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
        queryClient.invalidateQueries({ queryKey: queryKeys.project(project.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.deployments }),
      ]);
    } catch {
      toast.error("Redeployment failed");
    } finally {
      setDeploying(false);
    }
  };

  if (!id) return null;

  if (projectLoading || deploymentsLoading) {
    return (
      <div className="p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" onClick={() => navigate("/app/projects")} className="mt-4">Back to Projects</Button>
      </div>
    );
  }

  const latestDeployment = deployments[0];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <button onClick={() => navigate("/app/projects")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Projects
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{project.repo_name}</h1>
              {latestDeployment && <StatusBadge status={latestDeployment.status} />}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{project.repo_url}</span>
              {latestDeployment?.port && (
                <a href={`http://localhost:${latestDeployment.port}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> localhost:{latestDeployment.port}
                </a>
              )}
            </div>
          </div>
          <Button onClick={handleRedeploy} disabled={deploying} className="bg-foreground text-background hover:bg-foreground/90 gap-2">
            {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Redeploy
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Project Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Repository</span><span className="text-foreground font-mono">{project.repo_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Branch</span><span className="text-foreground font-mono">{project.branch}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-foreground">{new Date(project.created_at).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Latest Deployment</h3>
                {latestDeployment ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={latestDeployment.status} /></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Branch</span><span className="text-foreground font-mono">{latestDeployment.branch || "main"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Commit</span><span className="text-foreground font-mono">{latestDeployment.commit_hash || "n/a"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="text-foreground">{latestDeployment.duration ? `${latestDeployment.duration}s` : "-"}</span></div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No deployments yet.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deployments">
            <div className="space-y-2">
              {deployments.map((d) => (
                <button key={d.id} onClick={() => openDeploymentLogs(d.id)} className="w-full glass-hover rounded-xl px-5 py-4 text-left group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={d.status} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.project_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{d.branch || "main"}</span>
                          <span className="font-mono">{d.commit_hash || "n/a"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{new Date(d.created_at).toLocaleString()}</p>
                      <p className="mt-0.5">{d.duration ? `${d.duration}s` : "-"}</p>
                    </div>
                  </div>
                </button>
              ))}
              {deployments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No deployments yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="glass rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  <Terminal className="inline h-3 w-3 mr-1" />
                  {selectedDeployment ? `Deployment ${selectedDeployment.id}` : "Logs"}
                </span>
              </div>
              <div className="terminal-bg p-4 max-h-96 overflow-y-auto space-y-1">
                {selectedLogs ? (
                  selectedLogs.split("\n").map((line, i) => (
                    <p key={`${i}-${line}`} className="text-sm font-mono text-muted-foreground">
                      <span className="text-muted-foreground/50 mr-3 select-none">{String(i + 1).padStart(3, " ")}</span>
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground/50 font-mono">No logs available.</p>
                )}
              </div>
            </div>

            {selectedDeployment && (
              <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(selectedDeployment.created_at).toLocaleString()}</span>
                <span className="font-mono">{selectedDeployment.commit_hash || "n/a"}</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
