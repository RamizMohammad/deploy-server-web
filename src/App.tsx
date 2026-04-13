import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { AppLayout } from "./components/AppLayout";
import DashboardOverview from "./pages/app/DashboardOverview";
import ProjectsList from "./pages/app/ProjectsList";
import ProjectDetailPage from "./pages/app/ProjectDetailPage";
import NewProjectPage from "./pages/app/NewProjectPage";
import DomainsPage from "./pages/app/DomainsPage";
import LogsPage from "./pages/app/LogsPage";
import SettingsPage from "./pages/app/SettingsPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<AppLayout />}>
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

export default App;
