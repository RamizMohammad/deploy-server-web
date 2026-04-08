import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, GitBranch, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { DeploymentTable } from "@/components/DeploymentTable";
import { LogViewer } from "@/components/LogViewer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockProjects, mockDeployments } from "@/lib/mock-data";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find((p) => p.id === id) || mockProjects[0];
  const projectDeployments = mockDeployments.filter((d) => d.projectName === project.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <GitBranch className="h-3.5 w-3.5" />{project.repo} · {project.branch}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><RotateCw className="h-3.5 w-3.5" />Redeploy</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" />Delete</Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="env">Environment</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">URL</p><a href="#" className="text-sm font-medium text-primary flex items-center gap-1">{project.url}<ExternalLink className="h-3 w-3" /></a></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Framework</p><p className="text-sm font-medium">{project.framework}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Last Deployed</p><p className="text-sm font-medium">{project.lastDeployed}</p></CardContent></Card>
          </div>
          <LogViewer status={project.status} />
        </TabsContent>

        <TabsContent value="deployments" className="mt-4">
          {projectDeployments.length > 0 ? (
            <DeploymentTable deployments={projectDeployments} />
          ) : (
            <DeploymentTable deployments={mockDeployments.slice(0, 3)} />
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <LogViewer status={project.status} />
        </TabsContent>

        <TabsContent value="env" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              {[{ key: "DATABASE_URL", value: "••••••••••" }, { key: "API_KEY", value: "••••••••••" }, { key: "NODE_ENV", value: "production" }].map((env) => (
                <div key={env.key} className="flex items-center gap-2">
                  <Input value={env.key} readOnly className="font-mono text-sm flex-1" />
                  <Input value={env.value} readOnly className="font-mono text-sm flex-1" type="password" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input defaultValue={project.name} />
              </div>
              <div className="space-y-2">
                <Label>Build Command</Label>
                <Input defaultValue="npm run build" className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Output Directory</Label>
                <Input defaultValue="dist" className="font-mono text-sm" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsPage;
