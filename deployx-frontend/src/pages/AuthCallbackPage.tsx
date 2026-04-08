import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { setToken } from "@/lib/api";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setError("GitHub sign-in did not return a session token.");
      return;
    }

    setToken(token);
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Finishing sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ?? "We are connecting your DeployX session and redirecting you now."}
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
