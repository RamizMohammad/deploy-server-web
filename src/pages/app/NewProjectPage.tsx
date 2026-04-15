import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Lock, Globe, GitBranch, Loader2, Rocket } from "lucide-react";
import { api, type GithubRepo } from "@/lib/api";
import { toast } from "sonner";

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployingRepoId, setDeployingRepoId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.get<GithubRepo[]>("/auth/github/repos");
        if (!mounted) return;
        setRepos(data);
      } catch {
        if (!mounted) return;
        setRepos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () => repos.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase())
    ),
    [repos, search]
  );

  const deployRepo = async (repo: GithubRepo) => {
    try {
      setDeployingRepoId(repo.id);
      await api.post("/deploy", {
        repo_name: repo.name,
        branch: repo.default_branch || "main",
      });
      toast.success(`Deployment started for ${repo.name}`);
      navigate("/app/projects");
    } catch {
      toast.error("Failed to start deployment. Please check backend logs.");
    } finally {
      setDeployingRepoId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate("/app/projects")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Import Project</h1>
        <p className="text-muted-foreground mb-8">Select a repository and start a real deployment.</p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search repositories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50 border-border/50" />
        </div>

        {loading ? (
          <div className="glass rounded-xl p-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading repositories...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center">
            <Rocket className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No repositories found. Connect GitHub or adjust search.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.map((repo) => (
              <div key={repo.id} className="w-full glass-hover rounded-xl px-5 py-4 group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">{repo.name}</span>
                        {repo.private ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Globe className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{repo.description || "No description"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">{repo.default_branch || "main"}</span>
                    <Button
                      size="sm"
                      onClick={() => deployRepo(repo)}
                      disabled={deployingRepoId === repo.id}
                      className="bg-foreground text-background hover:bg-foreground/90"
                    >
                      {deployingRepoId === repo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
