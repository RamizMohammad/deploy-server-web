import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api, type GithubRepo } from "@/lib/api";
import { authMeQueryOptions, queryKeys } from "@/lib/query";
import type { RepoOwnershipFilter, RepoVisibilityFilter } from "@/lib/github-repos";

const REPO_BATCH_SIZE = 10;
const REPO_CACHE_TTL_MS = 5 * 60 * 1000;
const SCROLL_TRIGGER_THRESHOLD = 0.78;
const MIN_SCROLL_DELTA_PX = 48;
const VIEWPORT_FILL_PAGE_LIMIT = 3;

type CachedReposPayload = {
  repos?: GithubRepo[];
  updatedAt?: number;
};

function getRepoCacheKey(ownership: RepoOwnershipFilter, visibility: RepoVisibilityFilter) {
  return `launchly:github_repos:first_page:v2:${ownership}:${visibility}`;
}

function readCachedFirstPage(ownership: RepoOwnershipFilter, visibility: RepoVisibilityFilter): GithubRepo[] {
  try {
    const raw = localStorage.getItem(getRepoCacheKey(ownership, visibility));
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

function writeCachedFirstPage(
  ownership: RepoOwnershipFilter,
  visibility: RepoVisibilityFilter,
  repos: GithubRepo[]
) {
  try {
    localStorage.setItem(
      getRepoCacheKey(ownership, visibility),
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
  ownership: RepoOwnershipFilter;
  visibility: RepoVisibilityFilter;
};

export function usePaginatedRepos({ enabled, ownership, visibility }: UsePaginatedReposOptions) {
  const cachedFirstPage = useMemo(
    () => readCachedFirstPage(ownership, visibility),
    [ownership, visibility]
  );
  const requestInFlightRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const lastTriggeredScrollTopRef = useRef(0);
  const viewportFillCountRef = useRef(0);
  const { data: currentUser } = useQuery(authMeQueryOptions);

  const query = useInfiniteQuery({
    queryKey: [...queryKeys.githubRepos, "infinite", ownership, visibility, REPO_BATCH_SIZE],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      api.get<GithubRepo[]>(
        `/auth/github/repos?page=${pageParam}&per_page=${REPO_BATCH_SIZE}&ownership=${ownership}&visibility=${visibility}`,
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
      writeCachedFirstPage(ownership, visibility, repos);
    }
  }, [ownership, visibility, repos]);

  const requestNextPage = useCallback(() => {
    if (
      !enabled ||
      requestInFlightRef.current ||
      !query.hasNextPage ||
      query.isFetchingNextPage ||
      query.isLoading ||
      query.isFetching
    ) {
      return Promise.resolve();
    }

    requestInFlightRef.current = true;
    return query
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
    hasUserScrolledRef.current = false;
    lastTriggeredScrollTopRef.current = 0;
    viewportFillCountRef.current = 0;
    requestInFlightRef.current = false;
  }, [enabled, ownership, visibility]);

  useEffect(() => {
    if (
      !enabled ||
      !query.data ||
      !query.hasNextPage ||
      query.isFetchingNextPage ||
      query.isLoading ||
      query.isFetching ||
      viewportFillCountRef.current >= VIEWPORT_FILL_PAGE_LIMIT
    ) {
      return;
    }

    const doc = document.documentElement;
    const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const viewportHeight = window.innerHeight;

    if (scrollHeight > viewportHeight + 24) {
      return;
    }

    viewportFillCountRef.current += 1;
    void requestNextPage();
  }, [
    enabled,
    query.data,
    query.hasNextPage,
    query.isFetching,
    query.isFetchingNextPage,
    query.isLoading,
    requestNextPage,
    repos.length,
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
      void requestNextPage();
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
