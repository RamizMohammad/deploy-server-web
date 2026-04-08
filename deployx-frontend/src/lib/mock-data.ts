export interface Project {
  id: string;
  name: string;
  repo: string;
  status: "live" | "building" | "failed";
  lastDeployed: string;
  url: string;
  framework: string;
  branch: string;
}

export interface Deployment {
  id: string;
  projectName: string;
  status: "live" | "building" | "failed";
  timestamp: string;
  url: string;
  commit: string;
  branch: string;
  duration: string;
}

export interface Domain {
  id: string;
  domain: string;
  project: string;
  sslStatus: "active" | "pending" | "failed";
  addedAt: string;
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface GithubRepo {
  id: string;
  name: string;
  fullName: string;
  language: string;
  updatedAt: string;
  isPrivate: boolean;
}

export const mockProjects: Project[] = [
  { id: "1", name: "web-app-frontend", repo: "acme/web-app-frontend", status: "live", lastDeployed: "2 minutes ago", url: "web-app-frontend.deploy.app", framework: "React", branch: "main" },
  { id: "2", name: "api-gateway", repo: "acme/api-gateway", status: "building", lastDeployed: "5 minutes ago", url: "api-gateway.deploy.app", framework: "Node.js", branch: "main" },
  { id: "3", name: "docs-site", repo: "acme/docs-site", status: "live", lastDeployed: "1 hour ago", url: "docs-site.deploy.app", framework: "Next.js", branch: "main" },
  { id: "4", name: "admin-panel", repo: "acme/admin-panel", status: "failed", lastDeployed: "3 hours ago", url: "admin-panel.deploy.app", framework: "Vue", branch: "develop" },
  { id: "5", name: "landing-page", repo: "acme/landing-page", status: "live", lastDeployed: "1 day ago", url: "landing-page.deploy.app", framework: "Astro", branch: "main" },
  { id: "6", name: "mobile-api", repo: "acme/mobile-api", status: "live", lastDeployed: "2 days ago", url: "mobile-api.deploy.app", framework: "Express", branch: "main" },
];

export const mockDeployments: Deployment[] = [
  { id: "d1", projectName: "web-app-frontend", status: "live", timestamp: "2 min ago", url: "web-app-frontend.deploy.app", commit: "fix: update hero section", branch: "main", duration: "45s" },
  { id: "d2", projectName: "api-gateway", status: "building", timestamp: "5 min ago", url: "api-gateway.deploy.app", commit: "feat: add rate limiting", branch: "main", duration: "—" },
  { id: "d3", projectName: "admin-panel", status: "failed", timestamp: "3 hrs ago", url: "admin-panel.deploy.app", commit: "chore: upgrade deps", branch: "develop", duration: "1m 12s" },
  { id: "d4", projectName: "docs-site", status: "live", timestamp: "1 hr ago", url: "docs-site.deploy.app", commit: "docs: add API reference", branch: "main", duration: "32s" },
  { id: "d5", projectName: "landing-page", status: "live", timestamp: "1 day ago", url: "landing-page.deploy.app", commit: "style: update footer", branch: "main", duration: "28s" },
];

export const mockDomains: Domain[] = [
  { id: "dm1", domain: "app.acmecorp.com", project: "web-app-frontend", sslStatus: "active", addedAt: "2 weeks ago" },
  { id: "dm2", domain: "api.acmecorp.com", project: "api-gateway", sslStatus: "active", addedAt: "1 month ago" },
  { id: "dm3", domain: "docs.acmecorp.com", project: "docs-site", sslStatus: "pending", addedAt: "3 days ago" },
  { id: "dm4", domain: "admin.acmecorp.com", project: "admin-panel", sslStatus: "failed", addedAt: "1 week ago" },
];

export const mockGithubRepos: GithubRepo[] = [
  { id: "r1", name: "next-commerce", fullName: "acme/next-commerce", language: "TypeScript", updatedAt: "2 hours ago", isPrivate: false },
  { id: "r2", name: "react-dashboard", fullName: "acme/react-dashboard", language: "TypeScript", updatedAt: "1 day ago", isPrivate: true },
  { id: "r3", name: "express-api", fullName: "acme/express-api", language: "JavaScript", updatedAt: "3 days ago", isPrivate: false },
  { id: "r4", name: "python-ml-service", fullName: "acme/python-ml-service", language: "Python", updatedAt: "1 week ago", isPrivate: true },
  { id: "r5", name: "go-microservice", fullName: "acme/go-microservice", language: "Go", updatedAt: "2 weeks ago", isPrivate: false },
  { id: "r6", name: "vue-storefront", fullName: "acme/vue-storefront", language: "Vue", updatedAt: "3 weeks ago", isPrivate: false },
];

export const mockBuildLogs = [
  { time: "00:00", text: "Cloning repository..." },
  { time: "00:02", text: "Cloned successfully." },
  { time: "00:03", text: "Detecting framework: React (Vite)" },
  { time: "00:04", text: "Installing dependencies..." },
  { time: "00:08", text: "added 1,247 packages in 4s" },
  { time: "00:09", text: "Running build command: npm run build" },
  { time: "00:10", text: "> vite build" },
  { time: "00:12", text: "transforming (142) src/components/..." },
  { time: "00:18", text: "✓ 287 modules transformed." },
  { time: "00:20", text: "rendering chunks..." },
  { time: "00:22", text: "computing gzip size..." },
  { time: "00:24", text: "dist/index.html          0.46 kB │ gzip:  0.30 kB" },
  { time: "00:24", text: "dist/assets/index.css   14.20 kB │ gzip:  3.75 kB" },
  { time: "00:24", text: "dist/assets/index.js   189.42 kB │ gzip: 61.38 kB" },
  { time: "00:25", text: "✓ built in 15.2s" },
  { time: "00:26", text: "Uploading build output..." },
  { time: "00:30", text: "Deployment is live!" },
  { time: "00:30", text: "https://web-app-frontend.deploy.app" },
];
