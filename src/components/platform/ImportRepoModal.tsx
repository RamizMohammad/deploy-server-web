import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Code2, GitBranch, Loader2, Lock, Plus, ShieldCheck, Sparkles, Terminal, Trash2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api, type GithubRepo } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";
import { toast } from "sonner";
import { Stepper, SurfaceCard } from "./PlatformUI";

const STEPS = ["Select", "Detect", "Configure", "Environment", "Deploy"];

type EnvVar = { id: string; key: string; value: string };

export function ImportRepoModal({
  repo,
  open,
  onOpenChange,
  onDeployed,
}: {
  repo: GithubRepo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeployed?: () => void;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [outputDir, setOutputDir] = useState("dist");
  const [installCommand, setInstallCommand] = useState("npm install");
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [success, setSuccess] = useState(false);

  // detect "framework" animation timing on open
  useEffect(() => {
    if (!open || !repo) return;
    setStep(0);
    setSuccess(false);
    const timers = [
      window.setTimeout(() => setStep(1), 280),
      window.setTimeout(() => setStep(2), 1100),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [open, repo]);

  const detectedFramework = useMemo(() => {
    if (!repo) return "Generic";
    const lang = (repo.language || "").toLowerCase();
    if (lang.includes("typescript") || lang.includes("javascript")) return "Node / Vite";
    if (lang.includes("python")) return "Python (FastAPI)";
    if (lang.includes("go")) return "Go";
    if (lang.includes("rust")) return "Rust";
    return "Auto";
  }, [repo]);

  const addEnvVar = () =>
    setEnvVars((prev) => [...prev, { id: Math.random().toString(36).slice(2), key: "", value: "" }]);
  const removeEnvVar = (id: string) => setEnvVars((prev) => prev.filter((v) => v.id !== id));
  const updateEnvVar = (id: string, patch: Partial<EnvVar>) =>
    setEnvVars((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const deploy = async () => {
    if (!repo) return;
    setDeploying(true);
    setStep(STEPS.length - 1);
    try {
      await api.post("/deploy", {
        repo_name: repo.name,
        branch: repo.default_branch || "main",
      });
      setSuccess(true);
      toast.success(`Deployment started for ${repo.name}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
        queryClient.invalidateQueries({ queryKey: queryKeys.deployments }),
      ]);
      window.setTimeout(() => {
        onDeployed?.();
        onOpenChange(false);
      }, 1300);
    } catch {
      toast.error("Failed to start deployment.");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !deploying && onOpenChange(o)}>
      <DialogContent className="max-w-3xl border-zinc-800 bg-[#090D13]/95 p-0 text-foreground shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
        {repo && (
          <div className="overflow-hidden rounded-lg">
            <DialogHeader className="border-b border-zinc-800/80 px-6 py-5">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Import {repo.name}
              </DialogTitle>
              <DialogDescription>
                {repo.private ? <Lock className="mr-1 inline h-3 w-3" /> : <Unlock className="mr-1 inline h-3 w-3" />}
                {repo.private ? "Private" : "Public"} • Branch <span className="font-mono">{repo.default_branch || "main"}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="border-b border-zinc-800/80 px-6 py-4">
              <Stepper steps={STEPS} current={step} />
            </div>

            <div className="min-h-[320px] px-6 py-6">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <StepWrapper key="select">
                    <RepoSummary repo={repo} />
                  </StepWrapper>
                )}

                {step === 1 && (
                  <StepWrapper key="detect">
                    <SurfaceCard className="overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-black/40 px-4 py-3 font-mono text-xs text-muted-foreground">
                        <Terminal className="h-3.5 w-3.5" /> launchly/detect
                      </div>
                      <div className="space-y-2 p-4 font-mono text-sm">
                        {[
                          "Resolving repository metadata…",
                          `Inspecting ${repo.language || "source"} files…`,
                          `Framework preset: ${detectedFramework}`,
                          "Build environment ready.",
                        ].map((line, i) => (
                          <motion.div
                            key={line}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.18 }}
                            className="flex items-center gap-2 text-emerald-300"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> {line}
                          </motion.div>
                        ))}
                      </div>
                    </SurfaceCard>
                  </StepWrapper>
                )}

                {step === 2 && (
                  <StepWrapper key="configure">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FieldGroup label="Install command" icon={<Code2 className="h-3.5 w-3.5" />}>
                        <Input value={installCommand} onChange={(e) => setInstallCommand(e.target.value)} className="border-zinc-800 bg-zinc-950 font-mono text-sm" />
                      </FieldGroup>
                      <FieldGroup label="Build command" icon={<Code2 className="h-3.5 w-3.5" />}>
                        <Input value={buildCommand} onChange={(e) => setBuildCommand(e.target.value)} className="border-zinc-800 bg-zinc-950 font-mono text-sm" />
                      </FieldGroup>
                      <FieldGroup label="Output directory" icon={<Code2 className="h-3.5 w-3.5" />}>
                        <Input value={outputDir} onChange={(e) => setOutputDir(e.target.value)} className="border-zinc-800 bg-zinc-950 font-mono text-sm" />
                      </FieldGroup>
                      <FieldGroup label="Branch" icon={<GitBranch className="h-3.5 w-3.5" />}>
                        <Input value={repo.default_branch || "main"} disabled className="border-zinc-800 bg-zinc-950 font-mono text-sm" />
                      </FieldGroup>
                    </div>
                  </StepWrapper>
                )}

                {step === 3 && (
                  <StepWrapper key="env">
                    <div className="space-y-3">
                      {envVars.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No environment variables yet. Add the secrets your app needs at runtime.
                        </p>
                      )}
                      {envVars.map((env) => (
                        <motion.div
                          key={env.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="grid grid-cols-[1fr_1fr_auto] gap-2"
                        >
                          <Input
                            placeholder="KEY"
                            value={env.key}
                            onChange={(e) => updateEnvVar(env.id, { key: e.target.value.toUpperCase() })}
                            className="border-zinc-800 bg-zinc-950 font-mono text-sm uppercase"
                          />
                          <Input
                            placeholder="value"
                            value={env.value}
                            onChange={(e) => updateEnvVar(env.id, { value: e.target.value })}
                            className="border-zinc-800 bg-zinc-950 font-mono text-sm"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeEnvVar(env.id)} className="text-muted-foreground hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                      <Button variant="outline" onClick={addEnvVar} className="gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-900">
                        <Plus className="h-3.5 w-3.5" /> Add variable
                      </Button>
                    </div>
                  </StepWrapper>
                )}

                {step === 4 && (
                  <StepWrapper key="deploy">
                    <SurfaceCard className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">Ready to deploy</h3>
                          <p className="mt-1 text-sm text-muted-foreground">Review your configuration, then ship it.</p>
                          <dl className="mt-4 grid gap-2 text-sm">
                            <Row label="Repository" value={repo.full_name} />
                            <Row label="Branch" value={repo.default_branch || "main"} />
                            <Row label="Install" value={installCommand} mono />
                            <Row label="Build" value={buildCommand} mono />
                            <Row label="Output" value={outputDir} mono />
                            <Row label="Env vars" value={`${envVars.filter((v) => v.key).length} configured`} />
                          </dl>
                        </div>
                      </div>
                    </SurfaceCard>
                    <AnimatePresence>
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Deployment queued. Routing you to the project…
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </StepWrapper>
                )}
              </AnimatePresence>
            </div>

            <DialogFooter className="border-t border-zinc-800/80 bg-zinc-950/50 px-6 py-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={deploying}>
                Cancel
              </Button>
              <div className="flex-1" />
              {step > 0 && step < 4 && (
                <Button variant="outline" onClick={prev} className="border-zinc-800 bg-zinc-950">
                  Back
                </Button>
              )}
              {step < 4 && (
                <Button onClick={next} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  Continue
                </Button>
              )}
              {step === 4 && (
                <Button onClick={deploy} disabled={deploying || success} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {success ? "Queued" : "Deploy"}
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FieldGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {icon} {label}
      </Label>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-900/80 py-1.5 last:border-b-0">
      <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className={cn("max-w-[60%] truncate text-foreground", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}

function RepoSummary({ repo }: { repo: GithubRepo }) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
          <GitBranch className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{repo.full_name}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{repo.description || "No description provided."}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-0.5">{repo.language || "Code"}</span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-0.5">
              {repo.private ? "Private" : "Public"}
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-2 py-0.5 font-mono">
              {repo.default_branch || "main"}
            </span>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}