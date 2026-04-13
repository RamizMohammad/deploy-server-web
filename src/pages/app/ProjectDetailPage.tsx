import { useParams, useNavigate } from "react-router-dom";
import { useDeploymentStore, type DeploymentStatus, type Deployment } from "@/stores/deploymentStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, RotateCcw, ExternalLink, GitBranch, Clock, Terminal,
  Globe, Plus, Shield, CheckCircle2, XCircle, Eye, EyeOff, Trash2, Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  live: { color: "text-success", bg: "bg-success/10 border-success/20", label: "Live" },
  building: { color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Building" },
  failed: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Failed" },
  idle: { color: "text-muted-foreground", bg: "bg-muted border-border", label: "Idle" },
  queued: { color: "text-muted-foreground", bg: "bg-muted border-border", label: "Queued" },
  cloning: { color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Cloning" },
  installing: { color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Installing" },
  deploying: { color: "text-primary", bg: "bg-primary/10 border-primary/20", label: "Deploying" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusConfig[status] || statusConfig.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${s.bg} ${s.color}`}>
      {(status === "building" || status === "cloning" || status === "installing" || status === "deploying" || status === "queued") && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {status === "live" && <CheckCircle2 className="h-3 w-3" />}
      {status === "failed" && <XCircle className="h-3 w-3" />}
      {s.label}
    </span>
  );
};

const LogViewer = ({ deployment }: { deployment: Deployment }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [deployment.logs.length]);

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
        <div className="w-3 h-3 rounded-full bg-destructive/60" />
        <div className="w-3 h-3 rounded-full bg-warning/60" />
        <div className="w-3 h-3 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-muted-foreground font-mono">Build Logs — {deployment.commitHash}</span>
        <div className="flex-1" />
        <StatusBadge status={deployment.status} />
      </div>
      <div ref={ref} className="terminal-bg p-4 max-h-96 overflow-y-auto space-y-1">
        <AnimatePresence>
          {deployment.logs.map((log, i) => (
            <motion.p
              key={`${deployment.id}-${i}`}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm font-mono flex gap-3 ${
                log.type === "success" ? "text-success" : log.type === "error" ? "text-destructive" : log.type === "warning" ? "text-warning" : "text-muted-foreground"
              }`}
            >
              <span className="text-muted-foreground/40 select-none shrink-0 w-8 text-right">{log.timestamp}</span>
              <span>{log.message}</span>
            </motion.p>
          ))}
        </AnimatePresence>
        {deployment.status !== "live" && deployment.status !== "failed" && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-11" />
        )}
      </div>
    </div>
  );
};

