import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { api, getToken, type GithubRepo } from "@/lib/api";
import { queryClient, queryKeys } from "@/lib/query";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardOverview from "./pages/app/DashboardOverview";
import ProjectsList from "./pages/app/ProjectsList";
import ProjectDetailPage from "./pages/app/ProjectDetailPage";
import NewProjectPage from "./pages/app/NewProjectPage";
import DomainsPage from "./pages/app/DomainsPage";
import LogsPage from "./pages/app/LogsPage";
import SettingsPage from "./pages/app/SettingsPage";
import NotFound from "./pages/NotFound";

const REPO_BATCH_SIZE = 10;
const REPO_CACHE_KEY = "launchly:github_repos:first_page:v1";
const REPO_CACHE_MAX_AGE_MS = 5 * 60 * 1000;

function hasFreshRepoCache(): boolean {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { repos?: GithubRepo[]; updatedAt?: number } | GithubRepo[];
    if (Array.isArray(parsed)) return parsed.length > 0;
    if (!Array.isArray(parsed?.repos) || parsed.repos.length === 0) return false;
    if (typeof parsed.updatedAt !== "number") return false;
    return Date.now() - parsed.updatedAt < REPO_CACHE_MAX_AGE_MS;
  } catch {
    return false;
  }
}

const App = () => {
  useEffect(() => {
    if (!getToken()) return;
    if (hasFreshRepoCache()) return;
    queryClient.prefetchInfiniteQuery({
      queryKey: [...queryKeys.githubRepos, "infinite", REPO_BATCH_SIZE],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        api.get<GithubRepo[]>(`/auth/github/repos?page=${pageParam}&per_page=${REPO_BATCH_SIZE}`),
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === REPO_BATCH_SIZE ? allPages.length + 1 : undefined,
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    });
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="new" element={<NewProjectPage />} />
            <Route path="domains" element={<DomainsPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
