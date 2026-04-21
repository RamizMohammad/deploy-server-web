import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { exchangeAuthCode, setToken } from "@/lib/api";
import { queryClient } from "@/lib/query";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    let active = true;

    const run = async () => {
      if (!code) {
        console.error("[AuthCallback] No authorization code found in URL");
        window.location.replace("/");
        return;
      }

      try {
        console.log("[AuthCallback] Exchanging authorization code for token...");
        const token = await exchangeAuthCode(code);
        
        if (!active) {
          console.log("[AuthCallback] Component unmounted before token exchange completed");
          return;
        }

        if (!token) {
          console.error("[AuthCallback] Token is empty after exchange");
          window.location.replace("/");
          return;
        }

        console.log("[AuthCallback] Token received, clearing cache and storing token...");
        queryClient.clear();
        setToken(token);
        
        // Verify token was actually stored
        const storedToken = localStorage.getItem("deployx_token");
        if (!storedToken) {
          console.error("[AuthCallback] Failed to store token in localStorage");
          window.location.replace("/");
          return;
        }
        
        console.log("[AuthCallback] Token stored successfully, redirecting to /app...");
        // Use a small delay to ensure token is fully persisted
        setTimeout(() => {
          window.location.replace("/app");
        }, 100);
      } catch (error) {
        console.error(
          "[AuthCallback] Error during auth callback:",
          error instanceof Error ? error.message : String(error),
          error instanceof Error ? error.stack : ""
        );
        window.location.replace("/");
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
