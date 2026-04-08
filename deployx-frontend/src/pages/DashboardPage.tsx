import { FolderGit2, Rocket, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DeploymentTable } from "@/components/DeploymentTable";
import { ProjectCard } from "@/components/ProjectCard";
import { useRepos } from "@/hooks/useRepos";

const DashboardPage = () => {
  const { repos, loading } = useRepos();

  // 🔥 Dynamic stats from repos
  const stats = [
    {
      label: "Total Projects",
      value: repos.length.toString(),
      icon: FolderGit2,
      change: "From GitHub",
    },
    {
      label: "Active Deployments",
      value: repos.length > 0 ? "Active" : "0",
      icon: Rocket,
      change: "Coming soon",
    },
    {
      label: "Failed Builds",
      value: "0",
      icon: AlertTriangle,
      change: "Coming soon",
    },
    {
      label: "Build Minutes",
      value: "0",
      icon: Activity,
      change: "Coming soon",
    },
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your projects and deployments.
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="text-2xl font-bold">
                {stat.value}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🔥 REPOSITORIES SECTION */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Your GitHub Repositories
        </h2>

        {loading ? (
          <p className="text-muted-foreground">
            Loading repositories...
          </p>
        ) : repos.length === 0 ? (
          <p className="text-muted-foreground">
            No repositories found. Connect GitHub.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo: any) => (
              <ProjectCard key={repo.id} project={repo} />
            ))}
          </div>
        )}
      </div>

      {/* 🔥 DEPLOYMENTS (KEEP FOR FUTURE ENGINE) */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Recent Deployments
        </h2>

        {/* For now empty */}
        <DeploymentTable deployments={[]} />
      </div>

    </div>
  );
};

export default DashboardPage;