import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Github, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { loginWithGithub, isAuthenticated } from "@/lib/api";


export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/app", { replace: true });
    }
  }, [navigate]);

  const handleGithubLogin = () => {
    setLoading(true);
    loginWithGithub();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070A0F] px-6 text-foreground">
      {/* Ambient gradient + grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.22),transparent_45%),radial-gradient(circle_at_82%_78%,rgba(139,92,246,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-7 flex items-center justify-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_rgba(14,165,233,0.25)]">
            <Rocket className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
          </div>
          <span className="text-xl font-bold tracking-tight">Launchly</span>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-8 shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />

          <div className="relative">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">Sign in</p>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Welcome back, developer</h1>
            <p className="mt-2 text-sm text-muted-foreground">Use your GitHub account to deploy and manage Launchly projects.</p>

            <Button
              onClick={handleGithubLogin}
              disabled={loading}
              className="mt-7 h-11 w-full gap-2 rounded-lg bg-foreground text-background transition hover:scale-[1.01] hover:bg-foreground/90"
            >
              <Github className="h-4 w-4" />
              {loading ? "Redirecting to GitHub…" : "Continue with GitHub"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <div className="my-7 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-zinc-800" />
              <span>secured by GitHub OAuth</span>
              <span className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="grid gap-3">
              <Feature icon={<ShieldCheck className="h-3.5 w-3.5" />} text="GitHub OAuth with one-time auth-code exchange." />
              <Feature icon={<Zap className="h-3.5 w-3.5" />} text="Automatic framework detection on import." />
              <Feature icon={<Globe className="h-3.5 w-3.5" />} text="Live deployment status, logs, and rollbacks." />
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to Launchly's terms and privacy notice.
        </p>
      </motion.div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2.5 text-xs text-muted-foreground">
      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">{icon}</span>
      {text}
    </div>
  );
}
