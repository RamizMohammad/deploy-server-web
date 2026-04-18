import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { setToken } from "@/lib/api";
import { queryClient } from "@/lib/query";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // ✅ clear any cached data
      queryClient.clear();

      // ✅ store token
      setToken(token);

      // 🔥 CRITICAL FIX: replace entire history
      window.location.replace("/app");
    } else {
      window.location.replace("/");
    }
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