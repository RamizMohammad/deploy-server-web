const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "https://server.api.launchly.systems").replace(/\/$/, "");
const AUTH_TOKEN_KEY = "deployx_token";
const LEGACY_AUTH_TOKEN_KEYS = ["token"];
const AUTH_RELATED_CACHE_KEYS = [
  "launchly:projects:v1",
  "launchly:deployments:v1",
  "launchly:github_repos:first_page:v1",
  "launchly:github_repos:pages:v1",
];

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

function clearPersistedAuthCaches() {
  for (const key of AUTH_RELATED_CACHE_KEYS) {
    localStorage.removeItem(key);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[API] Request failed: ${endpoint} ${res.status}`, errorBody);
      
      if (res.status === 401) {
        console.log("[API] Received 401, clearing token and redirecting to /");
        removeToken();
        window.location.href = "/";
        return undefined as T;
      }
      
      throw new Error(errorBody || `API Error: ${res.status}`);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  } catch (error) {
    console.error(`[API] Network error or parsing error for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, options),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  postForm: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, { method: "POST", body: formData }),
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
  clearPersistedAuthCaches();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function loginWithGithub() {
  window.location.replace(`${API_BASE}/auth/github/connect`);
}

export async function exchangeAuthCode(code: string): Promise<string> {
  try {
    console.log("[Auth] Exchanging auth code for JWT token...");
    const response = await request<{ token: string }>("/auth/exchange", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    if (!response?.token) {
      console.error("[Auth] Exchange response missing token field:", response);
      throw new Error("Invalid exchange response: missing token");
    }
    console.log("[Auth] Successfully received JWT token from /auth/exchange");
    return response.token;
  } catch (error) {
    console.error(
      "[Auth] Code exchange failed:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

export async function logoutRequest(): Promise<void> {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch {
    // Best effort; local logout still clears the client state.
  }
}

export async function verifySession(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) {
    console.log("[Auth] No token found during session verification");
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      mode: "cors",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      console.log("[Auth] Session verification succeeded");
      return (await res.json()) as AuthUser;
    }

    if (res.status === 401) {
      console.log("[Auth] Token is invalid or expired, clearing storage");
      removeToken();
      return null;
    }

    if (res.status === 400 || res.status === 500) {
      const errorData = await res.text();
      console.error("[Auth] Session verification failed:", res.status, errorData);
      return null;
    }

    console.warn("[Auth] Unexpected response from /auth/me:", res.status);
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[Auth] Session verification timeout after 10s");
    } else {
      console.error("[Auth] Session verification error:", error instanceof Error ? error.message : String(error));
    }
    return null;
  }
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
  owner?: {
    login?: string;
  };
  permissions?: {
    admin?: boolean;
    maintain?: boolean;
    push?: boolean;
    triage?: boolean;
    pull?: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  github_username: string | null;
  image_token: string | null;
  image_url: string | null;
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
