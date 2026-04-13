import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rocket, Github, Mail } from "lucide-react";
import { loginWithGithub, isAuthenticated } from "@/lib/api";
import { useEffect } from "react";

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
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-card/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <Rocket className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">Launchly</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Ship faster than ever</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">Push code, deploy globally, iterate instantly. The modern deployment platform.</p>

          {/* Animated deployment */}
          <motion.div className="mt-12 glass rounded-xl p-4 max-w-xs mx-auto text-left" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-mono">Production</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">my-app.launchly.app</p>
            <p className="text-xs text-muted-foreground mt-1">Deployed 2m ago · 24s build</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right - Auth */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Launchly</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <Button onClick={handleGithubLogin} disabled={loading} className="w-full bg-foreground text-background hover:bg-foreground/90 gap-2 mb-4 h-11">
            <Github className="h-4 w-4" />
            {loading ? "Redirecting to GitHub..." : "Continue with GitHub"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-background text-xs text-muted-foreground">or</span></div>
          </div>

          <div className="space-y-3">
            <Input placeholder="Email" className="bg-secondary/50 border-border/50 h-11" />
            <Input type="password" placeholder="Password" className="bg-secondary/50 border-border/50 h-11" />
            <Button disabled variant="outline" className="w-full h-11 border-border/50 hover:bg-secondary/50 gap-2 opacity-50 cursor-not-allowed">
              <Mail className="h-4 w-4" />
              Sign in with Email (coming soon)
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Don't have an account?{" "}
            <button onClick={handleGithubLogin} className="text-primary hover:underline">Sign up with GitHub</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
