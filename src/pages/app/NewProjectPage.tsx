import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Search, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type GithubRepo } from "@/lib/api";
import { useDelayedSkeleton } from "@/hooks/useDelayedSkeleton";
import { usePaginatedRepos } from "@/hooks/usePaginatedRepos";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import {
  filterRepos,
  getRepoCounts,
  getRepoEmptyStateCopy,
  isOwnedRepo,
  type RepoOwnershipFilter,
  type RepoVisibilityFilter,
} from "@/lib/github-repos";
import { createRepoDeployPayload } from "@/lib/deploy";
import { cn } from "@/lib/utils";
import { EmptyState, PageFrame, PageHeader, RepoCard, RepoFilterTabs, SkeletonPanel, Stepper, SurfaceCard } from "@/components/platform/PlatformUI";

const importSteps = ["Select Repo", "Detect", "Configure", "Env", "Deploy"];

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [deployingRepoId, setDeployingRepoId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [repoOwnership, setRepoOwnership] = useState<RepoOwnershipFilter>("owned");
  const [repoVisibility, setRepoVisibility] = useState<RepoVisibilityFilter>("public");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();

  const {
    data,
    repos,
    currentUsername,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = usePaginatedRepos({ enabled: true });
  const waitingForRepos = isLoading && !data;
  const showSkeleton = useDelayedSkeleton(isLoading && !data, Boolean(data));

  useEffect(() => {
    if (!selectedRepo) return;
    setCurrentStep(0);
    const timers = [
      window.setTimeout(() => setCurrentStep(1), 260),
      window.setTimeout(() => setCurrentStep(2), 760),
      window.setTimeout(() => setCurrentStep(3), 1180),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [selectedRepo]);

  const repoCounts = useMemo(() => getRepoCounts(repos, currentUsername), [repos, currentUsername]);
  const filtered = useMemo(
    () => filterRepos(repos, search, repoOwnership, repoVisibility, currentUsername),
    [repos, search, repoOwnership, repoVisibility, currentUsername]
  );
  const repoEmptyState = getRepoEmptyStateCopy(repoOwnership, repoVisibility, search);

  const resetRepoFilters = () => {
    setSearch("");
    setRepoOwnership("owned");
    setRepoVisibility("public");
  };

  const deployRepo = async (repo: GithubRepo) => {
    try {
      setSelectedRepo(repo);
      setDeployingRepoId(repo.id);
      setCurrentStep(4);
      await api.post("/deploy", createRepoDeployPayload(repo));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
        queryClient.invalidateQueries({ queryKey: queryKeys.deployments }),
      ]);
      toast.success(`Deployment started for ${repo.name}`);
      navigate("/app/projects");
    } catch {
      toast.error("Failed to start deployment. Please check backend logs.");
    } finally {
      setDeployingRepoId(null);
    }
  };

  return (
    <PageFrame className="max-w-6xl">
      <button onClick={() => navigate("/app/projects")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </button>

      <PageHeader
        eyebrow="Import workflow"
        title="Import Project"
        description="Choose a GitHub repository and start a production deployment."
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 border-zinc-800 bg-zinc-950/70 pl-10"
          />
        </div>
      </div>

      <div className="mb-6">
        <RepoFilterTabs
          ownership={repoOwnership}
          visibility={repoVisibility}
          counts={repoCounts}
          onOwnershipChange={setRepoOwnership}
          onVisibilityChange={setRepoVisibility}
        />
      </div>

      {selectedRepo && (
        <SurfaceCard className="mb-6 p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Preparing {selectedRepo.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">Framework detection and build settings are staged before deployment.</p>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <Stepper steps={importSteps} current={currentStep} />
          <div className="mt-5 rounded-lg border border-zinc-800 bg-black/40 p-4 font-mono text-sm">
            {["Resolving repository", "Detecting framework preset", "Checking build config", "Ready to deploy"].map((line, index) => (
              <div key={line} className={cn("flex items-center gap-2 py-1", index <= currentStep ? "text-emerald-300" : "text-zinc-600")}>
                {index <= currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Terminal className="h-3.5 w-3.5" />}
                {line}
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}

      {showSkeleton ? (
        <SkeletonPanel rows={6} />
      ) : waitingForRepos ? null : isError ? (
        <EmptyState
          title="Could not load repositories"
          description={(error as Error)?.message || "GitHub repositories could not be fetched right now."}
          action={<Button onClick={() => refetch()} className="bg-foreground text-background hover:bg-foreground/90">Retry</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={repoEmptyState.title}
          description={repoEmptyState.description}
          action={<Button onClick={resetRepoFilters} variant="outline">{repoEmptyState.actionLabel}</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((repo, index) => (
            <motion.div key={repo.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.36) }}>
              <RepoCard
                repo={repo}
                ownership={isOwnedRepo(repo, currentUsername) ? "owner" : "collaborator"}
                onImport={() => {
                  setSelectedRepo(repo);
                  void deployRepo(repo);
                }}
                actionLabel={deployingRepoId === repo.id ? "Deploying" : "Deploy"}
              />
            </motion.div>
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading
        </div>
      )}

      {hasNextPage && filtered.length > 0 && (
        <p className="mt-5 text-center text-xs text-muted-foreground">Scroll down to load more repositories.</p>
      )}
    </PageFrame>
  );
}
