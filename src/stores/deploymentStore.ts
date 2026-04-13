import { create } from "zustand";

export type DeploymentStatus =
  | "queued"
  | "cloning"
  | "installing"
  | "building"
  | "deploying"
  | "live"
  | "failed";

export interface DeploymentLog {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

export interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  branch: string;
  commitMessage: string;
  commitHash: string;
  createdAt: string;
  duration?: number;
  url?: string;
  logs: DeploymentLog[];
}

export interface EnvVar {
  key: string;
  value: string;
  masked: boolean;
}

export interface Domain {
  id: string;
  domain: string;
  projectId: string;
  verified: boolean;
  sslStatus: "pending" | "active";
  dnsConfigured: boolean;
}

export interface Project {
  id: string;
  name: string;
  repo: string;
  framework: string;
  language: string;
  branch: string;
  status: "live" | "building" | "failed" | "idle";
  url: string;
  deployments: Deployment[];
  envVars: EnvVar[];
  domains: Domain[];
  buildCommand: string;
  outputDir: string;
  installCommand: string;
  createdAt: string;
  updatedAt: string;
}

export interface GithubRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  languageColor: string;
  visibility: "public" | "private";
  lastCommit: string;
  updatedAt: string;
  stars: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Ruby: "#701516",
};

const MOCK_REPOS: GithubRepo[] = [
  { id: "1", name: "launchly-app", fullName: "user/launchly-app", description: "Next.js deployment platform frontend", language: "TypeScript", languageColor: LANGUAGE_COLORS.TypeScript, visibility: "public", lastCommit: "feat: add deployment pipeline UI", updatedAt: "2026-04-13T10:30:00Z", stars: 342 },
  { id: "2", name: "api-gateway", fullName: "user/api-gateway", description: "High-performance API gateway with rate limiting", language: "Go", languageColor: LANGUAGE_COLORS.Go, visibility: "private", lastCommit: "fix: connection pooling issue", updatedAt: "2026-04-12T18:00:00Z", stars: 128 },
  { id: "3", name: "ml-pipeline", fullName: "user/ml-pipeline", description: "Machine learning data processing pipeline", language: "Python", languageColor: LANGUAGE_COLORS.Python, visibility: "public", lastCommit: "chore: update dependencies", updatedAt: "2026-04-11T09:15:00Z", stars: 89 },
  { id: "4", name: "portfolio-site", fullName: "user/portfolio-site", description: "Personal portfolio with blog", language: "TypeScript", languageColor: LANGUAGE_COLORS.TypeScript, visibility: "public", lastCommit: "style: update theme colors", updatedAt: "2026-04-10T14:22:00Z", stars: 45 },
  { id: "5", name: "rust-cli", fullName: "user/rust-cli", description: "Command-line tool for cloud infrastructure management", language: "Rust", languageColor: LANGUAGE_COLORS.Rust, visibility: "public", lastCommit: "feat: add deploy command", updatedAt: "2026-04-09T20:45:00Z", stars: 567 },
  { id: "6", name: "design-system", fullName: "user/design-system", description: "Shared component library and design tokens", language: "TypeScript", languageColor: LANGUAGE_COLORS.TypeScript, visibility: "private", lastCommit: "refactor: button variants", updatedAt: "2026-04-08T11:30:00Z", stars: 23 },
  { id: "7", name: "e-commerce-api", fullName: "user/e-commerce-api", description: "RESTful API for e-commerce platform", language: "JavaScript", languageColor: LANGUAGE_COLORS.JavaScript, visibility: "public", lastCommit: "feat: add stripe webhooks", updatedAt: "2026-04-07T16:00:00Z", stars: 201 },
  { id: "8", name: "static-blog", fullName: "user/static-blog", description: "Static site generator blog with MDX support", language: "HTML", languageColor: LANGUAGE_COLORS.HTML, visibility: "public", lastCommit: "post: new article on serverless", updatedAt: "2026-04-06T08:10:00Z", stars: 78 },
];

