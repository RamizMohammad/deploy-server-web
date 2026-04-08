import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Github, Lock, Plus, Rocket, Search, Trash2 } from "lucide-react";

import { useRepos } from "@/hooks/useRepos";
import type { EnvVar } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const steps = ["Connect Repository", "Configure", "Environment Variables", "Review & Deploy"];

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { repos, loading, error } = useRepos();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [outputDir, setOutputDir] = useState("dist");
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: "", value: "" }]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRepos = repos.filter((repo) => repo.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "" }]);
  const removeEnvVar = (index: number) => setEnvVars(envVars.filter((_, currentIndex) => currentIndex !== index));
  const updateEnvVar = (index: number, field: "key" | "value", value: string) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const selectedRepoData = repos.find((repo) => repo.id === selectedRepo);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Project</h1>
          <p className="text-sm text-muted-foreground">Deploy a new project from a Git repository.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {index < currentStep ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </div>
            {index < steps.length - 1 && <div className={`h-px flex-1 ${index < currentStep ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Select a Git repository to deploy."}
            {currentStep === 1 && "Configure your project's build settings."}
            {currentStep === 2 && "Add environment variables for your project."}
            {currentStep === 3 && "Review your configuration and deploy."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 0 && (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="max-h-[300px] space-y-2 overflow-auto">
                {loading && <p className="text-sm text-muted-foreground">Loading GitHub repositories...</p>}
                {!loading && error && <p className="text-sm text-destructive">{error}</p>}
                {!loading && !error && filteredRepos.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No repositories match your search." : "No repositories found for this account."}
                  </p>
                )}

                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepo(repo.id);
                      setProjectName(repo.name);
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${selectedRepo === repo.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{repo.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {repo.language || "Unknown"} · Updated {new Date(repo.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {repo.isPrivate && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      {selectedRepo === repo.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Build Command</Label>
                <Input value={buildCommand} onChange={(event) => setBuildCommand(event.target.value)} className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Output Directory</Label>
                <Input value={outputDir} onChange={(event) => setOutputDir(event.target.value)} className="font-mono text-sm" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              {envVars.map((env, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="KEY"
                    value={env.key}
                    onChange={(event) => updateEnvVar(index, "key", event.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <Input
                    placeholder="value"
                    value={env.value}
                    onChange={(event) => updateEnvVar(index, "value", event.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeEnvVar(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addEnvVar}>
                <Plus className="h-3.5 w-3.5" />
                Add Variable
              </Button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-lg border border-border p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Repository</span><span className="font-medium">{selectedRepoData?.fullName || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Project Name</span><span className="font-medium">{projectName || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Branch</span><span className="font-medium">{selectedRepoData?.defaultBranch || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Build Command</span><span className="font-mono">{buildCommand}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Output Directory</span><span className="font-mono">{outputDir}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Env Variables</span><span>{envVars.filter((env) => env.key).length} configured</span></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={currentStep === 0 && !selectedRepo}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => navigate("/projects/1")} className="gap-2">
            <Rocket className="h-4 w-4" />
            Deploy
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateProjectPage;
