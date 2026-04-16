import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { api, type GithubRepo } from "@/lib/api";
import { queryKeys } from "@/lib/query";

const REPO_BATCH_SIZE = 10;

export function AppLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
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
  }, [queryClient]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/30 px-4 shrink-0">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </SidebarProvider>
  );
}
