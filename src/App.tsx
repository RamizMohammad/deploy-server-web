import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { api, type GithubRepo } from "@/lib/api";
import { projectsQueryOptions, queryClient, queryKeys } from "@/lib/query";
import { type InfiniteData, useQuery } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import DashboardOverview from "./pages/app/DashboardOverview";
import DomainsPage from "./pages/app/DomainsPage";
import LogsPage from "./pages/app/LogsPage";
import NewProjectPage from "./pages/app/NewProjectPage";
import ProjectDetailPage from "./pages/app/ProjectDetailPage";
import ProjectsList from "./pages/app/ProjectsList";
import SettingsPage from "./pages/app/SettingsPage";
import AuthCallback from "./pages/AuthCallback";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const REPO_BATCH_SIZE = 10;
const REPO_CACHE_KEY = "launchly:github_repos:first_page:v1";
const REPO_CACHE_TTL_MS = 5 * 60 * 1000;

function persistFirstRepoBatch(repos: GithubRepo[]) {
  try {
    localStorage.setItem(
      REPO_CACHE_KEY,
      JSON.stringify({
        repos: repos.slice(0, REPO_BATCH_SIZE),
        updatedAt: Date.now(),
      })
    );
  } catch {
    // no-op
  }
}

const AuthCheckingScreen = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070A0F]">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%)]" />
    <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_rgba(14,165,233,0.18)]">
        <Rocket className="h-6 w-6" />
      </div>
      <p className="mt-5 text-sm font-medium text-foreground">Checking your session</p>
      <p className="mt-2 text-sm text-muted-foreground">Launchly is looking for a stored sign-in token before routing you.</p>
      <div className="mt-6 space-y-3">
        <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
          <div className="h-full w-1/2 animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
        <div className="mx-auto h-2 w-2/3 overflow-hidden rounded-full bg-zinc-900">
          <div className="h-full w-1/2 animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </div>
  </div>
);

const EntryRoute = () => {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) {
    return <AuthCheckingScreen />;
  }

  return isAuthenticated ? (
    <Navigate to="/app" replace />
  ) : (
    <LandingPage />
  );
};

const AppIndexRoute = () => {
  const { data: projects, isLoading, isError } = useQuery(projectsQueryOptions);

  if (isLoading && !projects) {
    return <AuthCheckingScreen />;
  }

  if (!isError && projects && projects.length === 0) {
    return <Navigate to="/app/projects" replace />;
  }

  return <DashboardOverview />;
};

const App = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const reposKey = [...queryKeys.githubRepos, "infinite", REPO_BATCH_SIZE] as const;
    let cancelled = false;

    const warmFirstRepoPage = async () => {
      const cached = queryClient.getQueryData<InfiniteData<GithubRepo[]>>(reposKey);
      const pages = cached?.pages ? [...cached.pages] : [];

      if (!cached && pages.length > 0) {
        queryClient.setQueryData(reposKey, {
          pageParams: pages.map((_, index) => index + 1),
          pages,
        });
      }

      const firstCachedPage = pages[0];
      if (firstCachedPage && firstCachedPage.length > 0) {
        return;
      }

      const cachedFirstBatchRaw = localStorage.getItem(REPO_CACHE_KEY);
      if (cachedFirstBatchRaw) {
        try {
          const parsed = JSON.parse(cachedFirstBatchRaw) as { repos?: GithubRepo[]; updatedAt?: number };
          if (Array.isArray(parsed.repos) && parsed.repos.length > 0 && typeof parsed.updatedAt === "number" && Date.now() - parsed.updatedAt < REPO_CACHE_TTL_MS) {
            queryClient.setQueryData(reposKey, {
              pageParams: [1],
              pages: [parsed.repos],
            });
            return;
          }
        } catch {
          // no-op
        }
      }

      try {
        const batch = await api.get<GithubRepo[]>(`/auth/github/repos?page=1&per_page=${REPO_BATCH_SIZE}`);
        if (cancelled) return;
        persistFirstRepoBatch(batch);
        queryClient.setQueryData(reposKey, {
          pageParams: [1],
          pages: [batch],
        });
      } catch {
        // Repo import should stay lazy if warm-up fails.
      }
    };

    void warmFirstRepoPage();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EntryRoute />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<AppIndexRoute />} />
            <Route path="overview" element={<DashboardOverview />} />
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
