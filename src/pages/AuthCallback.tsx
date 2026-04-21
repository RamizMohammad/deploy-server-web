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
        window.location.replace("/");
        return;
      }

      try {
        const token = await exchangeAuthCode(code);
        if (!active) return;

        queryClient.clear();
        setToken(token);
        window.location.replace("/app");
      } catch {
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
