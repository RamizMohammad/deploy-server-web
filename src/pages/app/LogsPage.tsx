import { useDeploymentStore } from "@/stores/deploymentStore";
import { motion } from "framer-motion";
import { ScrollText, Clock } from "lucide-react";

export default function LogsPage() {
  const { projects } = useDeploymentStore();
  const allDeployments = projects
    .flatMap((p) => p.deployments.map((d) => ({ ...d, projectName: p.name })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const allLogs = allDeployments.flatMap((d) =>
    d.logs.map((l) => ({ ...l, projectName: d.projectName, deploymentId: d.id, commitHash: d.commitHash }))
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Logs</h1>
        <p className="text-muted-foreground mb-8">Build logs across all projects.</p>
      </motion.div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">All Logs</span>
        </div>
        <div className="terminal-bg p-4 max-h-[600px] overflow-y-auto space-y-1">
          {allLogs.length > 0 ? allLogs.map((log, i) => (
            <div key={i} className="flex gap-3 text-sm font-mono">
              <span className="text-muted-foreground/40 shrink-0">{log.timestamp}</span>
              <span className="text-primary/60 shrink-0">[{log.projectName}]</span>
              <span className={
                log.type === "success" ? "text-success" : log.type === "error" ? "text-destructive" : log.type === "warning" ? "text-warning" : "text-muted-foreground"
              }>{log.message}</span>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground/50 font-mono">No logs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
