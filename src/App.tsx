import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { projectsQueryOptions } from "@/lib/query";
import { useQuery } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
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
