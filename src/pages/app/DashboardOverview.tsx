import { useNavigate } from "react-router-dom";
import { useDeploymentStore } from "@/stores/deploymentStore";
import { motion } from "framer-motion";
import { FolderGit2, ArrowRight, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const StatusDot = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    live: "bg-success",
    building: "bg-warning animate-pulse",
    failed: "bg-destructive",
    idle: "bg-muted-foreground",
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || colors.idle}`} />;
};

export default function DashboardOverview() {
  const { projects } = useDeploymentStore();
  const navigate = useNavigate();

  const totalDeployments = projects.reduce((a, p) => a + p.deployments.length, 0);
  const liveCount = projects.filter((p) => p.status === "live").length;
  const failedCount = projects.filter((p) => p.status === "failed").length;

  const recentDeployments = projects
    .flatMap((p) => p.deployments.map((d) => ({ ...d, projectName: p.name })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderGit2 },
    { label: "Total Deploys", value: totalDeployments, icon: Activity },
    { label: "Live", value: liveCount, icon: CheckCircle2 },
    { label: "Failed", value: failedCount, icon: XCircle },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Overview of your projects and deployments.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Projects + Recent deployments */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <h2 className="font-semibold text-foreground">Projects</h2>
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground gap-1" onClick={() => navigate("/app/projects")}>
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="divide-y divide-border/20">
            {projects.map((p) => (
              <button key={p.id} onClick={() => navigate(`/app/projects/${p.id}`)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <StatusDot status={p.status} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.framework}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/30">
            <h2 className="font-semibold text-foreground">Recent Deployments</h2>
          </div>
          <div className="divide-y divide-border/20">
            {recentDeployments.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <StatusDot status={d.status} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.projectName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{d.commitMessage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {d.duration ? `${d.duration}s` : "—"}
                </div>
              </div>
            ))}
            {recentDeployments.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No deployments yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
