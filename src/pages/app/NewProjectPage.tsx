import { useNavigate } from "react-router-dom";
import { useDeploymentStore, type GithubRepo } from "@/stores/deploymentStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, ArrowRight, Search, Lock, Globe, GitBranch, Star, Loader2,
  CheckCircle2, Plus, Trash2
} from "lucide-react";
import { useState, useEffect } from "react";

type Step = "repo" | "framework" | "configure" | "env" | "deploy";

const FRAMEWORKS = [
  { name: "Next.js", icon: "▲", build: "npm run build", output: ".next", install: "npm install" },
  { name: "Node.js", icon: "⬢", build: "npm run build", output: "dist", install: "npm install" },
  { name: "Static", icon: "📄", build: "", output: "public", install: "" },
  { name: "Python", icon: "🐍", build: "pip install -r requirements.txt", output: ".", install: "pip install" },
];

export default function NewProjectPage() {
  const navigate = useNavigate();
  const { repos, addProject, startDeployment } = useDeploymentStore();
  const [step, setStep] = useState<Step>("repo");
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [detectedFramework, setDetectedFramework] = useState<typeof FRAMEWORKS[0] | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [buildCmd, setBuildCmd] = useState("npm run build");
  const [outputDir, setOutputDir] = useState(".next");
  const [installCmd, setInstallCmd] = useState("npm install");
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
  );

  const selectRepo = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setStep("framework");
    setDetecting(true);

    // Simulate framework detection
    setTimeout(() => {
      const detected = repo.language === "TypeScript" || repo.language === "JavaScript"
        ? FRAMEWORKS[0]
        : repo.language === "Python"
        ? FRAMEWORKS[3]
        : FRAMEWORKS[2];
      setDetectedFramework(detected);
      setBuildCmd(detected.build);
      setOutputDir(detected.output);
      setInstallCmd(detected.install);
      setDetecting(false);
    }, 2000);
  };

  const addEnvVar = () => {
    if (!newKey.trim()) return;
    setEnvVars([...envVars, { key: newKey, value: newValue }]);
    setNewKey("");
    setNewValue("");
  };

  const deploy = () => {
    if (!selectedRepo || !detectedFramework) return;
    const projectId = `proj-${Date.now()}`;
    addProject({
      id: projectId,
      name: selectedRepo.name,
      repo: selectedRepo.fullName,
      framework: detectedFramework.name,
      language: selectedRepo.language,
      branch: "main",
      status: "building",
      url: `https://${selectedRepo.name}.launchly.app`,
      buildCommand: buildCmd,
      outputDir,
      installCommand: installCmd,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deployments: [],
      envVars: envVars.map((e) => ({ ...e, masked: true })),
      domains: [],
    });
    startDeployment(projectId, `Initial deploy from ${selectedRepo.name}`);
    setStep("deploy");
    setTimeout(() => navigate(`/app/projects/${projectId}`), 2500);
  };

  const steps: { key: Step; label: string }[] = [
    { key: "repo", label: "Repository" },
    { key: "framework", label: "Framework" },
    { key: "configure", label: "Build" },
    { key: "env", label: "Env Vars" },
    { key: "deploy", label: "Deploy" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate("/app/projects")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Import Project</h1>
        <p className="text-muted-foreground mb-8">Connect a Git repository and deploy.</p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= stepIndex ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`w-8 h-px ${i < stepIndex ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Repo */}
          {step === "repo" && (
            <motion.div key="repo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search repositories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filtered.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => selectRepo(repo)}
                    className="w-full glass-hover rounded-xl px-5 py-4 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">{repo.name}</span>
                            {repo.visibility === "private" ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Globe className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{repo.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.languageColor }} />
                          {repo.language}
                        </span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                        <span className="hidden md:block">{repo.lastCommit}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Framework Detection */}
          {step === "framework" && (
            <motion.div key="framework" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass rounded-xl p-8 text-center">
                {detecting ? (
                  <div>
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-1">Detecting framework...</p>
                    <p className="text-sm text-muted-foreground">Analyzing {selectedRepo?.name}</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">{detectedFramework?.icon}</div>
                    <p className="text-foreground font-semibold text-lg mb-1">{detectedFramework?.name} detected</p>
                    <p className="text-sm text-muted-foreground mb-6">We've configured your build settings automatically.</p>
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={() => setStep("repo")} className="border-border/50">Back</Button>
                      <Button onClick={() => setStep("configure")} className="bg-foreground text-background hover:bg-foreground/90 gap-1">
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Build Config */}
          {step === "configure" && (
            <motion.div key="configure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass rounded-xl p-6 space-y-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Build Command</label>
                  <Input value={buildCmd} onChange={(e) => setBuildCmd(e.target.value)} className="bg-secondary/50 border-border/50 font-mono" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Output Directory</label>
                  <Input value={outputDir} onChange={(e) => setOutputDir(e.target.value)} className="bg-secondary/50 border-border/50 font-mono" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Install Command</label>
                  <Input value={installCmd} onChange={(e) => setInstallCmd(e.target.value)} className="bg-secondary/50 border-border/50 font-mono" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep("framework")} className="border-border/50">Back</Button>
                  <Button onClick={() => setStep("env")} className="bg-foreground text-background hover:bg-foreground/90 gap-1">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Env Vars */}
          {step === "env" && (
            <motion.div key="env" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="glass rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-4">Add environment variables (optional).</p>
                <div className="space-y-2 mb-4">
                  {envVars.map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-primary/5 text-primary px-2 py-1 rounded">{e.key}</code>
                      <span className="text-sm text-muted-foreground font-mono flex-1">••••••••</span>
                      <Button variant="ghost" size="sm" onClick={() => setEnvVars(envVars.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="KEY" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="bg-secondary/50 border-border/50 font-mono text-sm w-40" />
                  <Input placeholder="value" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="bg-secondary/50 border-border/50 font-mono text-sm flex-1" />
                  <Button size="sm" variant="outline" onClick={addEnvVar} className="border-border/50 gap-1"><Plus className="h-3 w-3" /> Add</Button>
                </div>
                <div className="flex justify-end gap-3 pt-6">
                  <Button variant="outline" onClick={() => setStep("configure")} className="border-border/50">Back</Button>
                  <Button onClick={deploy} className="bg-foreground text-background hover:bg-foreground/90 gap-1">
                    Deploy <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Deploying */}
          {step === "deploy" && (
            <motion.div key="deploy" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="glass rounded-xl p-12 text-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">Deploying {selectedRepo?.name}...</p>
                <p className="text-sm text-muted-foreground">You'll be redirected to your project shortly.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
