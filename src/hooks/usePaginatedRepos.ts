import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api, type GithubRepo } from "@/lib/api";
import { authMeQueryOptions, queryKeys } from "@/lib/query";

const REPO_BATCH_SIZE = 10;
const REPO_CACHE_KEY = "launchly:github_repos:first_page:v1";
const REPO_CACHE_TTL_MS = 5 * 60 * 1000;
const SCROLL_TRIGGER_THRESHOLD = 0.78;
const MIN_SCROLL_DELTA_PX = 48;

type CachedReposPayload = {
  repos?: GithubRepo[];
  updatedAt?: number;
};

function readCachedFirstPage(): GithubRepo[] {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CachedReposPayload | GithubRepo[];
    if (Array.isArray(parsed)) {
      return parsed.slice(0, REPO_BATCH_SIZE);
    }

    const isFresh =
      typeof parsed?.updatedAt === "number" &&
      Date.now() - parsed.updatedAt < REPO_CACHE_TTL_MS;

    return isFresh && Array.isArray(parsed?.repos)
      ? parsed.repos.slice(0, REPO_BATCH_SIZE)
      : [];
  } catch {
    return [];
  }
}

function writeCachedFirstPage(repos: GithubRepo[]) {
  try {
    localStorage.setItem(
      REPO_CACHE_KEY,
      JSON.stringify({
        repos: repos.slice(0, REPO_BATCH_SIZE),
        updatedAt: Date.now(),
      } satisfies CachedReposPayload)
    );
  } catch {
    // Storage failures should not break pagination.
  }
}

type UsePaginatedReposOptions = {
  enabled: boolean;
};

export function usePaginatedRepos({ enabled }: UsePaginatedReposOptions) {
  const cachedFirstPage = useMemo(() => readCachedFirstPage(), []);
  const requestInFlightRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const lastTriggeredScrollTopRef = useRef(0);
  const { data: currentUser } = useQuery(authMeQueryOptions);

  const query = useInfiniteQuery({
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
    enabled,
  });

  const repos = useMemo(() => {
    const flattened = query.data?.pages.flat() ?? [];
    const seen = new Set<number>();
    return flattened.filter((repo) => {
      if (seen.has(repo.id)) return false;
      seen.add(repo.id);
      return true;
    });
  }, [query.data]);

  useEffect(() => {
    if (repos.length > 0) {
      writeCachedFirstPage(repos);
    }
  }, [repos]);

  const requestNextPage = useCallback(() => {
    if (
      !enabled ||
      requestInFlightRef.current ||
      !query.hasNextPage ||
      query.isFetchingNextPage ||
      query.isLoading ||
      query.isFetching
    ) {
      return;
    }

    requestInFlightRef.current = true;
    void query
      .fetchNextPage()
      .catch(() => {
        // Query error state handles the UI.
      })
      .finally(() => {
        requestInFlightRef.current = false;
      });
  }, [
    enabled,
    query.fetchNextPage,
    query.hasNextPage,
    query.isFetching,
    query.isFetchingNextPage,
    query.isLoading,
  ]);

  useEffect(() => {
    if (!enabled) {
      hasUserScrolledRef.current = false;
      lastTriggeredScrollTopRef.current = 0;
      requestInFlightRef.current = false;
      return;
    }

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
      const viewportBottom = scrollTop + window.innerHeight;
      const scrollProgress = scrollHeight > 0 ? viewportBottom / scrollHeight : 0;

      if (scrollTop > 0) {
        hasUserScrolledRef.current = true;
      }

      if (
        !hasUserScrolledRef.current ||
        scrollProgress < SCROLL_TRIGGER_THRESHOLD ||
        scrollTop <= lastTriggeredScrollTopRef.current + MIN_SCROLL_DELTA_PX
      ) {
        return;
      }

      lastTriggeredScrollTopRef.current = scrollTop;
      requestNextPage();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, requestNextPage]);

  return {
    ...query,
    repos,
    currentUsername: currentUser?.github_username,
  };
}
