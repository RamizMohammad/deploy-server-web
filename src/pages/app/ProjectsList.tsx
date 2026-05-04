import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Code2, FolderGit2, GitBranch, Loader2, Plus, Search, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type GithubRepo } from "@/lib/api";
import { useDelayedSkeleton } from "@/hooks/useDelayedSkeleton";
import { usePaginatedRepos } from "@/hooks/usePaginatedRepos";
import { cn } from "@/lib/utils";
import {
  deploymentsQueryOptions,
  projectsQueryOptions,
  queryKeys,
} from "@/lib/query";
import {
  filterRepos,
  getRepoCounts,
  getRepoEmptyStateCopy,
  isOwnedRepo,
  type RepoOwnershipFilter,
  type RepoVisibilityFilter,
} from "@/lib/github-repos";
import { createRepoDeployPayload } from "@/lib/deploy";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  EmptyState,
  PageFrame,
  PageHeader,
  RepoCard,
  RepoFilterTabs,
  SkeletonPanel,
  StatusBadge,
  Stepper,
  SurfaceCard,
} from "@/components/platform/PlatformUI";

const importSteps = ["Select Repo", "Detect Framework", "Configure Build", "Environment", "Deploy"];

export default function ProjectsList() {
  const [activeTab, setActiveTab] = useState("projects");
  const [search, setSearch] = useState("");
  const [repoSearch, setRepoSearch] = useState("");
  const [repoOwnership, setRepoOwnership] = useState<RepoOwnershipFilter>("owned");
  const [repoVisibility, setRepoVisibility] = useState<RepoVisibilityFilter>("public");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [deployingRepoId, setDeployingRepoId] = useState<number | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery(projectsQueryOptions);
  const { data: deployments } = useQuery(deploymentsQueryOptions);
  const projectsList = projects ?? [];
  const deploymentsList = deployments ?? [];
  const waitingForProjects = projectsLoading && !projects;

  const {
    data: repoPages,
    repos,
    currentUsername,
    isLoading: reposLoading,
    isFetchingNextPage,
    hasNextPage,
    isError: reposError,
    refetch: refetchRepos,
  } = usePaginatedRepos({ enabled: activeTab === "github" });
  const waitingForRepos = activeTab === "github" && reposLoading && !repoPages;
  const showProjectsSkeleton = useDelayedSkeleton(projectsLoading && !projects, Boolean(projects));
  const showReposSkeleton = useDelayedSkeleton(activeTab === "github" && reposLoading && !repoPages, Boolean(repoPages));

  useEffect(() => {
    if (!selectedRepo) return;
    setCurrentStep(0);
    const timers = [
      window.setTimeout(() => setCurrentStep(1), 280),
      window.setTimeout(() => setCurrentStep(2), 920),
      window.setTimeout(() => setCurrentStep(3), 1380),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [selectedRepo]);

  const latestStatusByProject = useMemo(() => {
    const map = new Map<string, string>();
    for (const deployment of deploymentsList) {
      if (!map.has(deployment.project_name)) {
        map.set(deployment.project_name, deployment.status);
      }
    }
    return map;
  }, [deploymentsList]);

  const filteredProjects = projectsList.filter((project) =>
    project.repo_name.toLowerCase().includes(search.toLowerCase()) ||
    project.repo_url.toLowerCase().includes(search.toLowerCase())
  );

  const repoCounts = useMemo(() => getRepoCounts(repos, currentUsername), [repos, currentUsername]);
  const filteredRepos = useMemo(
    () => filterRepos(repos, repoSearch, repoOwnership, repoVisibility, currentUsername),
    [repos, repoSearch, repoOwnership, repoVisibility, currentUsername]
  );
  const repoEmptyState = getRepoEmptyStateCopy(repoOwnership, repoVisibility, repoSearch);

  const resetRepoFilters = () => {
    setRepoSearch("");
    setRepoOwnership("owned");
    setRepoVisibility("public");
  };

  const deployRepo = async (repo: GithubRepo) => {
    try {
      setDeployingRepoId(repo.id);
      setCurrentStep(4);
      await api.post("/deploy", createRepoDeployPayload(repo));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
        queryClient.invalidateQueries({ queryKey: queryKeys.deployments }),
      ]);
      toast.success(`Deployment started for ${repo.name}`);
      setSelectedRepo(null);
      navigate("/app/projects");
    } catch {
      toast.error("Failed to start deployment. Please check backend logs.");
    } finally {
      setDeployingRepoId(null);
    }
  };

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Projects"
        title="Deploy from GitHub"
        description="Manage production apps, import repositories, and watch deployments move through the pipeline."
        action={
          <Button onClick={() => navigate("/app/new")} className="gap-2 rounded-lg bg-foreground text-background transition hover:scale-[1.02] hover:bg-foreground/90">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-11 border border-zinc-800/80 bg-zinc-950/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <TabsTrigger value="projects" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Your Projects</TabsTrigger>
          <TabsTrigger value="github" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">Import from GitHub</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 border-zinc-800 bg-zinc-950/70 pl-9"
            />
          </div>

          {showProjectsSkeleton ? (
            <SkeletonPanel rows={5} />
          ) : waitingForProjects ? null : filteredProjects.length > 0 ? (
            <div className="grid gap-4">
              {filteredProjects.map((project, index) => (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                  className="group text-left"
                >
                  <SurfaceCard interactive className="px-6 py-5">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                          <FolderGit2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="truncate text-base font-semibold text-foreground transition group-hover:text-primary">{project.repo_name}</h3>
                            <StatusBadge status={latestStatusByProject.get(project.repo_name) || "queued"} />
                          </div>
                          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{project.repo_url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" />{project.branch || "main"}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(project.created_at).toLocaleDateString()}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </div>
                    </div>
                  </SurfaceCard>
                </motion.button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No projects found"
              description="Import a GitHub repo to create a Launchly project with deployments, logs, and production status."
              action={<Button onClick={() => navigate("/app/new")} className="bg-foreground text-background hover:bg-foreground/90">Import Project</Button>}
            />
          )}
        </TabsContent>

        <TabsContent value="github" className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={repoSearch}
                onChange={(event) => setRepoSearch(event.target.value)}
                className="h-11 border-zinc-800 bg-zinc-950/70 pl-9"
              />
            </div>
          </div>

          <RepoFilterTabs
            ownership={repoOwnership}
            visibility={repoVisibility}
            counts={repoCounts}
            onOwnershipChange={setRepoOwnership}
            onVisibilityChange={setRepoVisibility}
          />

          {showReposSkeleton ? (
            <SkeletonPanel rows={6} />
          ) : waitingForRepos ? null : reposError ? (
            <EmptyState
              title="Could not load GitHub repositories"
              description="Launchly could not reach the GitHub repo endpoint. Your existing projects are still available."
              action={<Button onClick={() => refetchRepos()} variant="outline">Retry GitHub sync</Button>}
            />
          ) : filteredRepos.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.36) }}
                >
                  <RepoCard
                    repo={repo}
                    ownership={isOwnedRepo(repo, currentUsername) ? "owner" : "collaborator"}
                    onImport={() => setSelectedRepo(repo)}
                    actionLabel="Configure"
                  />
                  <div className="mt-2 flex items-center gap-3 px-1 text-[11px] text-muted-foreground">
                    <span>{isOwnedRepo(repo, currentUsername) ? "Your repository" : "Collaboration"}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              title={repoEmptyState.title}
              description={repoEmptyState.description}
              action={<Button onClick={resetRepoFilters} variant="outline">{repoEmptyState.actionLabel}</Button>}
            />
          )}

          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading
            </div>
          )}

          {activeTab === "github" && hasNextPage && filteredRepos.length > 0 && (
            <p className="text-center text-xs text-muted-foreground">Scroll down to load more repositories.</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedRepo)} onOpenChange={(open) => !open && setSelectedRepo(null)}>
        <DialogContent className="max-w-3xl border-zinc-800 bg-[#090D13]/95 p-0 text-foreground shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
          {selectedRepo && (
            <div className="overflow-hidden rounded-lg">
              <DialogHeader className="border-b border-zinc-800/80 px-6 py-5">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Import {selectedRepo.name}
                </DialogTitle>
                <DialogDescription>Launchly will detect your framework, prepare build settings, and start the first deployment.</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 px-6 py-6">
                <Stepper steps={importSteps} current={currentStep} />

                <div className="grid gap-4 md:grid-cols-2">
                  <SurfaceCard className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary"><Code2 className="h-4 w-4" /></div>
                      <div>
                        <h3 className="font-semibold text-foreground">Framework detection</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Scanning package files and project structure.</p>
                        <p className="mt-3 text-xs text-emerald-300">Next.js / Node compatible pipeline ready</p>
                      </div>
                    </div>
                  </SurfaceCard>

                  <SurfaceCard className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300"><ShieldCheck className="h-4 w-4" /></div>
                      <div>
                        <h3 className="font-semibold text-foreground">Deployment guardrails</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Build command and env checks are staged before release.</p>
                        <p className="mt-3 text-xs text-muted-foreground">Branch: {selectedRepo.default_branch || "main"}</p>
                      </div>
                    </div>
                  </SurfaceCard>
                </div>

                <SurfaceCard className="overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-zinc-800/80 px-4 py-3 font-mono text-xs text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5" /> launchly/import-check
                  </div>
                  <div className="space-y-2 p-4 font-mono text-sm">
                    {["Resolving repository metadata", "Detecting framework preset", "Preparing build environment", "Waiting for deploy command"].map((line, index) => (
                      <div key={line} className={cn("flex items-center gap-2", index <= currentStep ? "text-emerald-300" : "text-zinc-600")}>
                        {index <= currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5" />}
                        {line}
                      </div>
                    ))}
                  </div>
                </SurfaceCard>
              </div>

              <DialogFooter className="border-t border-zinc-800/80 px-6 py-5">
                <Button variant="outline" onClick={() => setSelectedRepo(null)}>Cancel</Button>
                <Button
                  onClick={() => deployRepo(selectedRepo)}
                  disabled={deployingRepoId === selectedRepo.id}
                  className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                >
                  {deployingRepoId === selectedRepo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Deploy project
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}
