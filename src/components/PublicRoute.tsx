import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export const PublicRoute = ({ children }: any) => {
  const { isAuthenticated, isChecking } = useAuth();

  console.log("[PublicRoute] Rendering - isChecking:", isChecking, "isAuthenticated:", isAuthenticated);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Checking your session...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log("[PublicRoute] Already authenticated, redirecting to /app");
    return <Navigate to="/app" replace />;
  }

  return children;
};