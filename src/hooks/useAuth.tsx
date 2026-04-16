import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, removeToken, isAuthenticated as checkAuth } from "@/lib/api";
import { queryClient } from "@/lib/query";

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(checkAuth());

  useEffect(() => {
    setAuthed(checkAuth());
  }, []);

  const logout = () => {
    removeToken();
    queryClient.clear();
    setAuthed(false);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: authed, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
