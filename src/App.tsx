import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { type InfiniteData } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Checking your session...</p>
    </div>
  </div>
);

const EntryRoute = () => {
  const [authState, setAuthState] = useState<"checking" | "signed-in" | "signed-out">("checking");

  useEffect(() => {
    setAuthState(getToken() ? "signed-in" : "signed-out");
  }, []);

  if (authState === "checking") {
    return <AuthCheckingScreen />;
  }

  return authState === "signed-in" ? <Navigate to="/app" replace /> : <LandingPage />;
};

const App = () => {
  useEffect(() => {
    if (!getToken()) {
      return;
    }

    const reposKey = [...queryKeys.githubRepos, "infinite", REPO_BATCH_SIZE] as const;
    let cancelled = false;

    const warmAllRepoPages = async () => {
      let page = 1;
      const cached = queryClient.getQueryData<InfiniteData<GithubRepo[]>>(reposKey);
      const pages = cached?.pages ? [...cached.pages] : [];

      if (pages.length > 0) {
        page = pages.length + 1;
      }

      while (!cancelled) {
        let batch: GithubRepo[] = [];
        try {
          batch = await api.get<GithubRepo[]>(
            `/auth/github/repos?page=${page}&per_page=${REPO_BATCH_SIZE}`
          );
        } catch {
          break;
        }
        if (cancelled) return;

        if (page === 1) {
          persistFirstRepoBatch(batch);
        }

        if (batch.length === 0) {
          break;
        }

        if (pages.length < page) {
          pages.push(batch);
        } else {
          pages[page - 1] = batch;
        }

        queryClient.setQueryData(reposKey, {
          pageParams: pages.map((_, index) => index + 1),
          pages,
        });

        if (batch.length < REPO_BATCH_SIZE) {
          break;
        }

        page += 1;
      }
    };

    void warmAllRepoPages();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EntryRoute />} />
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
