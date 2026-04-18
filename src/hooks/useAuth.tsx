import { isAuthenticated as checkAuth, getToken, removeToken, verifySession } from "@/lib/api";
import { queryClient } from "@/lib/query";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isChecking: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isChecking: true,
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(checkAuth());
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setAuthed(false);
      setChecking(false);
      return;
    }

    setChecking(true);
    const valid = await verifySession();
    setAuthed(valid);
    setChecking(false);
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await refresh();
      if (!active) return;
    };
    void run();

    const syncToken = () => {
      if (!active) return;
      setAuthed(checkAuth());
    };
    window.addEventListener("storage", syncToken);
    return () => {
      active = false;
      window.removeEventListener("storage", syncToken);
    };
  }, [refresh]);

  const logout = () => {
    removeToken();
    queryClient.clear();
    setAuthed(false);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: authed, isChecking: checking, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
