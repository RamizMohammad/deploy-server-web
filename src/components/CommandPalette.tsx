import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FolderGit2, Rocket, Globe, Settings, LayoutDashboard, Play } from "lucide-react";
import { api, type Project } from "@/lib/api";
import { createProjectDeployPayload } from "@/lib/deploy";
import { toast } from "sonner";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    api.get<Project[]>("/projects")
      .then((data) => {
        if (!mounted) return;
        setProjects(data);
      })
      .catch(() => {
        if (!mounted) return;
        setProjects([]);
      });
    return () => {
      mounted = false;
    };
  }, [open]);

  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  const triggerDeploy = async (project: Project) => {
    try {
      await api.post("/deploy", createProjectDeployPayload(project));
      toast.success(`Deployment started for ${project.repo_name}`);
      run(() => navigate(`/app/projects/${project.id}`));
    } catch {
      toast.error("Failed to start deployment.");
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search projects, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => navigate("/app"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/app/projects"))}>
            <FolderGit2 className="mr-2 h-4 w-4" /> Projects
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/app/domains"))}>
            <Globe className="mr-2 h-4 w-4" /> Domains
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/app/settings"))}>
            <Settings className="mr-2 h-4 w-4" /> Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Projects">
          {projects.map((p) => (
            <CommandItem key={p.id} onSelect={() => run(() => navigate(`/app/projects/${p.id}`))}>
              <FolderGit2 className="mr-2 h-4 w-4" /> {p.repo_name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          {projects.map((p) => (
            <CommandItem key={`deploy-${p.id}`} onSelect={() => triggerDeploy(p)}>
              <Play className="mr-2 h-4 w-4" /> Deploy {p.repo_name}
            </CommandItem>
          ))}
          <CommandItem onSelect={() => run(() => navigate("/app/new"))}>
            <Rocket className="mr-2 h-4 w-4" /> Import New Project
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