const DEPLOY_LOGS: Record<DeploymentStatus, DeploymentLog[]> = {
  queued: [{ timestamp: "00:00", message: "Deployment queued...", type: "info" }],
  cloning: [
    { timestamp: "00:01", message: "Cloning repository...", type: "info" },
    { timestamp: "00:02", message: "$ git clone https://github.com/user/project.git", type: "info" },
    { timestamp: "00:03", message: "Receiving objects: 100% (247/247)", type: "info" },
    { timestamp: "00:04", message: "Repository cloned successfully", type: "success" },
  ],
  installing: [
    { timestamp: "00:05", message: "Installing dependencies...", type: "info" },
    { timestamp: "00:06", message: "$ npm install", type: "info" },
    { timestamp: "00:07", message: "added 1247 packages in 8.3s", type: "info" },
    { timestamp: "00:08", message: "Dependencies installed ✓", type: "success" },
  ],
  building: [
    { timestamp: "00:09", message: "Building project...", type: "info" },
    { timestamp: "00:10", message: "$ npm run build", type: "info" },
    { timestamp: "00:11", message: "Creating optimized production build...", type: "info" },
    { timestamp: "00:12", message: "Compiling TypeScript...", type: "info" },
    { timestamp: "00:13", message: "Bundling modules...", type: "info" },
    { timestamp: "00:14", message: "Optimizing assets...", type: "info" },
    { timestamp: "00:15", message: "Build completed in 12.4s ✓", type: "success" },
  ],
  deploying: [
    { timestamp: "00:16", message: "Deploying to edge network...", type: "info" },
    { timestamp: "00:17", message: "Uploading build artifacts (2.4 MB)...", type: "info" },
    { timestamp: "00:18", message: "Propagating to 34 edge locations...", type: "info" },
    { timestamp: "00:19", message: "Configuring SSL certificate...", type: "info" },
  ],
  live: [
    { timestamp: "00:20", message: "✓ Deployment successful!", type: "success" },
    { timestamp: "00:20", message: "Live at https://project-abc123.launchly.app", type: "success" },
  ],
  failed: [
    { timestamp: "00:12", message: "ERROR: Build failed", type: "error" },
    { timestamp: "00:12", message: "Module not found: '@/components/Missing'", type: "error" },
    { timestamp: "00:12", message: "Build exited with code 1", type: "error" },
  ],
};

const STATUS_SEQUENCE: DeploymentStatus[] = ["queued", "cloning", "installing", "building", "deploying", "live"];
const STATUS_TIMINGS: Record<DeploymentStatus, number> = {
  queued: 1000,
  cloning: 2000,
  installing: 2500,
  building: 3000,
  deploying: 2000,
  live: 0,
  failed: 0,
};

let deployId = 100;

interface DeploymentStore {
  projects: Project[];
  repos: GithubRepo[];
  activeDeployment: Deployment | null;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  addProject: (project: Project) => void;
  startDeployment: (projectId: string, commitMessage?: string) => void;
  setActiveDeployment: (deployment: Deployment | null) => void;
  updateEnvVar: (projectId: string, envVars: EnvVar[]) => void;
  addDomain: (projectId: string, domain: string) => void;
  verifyDomain: (projectId: string, domainId: string) => void;
}

