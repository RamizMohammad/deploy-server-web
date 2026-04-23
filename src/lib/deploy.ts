import type { GithubRepo, Project } from "@/lib/api";

type DeployPayload = {
  repo_name: string;
  repo_full_name?: string;
  branch: string;
};

export function createRepoDeployPayload(repo: GithubRepo): DeployPayload {
  return {
    repo_name: repo.name,
    repo_full_name: repo.full_name,
    branch: repo.default_branch || "main",
  };
}

export function createProjectDeployPayload(project: Project): DeployPayload {
  const repoFullName = project.repo_name.includes("/") ? project.repo_name : undefined;
  const repoName = repoFullName ? repoFullName.split("/").pop() || project.repo_name : project.repo_name;

  return {
    repo_name: repoName,
    repo_full_name: repoFullName,
    branch: project.branch || "main",
  };
}
