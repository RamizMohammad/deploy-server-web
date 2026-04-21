import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, CheckCircle2, FolderGit2, Globe2, Plus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useDelayedSkeleton } from "@/hooks/useDelayedSkeleton";
import { deploymentsQueryOptions, projectsQueryOptions } from "@/lib/query";
import {
  DeploymentItem,
  EmptyState,
  MetricCard,
  PageFrame,
  PageHeader,
  SkeletonPanel,
  StatusBadge,
  SurfaceCard,
} from "@/components/platform/PlatformUI";

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { data: projects, isLoading: projectsLoading } = useQuery(projectsQueryOptions);
  const { data: deployments, isLoading: deploymentsLoading } = useQuery(deploymentsQueryOptions);
  const projectsList = projects ?? [];
  const deploymentsList = deployments ?? [];
  const waitingForInitialData = (projectsLoading && !projects) || (deploymentsLoading && !deployments);
  const showSkeleton = useDelayedSkeleton(
    waitingForInitialData,
    Boolean(projects && deployments)
  );

  const projectStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const deployment of deploymentsList) {
      if (!map.has(deployment.project_name)) {
        map.set(deployment.project_name, deployment.status === "success" ? "success" : deployment.status);
      }
    }
    return map;
  }, [deploymentsList]);

  const totalDeployments = deploymentsList.length;
  const liveCount = deploymentsList.filter((deployment) => deployment.status === "success").length;
  const failedCount = deploymentsList.filter((deployment) => deployment.status === "failed").length;
  const recentDeployments = deploymentsList.slice(0, 6);

  const stats = [
    { label: "Projects", value: projectsList.length, icon: FolderGit2, trend: projectsList.length > 0 ? "+ Ready to deploy" : "Import your first repo" },
    { label: "Total Deploys", value: totalDeployments, icon: Activity, trend: totalDeployments > 0 ? "+ Pipeline active" : "No builds yet" },
    { label: "Live", value: liveCount, icon: CheckCircle2, trend: liveCount > 0 ? "+ Healthy releases" : "Awaiting live apps" },
    { label: "Failed", value: failedCount, icon: XCircle, trend: failedCount === 0 ? "All clear" : "Needs review" },
  ];

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Control plane"
        title="Dashboard"
        description="A live overview of your projects, deployments, and release health across Launchly."
        action={
          <Button onClick={() => navigate("/app/new")} className="gap-2 rounded-lg bg-foreground text-background transition hover:scale-[1.02] hover:bg-foreground/90">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />

      {showSkeleton ? (
        <div className="grid gap-5 lg:grid-cols-4">
          <SkeletonPanel rows={2} />
          <SkeletonPanel rows={2} />
          <SkeletonPanel rows={2} />
          <SkeletonPanel rows={2} />
        </div>
      ) : waitingForInitialData ? null : (
        <>
          <div className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.32 }}
              >
                <MetricCard {...stat} />
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-foreground">Projects</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Production apps wired to your GitHub repos.</p>
                </div>
                <Button size="sm" variant="ghost" className="gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate("/app/projects")}>
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </div>

              {projectsList.length > 0 ? (
                <div className="divide-y divide-zinc-900/80">
                  {projectsList.slice(0, 5).map((project, index) => (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + index * 0.04 }}
                      onClick={() => navigate(`/app/projects/${project.id}`)}
                      className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.035]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                        <Globe2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">{project.repo_name}</p>
                        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{project.repo_url}</p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <StatusBadge status={projectStatusMap.get(project.repo_name) || "queued"} />
                        <p className="mt-1 text-xs text-muted-foreground">{project.branch || "main"}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No projects imported yet"
                    description="Connect a repository and Launchly will detect the stack, prepare the build pipeline, and start the first deployment."
                    action={<Button onClick={() => navigate("/app/new")} className="bg-foreground text-background hover:bg-foreground/90">Import from GitHub</Button>}
                  />
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard className="overflow-hidden">
              <div className="border-b border-zinc-800/80 px-5 py-4">
                <h2 className="font-semibold text-foreground">Recent Deployments</h2>
                <p className="mt-1 text-xs text-muted-foreground">Timeline of your latest builds and releases.</p>
              </div>
              {recentDeployments.length > 0 ? (
                <div>
                  {recentDeployments.map((deployment, index) => (
                    <motion.div
                      key={deployment.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + index * 0.04 }}
                    >
                      <DeploymentItem deployment={deployment} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No deployments yet"
                    description="Deployments will appear here as a timeline with live status, duration, commit metadata, and build feedback."
                    action={<Button variant="outline" onClick={() => navigate("/app/new")}>Start a deployment</Button>}
                  />
                </div>
              )}
            </SurfaceCard>
          </div>
        </>
      )}
    </PageFrame>
  );
}