export const useDeploymentStore = create<DeploymentStore>((set, get) => ({
  projects: [
    {
      id: "proj-1",
      name: "launchly-app",
      repo: "user/launchly-app",
      framework: "Next.js",
      language: "TypeScript",
      branch: "main",
      status: "live",
      url: "https://launchly-app.launchly.app",
      buildCommand: "npm run build",
      outputDir: ".next",
      installCommand: "npm install",
      createdAt: "2026-04-01T10:00:00Z",
      updatedAt: "2026-04-13T10:30:00Z",
      deployments: [
        {
          id: "dep-1",
          projectId: "proj-1",
          status: "live",
          branch: "main",
          commitMessage: "feat: add deployment pipeline UI",
          commitHash: "a3f8c2d",
          createdAt: "2026-04-13T10:30:00Z",
          duration: 24,
          url: "https://launchly-app-a3f8c2d.launchly.app",
          logs: [
            ...DEPLOY_LOGS.cloning,
            ...DEPLOY_LOGS.installing,
            ...DEPLOY_LOGS.building,
            ...DEPLOY_LOGS.deploying,
            ...DEPLOY_LOGS.live,
          ],
        },
        {
          id: "dep-2",
          projectId: "proj-1",
          status: "live",
          branch: "main",
          commitMessage: "fix: resolve hydration mismatch",
          commitHash: "b7e1f4a",
          createdAt: "2026-04-12T14:00:00Z",
          duration: 22,
          url: "https://launchly-app-b7e1f4a.launchly.app",
          logs: [],
        },
      ],
      envVars: [
        { key: "NODE_ENV", value: "production", masked: false },
        { key: "API_SECRET", value: "sk_live_xxxxxxxxxxxxx", masked: true },
        { key: "DATABASE_URL", value: "postgresql://...", masked: true },
      ],
      domains: [
        { id: "dom-1", domain: "launchly.dev", projectId: "proj-1", verified: true, sslStatus: "active", dnsConfigured: true },
      ],
    },
    {
      id: "proj-2",
      name: "api-gateway",
      repo: "user/api-gateway",
      framework: "Node.js",
      language: "Go",
      branch: "main",
      status: "live",
      url: "https://api-gateway.launchly.app",
      buildCommand: "go build",
      outputDir: "bin",
      installCommand: "go mod download",
      createdAt: "2026-03-20T08:00:00Z",
      updatedAt: "2026-04-12T18:00:00Z",
      deployments: [
        {
          id: "dep-3",
          projectId: "proj-2",
          status: "failed",
          branch: "main",
          commitMessage: "fix: connection pooling issue",
          commitHash: "c4d9e1b",
          createdAt: "2026-04-12T18:00:00Z",
          duration: 15,
          logs: [...DEPLOY_LOGS.cloning, ...DEPLOY_LOGS.installing, ...DEPLOY_LOGS.failed],
        },
      ],
      envVars: [{ key: "PORT", value: "8080", masked: false }],
      domains: [],
    },
  ],
  repos: MOCK_REPOS,
  activeDeployment: null,
  commandPaletteOpen: false,

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  addProject: (project) =>
    set((s) => ({ projects: [...s.projects, project] })),

  setActiveDeployment: (deployment) => set({ activeDeployment: deployment }),

  updateEnvVar: (projectId, envVars) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, envVars } : p
      ),
    })),

  addDomain: (projectId, domain) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              domains: [
                ...p.domains,
                {
                  id: `dom-${Date.now()}`,
                  domain,
                  projectId,
                  verified: false,
                  sslStatus: "pending" as const,
                  dnsConfigured: false,
                },
              ],
            }
          : p
      ),
    })),

  verifyDomain: (projectId, domainId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              domains: p.domains.map((d) =>
                d.id === domainId
                  ? { ...d, verified: true, sslStatus: "active" as const, dnsConfigured: true }
                  : d
              ),
            }
          : p
      ),
    })),

  startDeployment: (projectId, commitMessage) => {
    const newId = `dep-${++deployId}`;
    const deployment: Deployment = {
      id: newId,
      projectId,
      status: "queued",
      branch: "main",
      commitMessage: commitMessage || "Manual redeploy",
      commitHash: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      logs: [...DEPLOY_LOGS.queued],
    };

    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? { ...p, status: "building", deployments: [deployment, ...p.deployments] }
          : p
      ),
      activeDeployment: deployment,
    }));

    // Simulate deployment lifecycle
    let currentIndex = 0;
    const shouldFail = Math.random() < 0.15; // 15% chance of failure

    const advance = () => {
      currentIndex++;
      if (shouldFail && currentIndex === 4) {
        // Fail during building
        const failedDeployment: Deployment = {
          ...deployment,
          status: "failed",
          duration: 15,
          logs: [
            ...DEPLOY_LOGS.queued,
            ...DEPLOY_LOGS.cloning,
            ...DEPLOY_LOGS.installing,
            ...DEPLOY_LOGS.failed,
          ],
        };
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  status: "failed",
                  deployments: p.deployments.map((d) =>
                    d.id === newId ? failedDeployment : d
                  ),
                }
              : p
          ),
          activeDeployment: s.activeDeployment?.id === newId ? failedDeployment : s.activeDeployment,
        }));
        return;
      }

      if (currentIndex >= STATUS_SEQUENCE.length) return;

      const newStatus = STATUS_SEQUENCE[currentIndex];
      const allLogs: DeploymentLog[] = [];
      for (let i = 0; i <= currentIndex; i++) {
        allLogs.push(...DEPLOY_LOGS[STATUS_SEQUENCE[i]]);
      }

      const updated: Deployment = {
        ...deployment,
        status: newStatus,
        logs: allLogs,
        ...(newStatus === "live"
          ? {
              duration: 24,
              url: `https://${get().projects.find((p) => p.id === projectId)?.name}-${deployment.commitHash}.launchly.app`,
            }
          : {}),
      };

      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                status: newStatus === "live" ? "live" : "building",
                deployments: p.deployments.map((d) =>
                  d.id === newId ? updated : d
                ),
                ...(newStatus === "live" ? { updatedAt: new Date().toISOString() } : {}),
              }
            : p
        ),
        activeDeployment: s.activeDeployment?.id === newId ? updated : s.activeDeployment,
      }));

      if (newStatus !== "live") {
        setTimeout(advance, STATUS_TIMINGS[newStatus]);
      }
    };

    setTimeout(advance, STATUS_TIMINGS.queued);
  },
}));
