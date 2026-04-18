import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { type InfiniteData } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
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
import { PublicRoute } from "./components/PublicRoute";
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
const REPO_PAGES_CACHE_KEY = "launchly:github_repos:pages:v1";
const REPO_CACHE_TTL_MS = 5 * 60 * 1000;

type RepoPagesCache = {
  pages: GithubRepo[][];
  updatedAt: number;
};

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

function readRepoPagesCache(): RepoPagesCache | null {
  try {
    const raw = localStorage.getItem(REPO_PAGES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RepoPagesCache;
    if (!Array.isArray(parsed.pages) || typeof parsed.updatedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistRepoPages(pages: GithubRepo[][]) {
  try {
    localStorage.setItem(
      REPO_PAGES_CACHE_KEY,
      JSON.stringify({
        pages,
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
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    setTimeout(() => setChecking(false), 300); // smooth UX
  }, []);

  if (checking) {
    return <AuthCheckingScreen />;
  }

  return token ? (
    <Navigate to="/app" replace />
  ) : (
    <LandingPage />
  );
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
      const browserCache = readRepoPagesCache();
      const pages = cached?.pages
        ? [...cached.pages]
        : browserCache?.pages
          ? [...browserCache.pages]
          : [];

      if (!cached && pages.length > 0) {
        queryClient.setQueryData(reposKey, {
          pageParams: pages.map((_, index) => index + 1),
          pages,
        });
      }

      if (browserCache && pages.length > 0 && Date.now() - browserCache.updatedAt < REPO_CACHE_TTL_MS) {
        return;
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

        persistRepoPages(pages);

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
          <Route
  path="/login"
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  }
/>
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
