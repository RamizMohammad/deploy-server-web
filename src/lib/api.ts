const API_BASE = "http://localhost:8001";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("deployx_token");
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
      localStorage.removeItem("deployx_token");
      window.location.href = "/";
    }
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

export function getToken(): string | null {
  return localStorage.getItem("deployx_token");
}

export function setToken(token: string) {
  localStorage.setItem("deployx_token", token);
}

export function removeToken() {
  localStorage.removeItem("deployx_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function loginWithGithub() {
  window.location.href = `${API_BASE}/auth/github/connect`;
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
  commit_message?: string;
  branch?: string;
  duration?: number;
}

export interface DashboardStats {
  total_projects: number;
  total_deployments: number;
  successful_builds: number;
  failed_builds: number;
}
