import type { GithubRepo } from "@/lib/api";

export type RepoOwnershipFilter = "all" | "owned" | "collaborations";
export type RepoVisibilityFilter = "all" | "public" | "private";

export function getRepoOwnerLogin(repo: GithubRepo): string {
  const ownerLogin = repo.owner?.login?.trim();
  if (ownerLogin) {
    return ownerLogin.toLowerCase();
  }
  return repo.full_name.split("/")[0]?.toLowerCase() ?? "";
}

export function isOwnedRepo(repo: GithubRepo, currentUsername: string | null | undefined): boolean {
  if (!currentUsername) {
    return false;
  }
  return getRepoOwnerLogin(repo) === currentUsername.toLowerCase();
}

export function filterRepos(
  repos: GithubRepo[],
  search: string,
  ownership: RepoOwnershipFilter,
  visibility: RepoVisibilityFilter,
  currentUsername: string | null | undefined
): GithubRepo[] {
  const searchValue = search.trim().toLowerCase();

  return repos.filter((repo) => {
    const owned = isOwnedRepo(repo, currentUsername);
    const matchesSearch =
      searchValue.length === 0 ||
      repo.name.toLowerCase().includes(searchValue) ||
      repo.full_name.toLowerCase().includes(searchValue) ||
      (repo.description || "").toLowerCase().includes(searchValue);

    const matchesOwnership =
      ownership === "all" ||
      (ownership === "owned" && owned) ||
      (ownership === "collaborations" && !owned);

    const matchesVisibility =
      visibility === "all" ||
      (visibility === "public" && !repo.private) ||
      (visibility === "private" && repo.private);

    return matchesSearch && matchesOwnership && matchesVisibility;
  });
}

export function getRepoCounts(repos: GithubRepo[], currentUsername: string | null | undefined) {
  const counts = {
    all: repos.length,
    owned: 0,
    collaborations: 0,
    ownedPublic: 0,
    ownedPrivate: 0,
    collaborationPublic: 0,
    collaborationPrivate: 0,
  };

  for (const repo of repos) {
    const owned = isOwnedRepo(repo, currentUsername);
    if (owned) {
      counts.owned += 1;
      if (repo.private) {
        counts.ownedPrivate += 1;
      } else {
        counts.ownedPublic += 1;
      }
    } else {
      counts.collaborations += 1;
      if (repo.private) {
        counts.collaborationPrivate += 1;
      } else {
        counts.collaborationPublic += 1;
      }
    }
  }

  return counts;
}

export function getRepoEmptyStateCopy(
  ownership: RepoOwnershipFilter,
  visibility: RepoVisibilityFilter,
  search: string
) {
  if (search.trim()) {
    return {
      title: "No repositories match this search",
      description: "Try a different name or clear the search to browse the full GitHub import list.",
      actionLabel: "Clear search",
    };
  }

  if (ownership === "owned" && visibility === "private") {
    return {
      title: "No private repositories found",
      description: "Private repositories you own will appear here as soon as GitHub returns them.",
      actionLabel: "Show all repos",
    };
  }

  if (ownership === "owned" && visibility === "public") {
    return {
      title: "No public repositories found",
      description: "Public repositories you own will appear here when they are available in your GitHub account.",
      actionLabel: "Show all repos",
    };
  }

  if (ownership === "collaborations" && visibility === "private") {
    return {
      title: "No private collaborations yet",
      description: "Private repositories shared with you will show up here when GitHub grants access.",
      actionLabel: "Show all repos",
    };
  }

  if (ownership === "collaborations" && visibility === "public") {
    return {
      title: "No public collaborations yet",
      description: "Public repositories where you collaborate will appear here once they are visible to this account.",
      actionLabel: "Show all repos",
    };
  }

  if (ownership === "collaborations") {
    return {
      title: "No collaborations yet",
      description: "Repositories owned by teammates or organizations will appear here when you have access.",
      actionLabel: "Show all repos",
    };
  }

  if (ownership === "owned") {
    return {
      title: "No repositories owned by you",
      description: "Create or connect a repository in GitHub and Launchly will surface it here for import.",
      actionLabel: "Show all repos",
    };
  }

  return {
    title: "No repositories found",
    description: "Reconnect GitHub or wait for the background sync if this account should have visible repositories.",
    actionLabel: "Reset filters",
  };
}
