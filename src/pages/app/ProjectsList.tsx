import { useNavigate } from "react-router-dom";
import { useDeploymentStore } from "@/stores/deploymentStore";
import { motion } from "framer-motion";
import { FolderGit2, Search, Plus, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    live: { bg: "bg-success/10 border-success/20", text: "text-success", label: "Live" },
    building: { bg: "bg-warning/10 border-warning/20", text: "text-warning", label: "Building" },
    failed: { bg: "bg-destructive/10 border-destructive/20", text: "text-destructive", label: "Failed" },
    idle: { bg: "bg-muted border-border", text: "text-muted-foreground", label: "Idle" },
  };
  const s = map[status] || map.idle;
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${s.bg} ${s.text}`}>{s.label}</span>;
};

export default function ProjectsList() {
  const { projects } = useDeploymentStore();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.repo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Projects</h1>
            <p className="text-muted-foreground">Manage your deployed projects.</p>
          </div>
          <Button onClick={() => navigate("/app/new")} className="bg-foreground text-background hover:bg-foreground/90 gap-2">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>

        <div className="relative w-full max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50 h-9" />
        </div>
      </motion.div>

      <div className="grid gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/app/projects/${p.id}`)}
            className="glass-hover rounded-xl px-6 py-5 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderGit2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{p.repo}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">{p.framework}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" /> {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <FolderGit2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No projects found.</p>
            <Button onClick={() => navigate("/app/new")} className="bg-foreground text-background hover:bg-foreground/90">Import Project</Button>
          </div>
        )}
      </div>
    </div>
  );
}
