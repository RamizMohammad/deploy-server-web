import { Outlet } from "react-router-dom";
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { Activity, Command, Sparkles } from "lucide-react";

export function AppLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full overflow-hidden bg-[#070A0F] text-foreground">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%)]" />
        <div className="pointer-events-none fixed inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />
        <AppSidebar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-zinc-800/70 bg-[#070A0F]/75 px-4 backdrop-blur-2xl md:px-6">
            <SidebarTrigger className="mr-3 rounded-md border border-zinc-800/80 bg-zinc-950/60 transition hover:border-primary/40 hover:bg-primary/10" />
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-950/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground md:flex"
            >
              <Command className="h-3.5 w-3.5" />
              Command center
              <kbd className="rounded border border-zinc-800 bg-black/40 px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 sm:flex">
                <Activity className="h-3.5 w-3.5" />
                Systems operational
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_rgba(14,165,233,0.18)]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </header>
          <main className="relative flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
    </SidebarProvider>
  );
}
