import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDelayedSkeleton } from "@/hooks/useDelayedSkeleton";
import { deploymentLogsQueryOptions, deploymentsQueryOptions } from "@/lib/query";
import { useQuery } from "@tanstack/react-query";
import { DeploymentItem, EmptyState, LogViewer, PageFrame, PageHeader, SkeletonPanel, StatusBadge, SurfaceCard } from "@/components/platform/PlatformUI";

export default function LogsPage() {
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null);
  const { data: deployments, isLoading } = useQuery(deploymentsQueryOptions);
  const deploymentsList = deployments ?? [];
  const waitingForDeployments = isLoading && !deployments;
  const showDeploymentsSkeleton = useDelayedSkeleton(isLoading && !deployments, Boolean(deployments));

  useEffect(() => {
    if (!activeDeploymentId && deploymentsList.length > 0) {
      setActiveDeploymentId(deploymentsList[0].id);
    }
  }, [activeDeploymentId, deploymentsList]);

  const activeDeployment = deploymentsList.find((deployment) => deployment.id === activeDeploymentId) || null;

  const { data: activeLogsResponse, isLoading: logsLoading, refetch } = useQuery({
    ...deploymentLogsQueryOptions(activeDeploymentId ?? ""),
    enabled: Boolean(activeDeploymentId),
  });
  const waitingForLogs = Boolean(activeDeploymentId) && logsLoading && !activeLogsResponse;
  const showLogsSkeleton = useDelayedSkeleton(
    waitingForLogs,
    Boolean(activeLogsResponse)
  );

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Observability"
        title="Logs"
        description="Inspect build output across deployments with terminal-style streaming feedback and status context."
      />

      {showDeploymentsSkeleton ? (
        <SkeletonPanel rows={6} />
      ) : waitingForDeployments ? null : deploymentsList.length === 0 ? (
        <EmptyState
          title="No deployment logs yet"
          description="Deploy a project and Launchly will stream build logs, warnings, and success events here."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <SurfaceCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
              <div>
                <h2 className="font-semibold text-foreground">Deployments</h2>
                <p className="mt-1 text-xs text-muted-foreground">Select a build to inspect logs.</p>
              </div>
              <ScrollText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {deploymentsList.map((deployment, index) => (
                <motion.div key={deployment.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}>
                  <div className={activeDeploymentId === deployment.id ? "bg-white/[0.035]" : ""}>
                    <DeploymentItem deployment={deployment} onClick={() => setActiveDeploymentId(deployment.id)} />
                  </div>
                </motion.div>
              ))}
            </div>
          </SurfaceCard>

          <div className="space-y-4">
            {showLogsSkeleton ? (
              <SkeletonPanel rows={5} />
            ) : waitingForLogs ? null : (
              <LogViewer
                title={activeDeploymentId ? `deployment/${activeDeploymentId}` : "deployment/logs"}
                logs={activeLogsResponse?.logs || ""}
                streaming={activeDeployment?.status === "building"}
                status={activeDeployment?.status}
              />
            )}
            {activeDeployment && (
              <SurfaceCard className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-4">
                    <StatusBadge status={activeDeployment.status} />
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(activeDeployment.created_at).toLocaleString()}</span>
                    <span className="font-mono">{activeDeployment.commit_hash || "n/a"}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>Refresh logs</Button>
                </div>
              </SurfaceCard>
            )}
          </div>
        </div>
      )}
    </PageFrame>
  );
}
