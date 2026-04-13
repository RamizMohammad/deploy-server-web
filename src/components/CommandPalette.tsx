import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDeploymentStore } from "@/stores/deploymentStore";
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

export const CommandPalette = () => {
  const navigate = useNavigate();
  const { commandPaletteOpen, setCommandPaletteOpen, projects, startDeployment } = useDeploymentStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const run = (fn: () => void) => {
    fn();
    setCommandPaletteOpen(false);
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
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
              <FolderGit2 className="mr-2 h-4 w-4" /> {p.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          {projects.map((p) => (
            <CommandItem key={p.id} onSelect={() => run(() => { startDeployment(p.id); navigate(`/app/projects/${p.id}`); })}>
              <Play className="mr-2 h-4 w-4" /> Deploy {p.name}
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