const DeploymentTimeline = ({ deployments, onSelect }: { deployments: Deployment[]; onSelect: (d: Deployment) => void }) => (
  <div className="space-y-2">
    {deployments.map((d, i) => (
      <motion.button
        key={d.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
        onClick={() => onSelect(d)}
        className="w-full glass-hover rounded-xl px-5 py-4 text-left group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={d.status} />
            <div>
              <p className="text-sm font-medium text-foreground">{d.commitMessage}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{d.branch}</span>
                <span className="font-mono">{d.commitHash}</span>
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{new Date(d.createdAt).toLocaleString()}</p>
            {d.duration && <p className="mt-0.5">{d.duration}s</p>}
          </div>
        </div>
      </motion.button>
    ))}
    {deployments.length === 0 && (
      <p className="text-center text-sm text-muted-foreground py-8">No deployments yet.</p>
    )}
  </div>
);

const EnvVarsEditor = ({ projectId }: { projectId: string }) => {
  const { projects, updateEnvVar } = useDeploymentStore();
  const project = projects.find((p) => p.id === projectId);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  if (!project) return null;

  const toggle = (i: number) => {
    const s = new Set(revealed);
    s.has(i) ? s.delete(i) : s.add(i);
    setRevealed(s);
  };

  const add = () => {
    if (!newKey.trim()) return;
    updateEnvVar(projectId, [...project.envVars, { key: newKey, value: newValue, masked: true }]);
    setNewKey("");
    setNewValue("");
  };

  const remove = (i: number) => {
    updateEnvVar(projectId, project.envVars.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      {project.envVars.map((env, i) => (
        <div key={`${env.key}-${i}`} className="flex items-center gap-3">
          <code className="text-sm text-primary font-mono bg-primary/5 px-3 py-2 rounded-lg border border-border/30 w-48 shrink-0">{env.key}</code>
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={env.masked && !revealed.has(i) ? "••••••••" : env.value}
              readOnly
              className="bg-secondary/50 border-border/50 font-mono text-sm h-9"
            />
            <Button variant="ghost" size="sm" onClick={() => toggle(i)} className="shrink-0">
              {revealed.has(i) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => remove(i)} className="shrink-0 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2 border-t border-border/20">
        <Input placeholder="KEY" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="bg-secondary/50 border-border/50 font-mono text-sm h-9 w-48" />
        <Input placeholder="value" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="bg-secondary/50 border-border/50 font-mono text-sm h-9 flex-1" />
        <Button size="sm" onClick={add} className="bg-foreground text-background hover:bg-foreground/90 shrink-0">Add</Button>
      </div>
    </div>
  );
};

const DomainsSection = ({ projectId }: { projectId: string }) => {
  const { projects, addDomain, verifyDomain } = useDeploymentStore();
  const project = projects.find((p) => p.id === projectId);
  const [newDomain, setNewDomain] = useState("");

  if (!project) return null;

  const handleAdd = () => {
    if (!newDomain.trim()) return;
    addDomain(projectId, newDomain);
    setNewDomain("");
  };

  return (
    <div className="space-y-4">
      {project.domains.map((d) => (
        <div key={d.id} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{d.domain}</span>
            </div>
            {!d.verified && (
              <Button size="sm" variant="outline" onClick={() => verifyDomain(projectId, d.id)} className="border-border/50 text-xs">
                Verify
              </Button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">DNS</p>
              <span className={`text-xs ${d.dnsConfigured ? "text-success" : "text-warning"}`}>
                {d.dnsConfigured ? "Configured" : "Pending"}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Verification</p>
              <span className={`text-xs ${d.verified ? "text-success" : "text-warning"}`}>
                {d.verified ? "Verified" : "Pending"}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">SSL</p>
              <span className={`text-xs flex items-center gap-1 ${d.sslStatus === "active" ? "text-success" : "text-warning"}`}>
                <Shield className="h-3 w-3" /> {d.sslStatus === "active" ? "Active" : "Pending"}
              </span>
            </div>
          </div>
          {!d.dnsConfigured && (
            <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border/30">
              <p className="text-xs text-muted-foreground mb-2">Add these DNS records:</p>
              <div className="font-mono text-xs space-y-1 text-muted-foreground">
                <p>CNAME → cname.launchly.app</p>
                <p>TXT → launchly-verify={projectId}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Input placeholder="example.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} className="bg-secondary/50 border-border/50 h-9" />
        <Button size="sm" onClick={handleAdd} className="bg-foreground text-background hover:bg-foreground/90 gap-1 shrink-0">
          <Plus className="h-3 w-3" /> Add Domain
        </Button>
      </div>
    </div>
  );
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, startDeployment, activeDeployment } = useDeploymentStore();
  const project = projects.find((p) => p.id === id);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [deploying, setDeploying] = useState(false);

  // Sync active deployment view
  useEffect(() => {
    if (activeDeployment && activeDeployment.projectId === id) {
      setSelectedDeployment(activeDeployment);
    }
  }, [activeDeployment, id]);

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" onClick={() => navigate("/app/projects")} className="mt-4">Back to Projects</Button>
      </div>
    );
  }

  const handleRedeploy = () => {
    setDeploying(true);
    startDeployment(project.id, "Manual redeploy");
    setTimeout(() => setDeploying(false), 1000);
  };

  const latestDeployment = project.deployments[0];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <button onClick={() => navigate("/app/projects")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Projects
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{project.repo}</span>
              {project.url && (
                <a href="#" className="flex items-center gap-1 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> {project.url.replace("https://", "")}
                </a>
              )}
            </div>
          </div>
          <Button onClick={handleRedeploy} disabled={deploying} className="bg-foreground text-background hover:bg-foreground/90 gap-2">
            {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Redeploy
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="env">Environment</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Project Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Framework</span><span className="text-foreground">{project.framework}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Branch</span><span className="text-foreground font-mono">{project.branch}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Build Command</span><span className="text-foreground font-mono">{project.buildCommand}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Output</span><span className="text-foreground font-mono">{project.outputDir}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-foreground">{new Date(project.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
              {latestDeployment && (
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Latest Deployment</h3>
                  <LogViewer deployment={latestDeployment} />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deployments">
            <DeploymentTimeline deployments={project.deployments} onSelect={setSelectedDeployment} />
            {selectedDeployment && (
              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Terminal className="h-4 w-4" /> Deployment Logs
                </h3>
                <LogViewer deployment={selectedDeployment} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs">
            {latestDeployment ? (
              <LogViewer deployment={latestDeployment} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No logs available.</p>
            )}
          </TabsContent>

          <TabsContent value="env">
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Environment Variables</h3>
              <EnvVarsEditor projectId={project.id} />
            </div>
          </TabsContent>

          <TabsContent value="domains">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Custom Domains</h3>
              <DomainsSection projectId={project.id} />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="glass rounded-xl p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Build Configuration</h3>
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground">Build Command</label><Input value={project.buildCommand} readOnly className="mt-1 bg-secondary/50 border-border/50 font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground">Install Command</label><Input value={project.installCommand} readOnly className="mt-1 bg-secondary/50 border-border/50 font-mono" /></div>
                  <div><label className="text-xs text-muted-foreground">Output Directory</label><Input value={project.outputDir} readOnly className="mt-1 bg-secondary/50 border-border/50 font-mono" /></div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/20">
                <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">Delete Project</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
