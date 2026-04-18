import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Search, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type GithubRepo } from "@/lib/api";
import { toast } from "sonner";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { cn } from "@/lib/utils";
import { EmptyState, PageFrame, PageHeader, RepoCard, SkeletonPanel, Stepper, SurfaceCard } from "@/components/platform/PlatformUI";

const REPO_BATCH_SIZE = 10;
const REPO_CACHE_KEY = "launchly:github_repos:first_page:v1";
const importSteps = ["Select Repo", "Detect", "Configure", "Env", "Deploy"];

function readCachedFirstPage(): GithubRepo[] {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GithubRepo[] | { repos?: GithubRepo[] };
    if (Array.isArray(parsed)) return parsed;
    return Array.isArray(parsed?.repos) ? parsed.repos : [];
  } catch {
    return [];
  }
}

function writeCachedFirstPage(repos: GithubRepo[]) {
  try {
    localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ repos: repos.slice(0, REPO_BATCH_SIZE), updatedAt: Date.now() }));
  } catch {
    // Ignore storage failures; fetching still works.
  }
}

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [deployingRepoId, setDeployingRepoId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();
  const cachedFirstPage = useMemo(() => readCachedFirstPage(), []);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.githubRepos, "infinite", REPO_BATCH_SIZE],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      api.get<GithubRepo[]>(`/auth/github/repos?page=${pageParam}&per_page=${REPO_BATCH_SIZE}`, { signal }),
    getNextPageParam: (lastPage, allPages) => (lastPage.length === REPO_BATCH_SIZE ? allPages.length + 1 : undefined),
    initialData: cachedFirstPage.length > 0 ? { pageParams: [1], pages: [cachedFirstPage] } : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const repos = useMemo(() => {
    const flattened = data?.pages.flat() ?? [];
    const seen = new Set<number>();
    return flattened.filter((repo) => {
      if (seen.has(repo.id)) return false;
      seen.add(repo.id);
      return true;
    });
  }, [data]);

  useEffect(() => {
    if (repos.length > 0) writeCachedFirstPage(repos);
  }, [repos]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const id = window.setTimeout(() => {
      void fetchNextPage();
    }, 250);
    return () => window.clearTimeout(id);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, repos.length]);

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

  const filtered = useMemo(
    () => repos.filter((repo) =>
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      (repo.description || "").toLowerCase().includes(search.toLowerCase())
    ),
    [repos, search]
  );

  const deployRepo = async (repo: GithubRepo) => {
    try {
      setSelectedRepo(repo);
      setDeployingRepoId(repo.id);
      setCurrentStep(4);
      await api.post("/deploy", {
        repo_name: repo.name,
        branch: repo.default_branch || "main",
      });
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
        description="Choose a GitHub repository. Launchly keeps fetching repo batches in the background, so large accounts become usable immediately."
      />

      <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 border-zinc-800 bg-zinc-950/70 pl-10"
          />
        </div>
        <SurfaceCard className="px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">GitHub sync</span>
            <span className="text-foreground">{repos.length} repos cached</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-900">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#0ea5e9,#8b5cf6)] transition-all" style={{ width: hasNextPage || isFetchingNextPage ? "70%" : "100%" }} />
          </div>
        </SurfaceCard>
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

      {isLoading ? (
        <SkeletonPanel rows={6} />
      ) : isError ? (
        <EmptyState
          title="Could not load repositories"
          description={(error as Error)?.message || "GitHub repositories could not be fetched right now."}
          action={<Button onClick={() => refetch()} className="bg-foreground text-background hover:bg-foreground/90">Retry</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No repositories found"
          description="Connect GitHub, wait for the background sync, or adjust your search query."
          action={<Button onClick={() => setSearch("")} variant="outline">Clear search</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((repo, index) => (
            <motion.div key={repo.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.36) }}>
              <RepoCard
                repo={repo}
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
        <SurfaceCard className="mt-5 p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Fetching another batch of 10 repositories...
          </div>
        </SurfaceCard>
      )}
    </PageFrame>
  );
}
