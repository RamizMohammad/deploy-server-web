import { isAuthenticated as checkAuth, getToken, logoutRequest, removeToken, verifySession } from "@/lib/api";
import { queryClient, queryKeys } from "@/lib/query";
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
    try {
      if (!getToken()) {
        console.log("[AuthProvider] No token found, marking as unauthenticated");
        setAuthed(false);
        setChecking(false);
        return;
      }

      console.log("[AuthProvider] Verifying session with backend...");
      setChecking(true);
      const user = await verifySession();
      console.log("[AuthProvider] Session verification result:", Boolean(user));
      if (user) {
        queryClient.setQueryData(queryKeys.authMe, user);
      }
      setAuthed(Boolean(user));
      setChecking(false);
    } catch (error) {
      console.error("[AuthProvider] Unexpected error during refresh:", error);
      setAuthed(false);
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    console.log("[AuthProvider] Initializing auth check");
    
    const run = async () => {
      try {
        await refresh();
        if (!active) return;
      } catch (error) {
        console.error("[AuthProvider] Error in initial auth check:", error);
        if (active) {
          setAuthed(false);
          setChecking(false);
        }
      }
    };
    
    void run();

    const syncToken = () => {
      if (!active) return;
      const newAuthState = checkAuth();
      console.log("[AuthProvider] Storage event triggered, new auth state:", newAuthState);
      setAuthed(newAuthState);
    };
    
    window.addEventListener("storage", syncToken);
    return () => {
      active = false;
      window.removeEventListener("storage", syncToken);
    };
  }, [refresh]);

  const logout = () => {
    void logoutRequest();
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
