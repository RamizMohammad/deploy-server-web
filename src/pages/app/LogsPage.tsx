import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Loader2 } from "lucide-react";
import { api, type Deployment, type DeploymentLogsResponse } from "@/lib/api";

export default function LogsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null);
  const [activeLogs, setActiveLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.get<Deployment[]>("/deployments");
        if (!mounted) return;
        setDeployments(data);

        if (data.length > 0) {
          const first = data[0];
          setActiveDeploymentId(first.id);
          const logs = await api.get<DeploymentLogsResponse>(`/deployments/${first.id}/logs`);
          if (!mounted) return;
          setActiveLogs(logs.logs || "");
        }
      } catch {
        if (!mounted) return;
        setDeployments([]);
        setActiveLogs("");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openLogs = async (deploymentId: string) => {
    setActiveDeploymentId(deploymentId);
    try {
      const logs = await api.get<DeploymentLogsResponse>(`/deployments/${deploymentId}/logs`);
      setActiveLogs(logs.logs || "");
    } catch {
      setActiveLogs("");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Logs</h1>
        <p className="text-muted-foreground mb-8">Build logs across all projects.</p>
      </motion.div>

      {loading ? (
        <div className="glass rounded-xl p-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading logs...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="glass rounded-xl overflow-hidden lg:col-span-1">
            <div className="px-4 py-3 border-b border-border/30 text-sm font-medium text-foreground">Deployments</div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-border/20">
              {deployments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => openLogs(d.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors ${
                    activeDeploymentId === d.id ? "bg-secondary/40" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{d.project_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{d.id}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(d.created_at).toLocaleString()}</p>
                </button>
              ))}
              {deployments.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No deployments available.</p>
              )}
            </div>
          </div>

          <div className="glass rounded-xl overflow-hidden lg:col-span-2">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">{activeDeploymentId || "No deployment selected"}</span>
              <ScrollText className="h-4 w-4 text-muted-foreground ml-auto" />
            </div>
            <div className="terminal-bg p-4 max-h-[600px] overflow-y-auto space-y-1">
              {activeLogs ? (
                activeLogs.split("\n").map((line, i) => (
                  <p key={`${i}-${line}`} className="text-sm font-mono text-muted-foreground">
                    <span className="text-muted-foreground/40 shrink-0 mr-3">{String(i + 1).padStart(3, " ")}</span>
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground/50 font-mono">No logs available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
