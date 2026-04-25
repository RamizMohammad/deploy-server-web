import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api, type GithubRepo, type GithubRepoPage } from "@/lib/api";
import { authMeQueryOptions, queryKeys } from "@/lib/query";

const REPO_BATCH_SIZE = 10;
const REPO_CACHE_KEY = "launchly:github_repos:first_page:v1";
const REPO_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_REPO_PAGES = 8;
const SCROLL_THRESHOLD = 0.75;

type CachedReposPayload = {
  page?: GithubRepoPage;
  updatedAt?: number;
};

function readCachedFirstPage(): GithubRepoPage | null {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedReposPayload;
    const isFresh =
      typeof parsed?.updatedAt === "number" &&
      Date.now() - parsed.updatedAt < REPO_CACHE_TTL_MS;
    return isFresh && parsed?.page ? parsed.page : null;
  } catch {
    return null;
  }
}

function writeCachedFirstPage(page: GithubRepoPage) {
  try {
    localStorage.setItem(
      REPO_CACHE_KEY,
      JSON.stringify({
        page: {
          items: page.items.slice(0, REPO_BATCH_SIZE),
          next_cursor: page.next_cursor,
        },
        updatedAt: Date.now(),
      } satisfies CachedReposPayload)
    );
  } catch {
    // Storage failures should not break pagination.
  }
}

export function usePaginatedRepos() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const cachedFirstPage = useMemo(() => readCachedFirstPage(), []);
  const { data: currentUser } = useQuery(authMeQueryOptions);

  const query = useInfiniteQuery({
    queryKey: [...queryKeys.githubRepos, "infinite", REPO_BATCH_SIZE],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      api.get<GithubRepoPage>(
        `/auth/github/repos?per_page=${REPO_BATCH_SIZE}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ""}`,
        { signal }
      ),
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length >= MAX_REPO_PAGES) {
        return undefined;
      }
      return lastPage.next_cursor ?? undefined;
    },
    initialData: cachedFirstPage ? { pageParams: [null], pages: [cachedFirstPage] } : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const repos = useMemo(() => {
    const flattened = query.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<number>();
    const unique = flattened.filter((repo) => {
      if (seen.has(repo.id)) return false;
      seen.add(repo.id);
      return true;
    });
    return unique;
  }, [query.data]);

  useEffect(() => {
    const firstPage = query.data?.pages[0];
    if (firstPage && firstPage.items.length > 0) {
      writeCachedFirstPage(firstPage);
    }
  }, [query.data]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !query.hasNextPage || query.isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || query.isFetchingNextPage || !query.hasNextPage) {
          return;
        }
        void query.fetchNextPage();
      },
      {
        threshold: SCROLL_THRESHOLD,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage, repos.length]);

  return {
    ...query,
    repos,
    currentUsername: currentUser?.github_username,
    sentinelRef,
    maxPagesReached: (query.data?.pages.length ?? 0) >= MAX_REPO_PAGES,
  };
}
