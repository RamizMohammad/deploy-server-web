const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8001";
const TOKEN_STORAGE_KEY = "deployx.token";

export interface AuthUser {
  email: string;
}

export interface GithubRepo {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  language: string | null;
  updatedAt: string;
  isPrivate: boolean;
  htmlUrl: string;
}

export const getApiBase = () => API_BASE;

export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

export const getGithubConnectUrl = () => `${API_BASE}/auth/github/connect`;

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    let message = "API request failed";

    try {
      const errorBody = await res.json();
      if (typeof errorBody?.detail === "string") {
        message = errorBody.detail;
      } else if (typeof errorBody?.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Ignore JSON parsing failures and keep the default message.
    }

    throw new Error(message);
  }

  return res.json() as Promise<T>;
};

export const getCurrentUser = () => apiFetch<AuthUser>("/auth/github/me");

export const getGithubRepos = () => apiFetch<GithubRepo[]>("/auth/github/repos");
