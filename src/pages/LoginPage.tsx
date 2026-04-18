import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Github, Loader2, Rocket } from "lucide-react";
import { getToken, loginWithGithub } from "@/lib/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  // If already signed in, send straight to the dashboard.
  useEffect(() => {
    if (getToken()) {
      navigate("/app", { replace: true });
    }
  }, [navigate]);

  const handleGithub = () => {
    setRedirecting(true);
    loginWithGithub();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070A0F] px-4 text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_82%_80%,rgba(139,92,246,0.14),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">Launchly</span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue to your dashboard. We'll keep you logged in on this device.
        </p>

        <button
          onClick={handleGithub}
          disabled={redirecting}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800/80 bg-zinc-950/60 px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-zinc-900 disabled:opacity-60"
        >
          {redirecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to GitHub…
            </>
          ) : (
            <>
              <Github className="h-4 w-4" />
              Continue with GitHub
            </>
          )}
        </button>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;