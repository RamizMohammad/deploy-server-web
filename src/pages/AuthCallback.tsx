import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, setToken, type GithubRepo } from "@/lib/api";
import { queryClient, queryKeys } from "@/lib/query";
import { Loader2 } from "lucide-react";

const REPO_BATCH_SIZE = 10;

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      queryClient.clear();
      setToken(token);
      queryClient.prefetchInfiniteQuery({
        queryKey: [...queryKeys.githubRepos, "infinite", REPO_BATCH_SIZE],
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
          api.get<GithubRepo[]>(`/auth/github/repos?page=${pageParam}&per_page=${REPO_BATCH_SIZE}`),
        getNextPageParam: (lastPage, allPages) =>
          lastPage.length === REPO_BATCH_SIZE ? allPages.length + 1 : undefined,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
      });
      navigate("/app", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
