import { QueryClient, keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api, type AuthUser, type Deployment, type DeploymentLogsResponse, type GithubRepo, type Project } from "@/lib/api";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;
const PROJECTS_CACHE_KEY = "launchly:projects:v1";
const DEPLOYMENTS_CACHE_KEY = "launchly:deployments:v1";

type PersistedQueryData<T> = {
  data: T;
  updatedAt: number;
};

function readPersistedQueryData<T>(key: string): PersistedQueryData<T> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as PersistedQueryData<T>;
    if (typeof parsed?.updatedAt !== "number" || parsed.data === undefined) {
      return undefined;
    }

    return parsed;
  } catch {
    return undefined;
  }
}

function persistQueryData<T>(key: string, data: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        data,
        updatedAt: Date.now(),
      } satisfies PersistedQueryData<T>)
    );
  } catch {
    // Ignore storage failures and keep the network path working.
  }
}

function clearPersistedQueryData(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: FIVE_MINUTES_MS,
      gcTime: 10 * ONE_MINUTE_MS,
    },
  },
});

export const queryKeys = {
  authMe: ["auth", "me"] as const,
  githubRepos: ["github", "repos"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  deployments: ["deployments"] as const,
  deploymentLogs: (deploymentId: string) => ["deployments", deploymentId, "logs"] as const,
};

export const authMeQueryOptions = queryOptions({
  queryKey: queryKeys.authMe,
  queryFn: () => api.get<AuthUser>("/auth/me"),
  staleTime: FIVE_MINUTES_MS,
});

queryClient.getQueryCache().subscribe((event) => {
  const query = event?.query;
  if (!query) {
    return;
  }

  const key = query.queryKey;
  const state = query.state;

  if (JSON.stringify(key) === JSON.stringify(queryKeys.projects)) {
    if (Array.isArray(state.data)) {
      persistQueryData(PROJECTS_CACHE_KEY, state.data as Project[]);
    } else if (state.status === "error") {
      clearPersistedQueryData(PROJECTS_CACHE_KEY);
    }
  }

  if (JSON.stringify(key) === JSON.stringify(queryKeys.deployments)) {
    if (Array.isArray(state.data)) {
      persistQueryData(DEPLOYMENTS_CACHE_KEY, state.data as Deployment[]);
    } else if (state.status === "error") {
      clearPersistedQueryData(DEPLOYMENTS_CACHE_KEY);
    }
  }
});

export const githubReposQueryOptions = queryOptions({
  queryKey: queryKeys.githubRepos,
  queryFn: () => api.get<GithubRepo[]>("/auth/github/repos"),
  staleTime: FIVE_MINUTES_MS,
  gcTime: 15 * ONE_MINUTE_MS,
  placeholderData: keepPreviousData,
});

export const projectsQueryOptions = queryOptions({
  queryKey: queryKeys.projects,
  queryFn: () => api.get<Project[]>("/projects"),
  staleTime: FIVE_MINUTES_MS,
  initialData: () => readPersistedQueryData<Project[]>(PROJECTS_CACHE_KEY)?.data,
  initialDataUpdatedAt: () => readPersistedQueryData<Project[]>(PROJECTS_CACHE_KEY)?.updatedAt,
  placeholderData: keepPreviousData,
});

export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.project(id),
    queryFn: () => api.get<Project>(`/projects/${id}`),
    staleTime: FIVE_MINUTES_MS,
  });

export const deploymentsQueryOptions = queryOptions({
  queryKey: queryKeys.deployments,
  queryFn: () => api.get<Deployment[]>("/deployments"),
  staleTime: FIVE_MINUTES_MS,
  initialData: () => readPersistedQueryData<Deployment[]>(DEPLOYMENTS_CACHE_KEY)?.data,
  initialDataUpdatedAt: () => readPersistedQueryData<Deployment[]>(DEPLOYMENTS_CACHE_KEY)?.updatedAt,
  placeholderData: keepPreviousData,
});

export const deploymentLogsQueryOptions = (deploymentId: string) =>
  queryOptions({
    queryKey: queryKeys.deploymentLogs(deploymentId),
    queryFn: () => api.get<DeploymentLogsResponse>(`/deployments/${deploymentId}/logs`),
    staleTime: FIVE_MINUTES_MS,
  });
