import { useEffect, useState } from "react";
import { getGithubRepos, type GithubRepo } from "@/lib/api";

export const useRepos = () => {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const data = await getGithubRepos();
        setRepos(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch repositories";
        setError(message);
        console.error("Failed to fetch repos", err);
      } finally {
        setLoading(false);
      }
    };

    loadRepos();
  }, []);

  return { repos, loading, error };
};
