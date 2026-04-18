import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, ExternalLink, GitBranch, Loader2, RotateCcw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deploymentLogsQueryOptions, deploymentsQueryOptions, projectQueryOptions, queryKeys } from "@/lib/query";
import {
  DeploymentItem,
  EmptyState,
  LogViewer,
  MetricCard,
  PageFrame,
  PageHeader,
  SkeletonPanel,
  StatusBadge,
  SurfaceCard,
} from "@/components/platform/PlatformUI";

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
    () => deployments.find((deployment) => deployment.id === selectedDeploymentId) || null,
    [deployments, selectedDeploymentId]
  );

  const { data: selectedLogsResponse } = useQuery({
    ...deploymentLogsQueryOptions(selectedDeploymentId ?? ""),
    enabled: Boolean(selectedDeploymentId),
  });

  const selectedLogs = selectedLogsResponse?.logs || "";

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
      <PageFrame>
        <SkeletonPanel rows={5} />
      </PageFrame>
    );
  }

  if (!project) {
    return (
      <PageFrame>
        <EmptyState
          title="Project not found"
          description="This project may have been deleted or the backend did not return it."
          action={<Button variant="outline" onClick={() => navigate("/app/projects")}>Back to Projects</Button>}
        />
      </PageFrame>
    );
  }

  const latestDeployment = deployments[0];

  return (
    <PageFrame>
      <button onClick={() => navigate("/app/projects")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Projects
      </button>

      <PageHeader
        eyebrow="Project"
        title={project.repo_name}
        description="Deployment health, build history, and logs for this production application."
        action={
          <Button onClick={handleRedeploy} disabled={deploying} className="gap-2 rounded-lg bg-foreground text-background transition hover:scale-[1.02] hover:bg-foreground/90">
            {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Redeploy
          </Button>
        }
      />

      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <MetricCard label="Status" value={latestDeployment?.status === "success" ? "Live" : latestDeployment?.status || "Idle"} icon={Server} trend="Release channel" />
        <MetricCard label="Deployments" value={deployments.length} icon={GitBranch} trend="Build history" />
        <MetricCard label="Duration" value={latestDeployment?.duration ? `${latestDeployment.duration}s` : "-"} icon={Clock} trend="Latest run" />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-11 border border-zinc-800/80 bg-zinc-950/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Overview</TabsTrigger>
          <TabsTrigger value="deployments" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Deployments</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <SurfaceCard className="p-6">
              <h3 className="font-semibold text-foreground">Project Info</h3>
              <div className="mt-5 space-y-4 text-sm">
                <InfoRow label="Repository" value={project.repo_name} mono />
                <InfoRow label="Branch" value={project.branch || "main"} mono />
                <InfoRow label="Created" value={new Date(project.created_at).toLocaleString()} />
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Source</span>
                  <span className="max-w-[70%] truncate font-mono text-xs text-foreground">{project.repo_url}</span>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <h3 className="font-semibold text-foreground">Latest Deployment</h3>
              {latestDeployment ? (
                <div className="mt-5 space-y-4 text-sm">
                  <InfoRow label="Status" value={<StatusBadge status={latestDeployment.status} />} />
                  <InfoRow label="Branch" value={latestDeployment.branch || "main"} mono />
                  <InfoRow label="Commit" value={latestDeployment.commit_hash || "n/a"} mono />
                  <InfoRow label="Duration" value={latestDeployment.duration ? `${latestDeployment.duration}s` : "-"} />
                  {latestDeployment.port && (
                    <a href={`http://localhost:${latestDeployment.port}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> localhost:{latestDeployment.port}
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">No deployments yet. Trigger a redeploy to create one.</p>
              )}
            </SurfaceCard>
          </div>
        </TabsContent>

        <TabsContent value="deployments">
          <SurfaceCard className="overflow-hidden">
            {deployments.length > 0 ? (
              deployments.map((deployment, index) => (
                <motion.div key={deployment.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
                  <DeploymentItem deployment={deployment} onClick={() => setSelectedDeploymentId(deployment.id)} />
                </motion.div>
              ))
            ) : (
              <div className="p-6">
                <EmptyState title="No deployments yet" description="Once you deploy this project, builds and releases will appear here as a timeline." />
              </div>
            )}
          </SurfaceCard>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <LogViewer title={selectedDeployment ? `deployment/${selectedDeployment.id}` : "deployment/logs"} logs={selectedLogs} />
          {selectedDeployment && (
            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(selectedDeployment.created_at).toLocaleString()}</span>
              <span className="font-mono">{selectedDeployment.commit_hash || "n/a"}</span>
              <StatusBadge status={selectedDeployment.status} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageFrame>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs text-foreground" : "text-foreground"}>{value}</span>
    </div>
  );
}
