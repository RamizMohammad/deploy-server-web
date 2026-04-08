import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@/components/DashboardLayout";
import { isAuthenticated } from "@/lib/api";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import CreateProjectPage from "@/pages/CreateProjectPage";
import DashboardPage from "@/pages/DashboardPage";
import DeploymentsPage from "@/pages/DeploymentsPage";
import DomainsPage from "@/pages/DomainsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";
import ProjectsPage from "@/pages/ProjectsPage";
import SettingsPage from "@/pages/SettingsPage";

function ProtectedLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function PublicLoginRoute() {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicLoginRoute />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/deployments" element={<DeploymentsPage />} />
          <Route path="/domains" element={<DomainsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
