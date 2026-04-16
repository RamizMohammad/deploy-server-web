import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Lock, Globe, GitBranch, Loader2, Rocket } from "lucide-react";
import { api, type GithubRepo } from "@/lib/api";
import { toast } from "sonner";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";

const REPO_BATCH_SIZE = 10;
const REPO_PRELOAD_OFFSET = 3; // Trigger around item 7/8 in a 10-item batch
const REPO_CACHE_KEY = "launchly:github_repos:first_page:v1";

function readCachedFirstPage(): GithubRepo[] {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GithubRepo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedFirstPage(repos: GithubRepo[]) {
  try {
    localStorage.setItem(REPO_CACHE_KEY, JSON.stringify(repos.slice(0, REPO_BATCH_SIZE)));
  } catch {
    // no-op
  }
}

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [deployingRepoId, setDeployingRepoId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const preloadTriggerRef = useRef<HTMLDivElement | null>(null);
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
      api.get<GithubRepo[]>(
        `/auth/github/repos?page=${pageParam}&per_page=${REPO_BATCH_SIZE}`,
        { signal }
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === REPO_BATCH_SIZE ? allPages.length + 1 : undefined,
    initialData:
      cachedFirstPage.length > 0
        ? { pageParams: [1], pages: [cachedFirstPage] }
        : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const repos = useMemo(() => {
    const flattened = data?.pages.flat() ?? [];
    const seen = new Set<number>();
    const unique: GithubRepo[] = [];
    for (const repo of flattened) {
      if (seen.has(repo.id)) continue;
      seen.add(repo.id);
      unique.push(repo);
    }
    return unique;
  }, [data]);

  useEffect(() => {
    if (repos.length > 0) {
      writeCachedFirstPage(repos);
    }
  }, [repos]);

  const filtered = useMemo(
    () => repos.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase())
    ),
    [repos, search]
  );

  const preloadIndex = Math.max(filtered.length - REPO_PRELOAD_OFFSET, 0);

  useEffect(() => {
    const node = preloadTriggerRef.current;
    const root = listContainerRef.current;
    if (!node || !root || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        void fetchNextPage();
      },
      {
        root,
        threshold: 0.6,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, filtered.length, hasNextPage, isFetchingNextPage]);

  const deployRepo = async (repo: GithubRepo) => {
    try {
      setDeployingRepoId(repo.id);
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
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate("/app/projects")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Import Project</h1>
        <p className="text-muted-foreground mb-8">Select a repository and start a real deployment.</p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search repositories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
        </div>

        {isLoading ? (
          <div className="glass rounded-xl p-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading repositories...</p>
          </div>
        ) : isError ? (
          <div className="glass rounded-xl p-10 text-center">
            <Rocket className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              {(error as Error)?.message || "Failed to load repositories."}
            </p>
            <Button onClick={() => refetch()} className="bg-foreground text-background hover:bg-foreground/90">
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center">
            <Rocket className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No repositories found. Connect GitHub or adjust search.</p>
          </div>
        ) : (
          <div ref={listContainerRef} className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map((repo, index) => (
              <div
                key={repo.id}
                ref={index === preloadIndex ? preloadTriggerRef : null}
                className="w-full glass-hover rounded-xl px-5 py-4 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">{repo.name}</span>
                        {repo.private ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Globe className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{repo.description || "No description"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">{repo.default_branch || "main"}</span>
                    <Button
                      size="sm"
                      onClick={() => deployRepo(repo)}
                      disabled={deployingRepoId === repo.id}
                      className="bg-foreground text-background hover:bg-foreground/90"
                    >
                      {deployingRepoId === repo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {isFetchingNextPage && (
              <div className="py-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading more repositories...
              </div>
            )}

            {!hasNextPage && repos.length > 0 && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                You have reached the end of your repositories.
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
