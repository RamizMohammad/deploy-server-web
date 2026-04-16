import { QueryClient, keepPreviousData, queryOptions } from "@tanstack/react-query";
import { api, type Deployment, type DeploymentLogsResponse, type GithubRepo, type Project } from "@/lib/api";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15 * 1000,
      gcTime: 10 * ONE_MINUTE_MS,
    },
  },
});

export const queryKeys = {
  githubRepos: ["github", "repos"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  deployments: ["deployments"] as const,
  deploymentLogs: (deploymentId: string) => ["deployments", deploymentId, "logs"] as const,
};

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
  staleTime: 30 * 1000,
  placeholderData: keepPreviousData,
});

export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.project(id),
    queryFn: () => api.get<Project>(`/projects/${id}`),
    staleTime: 30 * 1000,
  });

export const deploymentsQueryOptions = queryOptions({
  queryKey: queryKeys.deployments,
  queryFn: () => api.get<Deployment[]>("/deployments"),
  staleTime: 10 * 1000,
  placeholderData: keepPreviousData,
});

export const deploymentLogsQueryOptions = (deploymentId: string) =>
  queryOptions({
    queryKey: queryKeys.deploymentLogs(deploymentId),
    queryFn: () => api.get<DeploymentLogsResponse>(`/deployments/${deploymentId}/logs`),
    staleTime: 5 * 1000,
  });
