const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "https://server.api.launchly.systems").replace(/\/$/, "");
const AUTH_TOKEN_KEY = "deployx_token";
const LEGACY_AUTH_TOKEN_KEYS = ["token"];

function readStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function readLegacyToken(): string | null {
  for (const key of LEGACY_AUTH_TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }
  return null;
}

function clearLegacyTokens() {
  for (const key of LEGACY_AUTH_TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      window.location.href = "/";
    }
    const errorBody = await res.text();
    throw new Error(errorBody || `API Error: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, options),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: "DELETE", ...options }),
};

export function getToken(): string | null {
  const token = readStoredToken();
  if (token) {
    return token;
  }

  const legacyToken = readLegacyToken();
  if (!legacyToken) {
    return null;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
  clearLegacyTokens();
  return legacyToken;
}

export function setToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  clearLegacyTokens();
}

export function removeToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  clearLegacyTokens();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function loginWithGithub() {
  window.location.replace(`${API_BASE}/auth/github/connect`);
}

export async function verifySession(): Promise<boolean> {
  const token = getToken();
  if (!token) {
    return false;
  }

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    return true;
  }

  if (res.status === 401) {
    removeToken();
  }
  return false;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  updated_at: string;
  html_url: string;
  private: boolean;
  default_branch: string;
}

export interface Deployment {
  id: string;
  project_name: string;
  status: "building" | "success" | "failed" | "queued";
  created_at: string;
  commit_hash?: string;
  branch?: string;
  duration?: number;
  logs?: string;
  port?: number;
}

export interface DashboardStats {
  total_projects: number;
  total_deployments: number;
  successful_builds: number;
  failed_builds: number;
}

export interface Project {
  id: string;
  repo_name: string;
  repo_url: string;
  branch: string;
  created_at: string;
}

export interface DeploymentLogsResponse {
  logs: string;
  status: string;
}
