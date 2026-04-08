import { ExternalLink, GitBranch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: any;
}

export function ProjectCard({ project }: ProjectCardProps) {

  const deployRepo = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Deploy:", project.name);
  };

  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">

      <CardContent className="p-5">

        {/* HEADER */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">
              {project.name}
            </h3>

            <p className="text-sm text-muted-foreground truncate">
              {project.full_name}
            </p>
          </div>
        </div>

        {/* META INFO */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">

          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            {project.default_branch}
          </span>

          <span>{project.language || "Unknown"}</span>

          <span>·</span>

          <span>
            Updated: {new Date(project.updated_at).toLocaleDateString()}
          </span>

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between">

          <span className="text-xs text-muted-foreground font-mono truncate">
            {project.html_url}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={deployRepo}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>

        </div>

      </CardContent>
    </Card>
  );
}