import { Bell, Github, ShieldAlert, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageFrame, PageHeader, SurfaceCard } from "@/components/platform/PlatformUI";

export default function SettingsPage() {
  return (
    <PageFrame className="max-w-5xl">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage account identity, connected providers, notifications, and high-risk workspace actions."
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <SurfaceCard className="h-fit p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Developer</p>
              <p className="text-xs text-muted-foreground">Launchly workspace</p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            GitHub connected and deployments enabled.
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionHeader icon={UserRound} title="Profile" description="This information is visible inside Launchly activity and deployment records." />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">Display Name</span>
                <Input defaultValue="Developer" className="border-zinc-800 bg-zinc-950/70" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted-foreground">Email</span>
                <Input defaultValue="dev@launchly.systems" className="border-zinc-800 bg-zinc-950/70" />
              </label>
            </div>
            <Button className="mt-5 bg-foreground text-background hover:bg-foreground/90">Save Changes</Button>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader icon={Github} title="Connected Accounts" description="Launchly uses GitHub to discover repositories and start deployments." />
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">GH</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">GitHub</p>
                    <p className="text-xs text-muted-foreground">Connected as @developer</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Connected</span>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionHeader icon={Bell} title="Notifications" description="Choose which deployment events should surface in your workspace." />
            <div className="mt-6 space-y-4">
              <ToggleRow title="Deployment failures" description="Notify me when a build fails or exits unexpectedly." defaultChecked />
              <ToggleRow title="Successful releases" description="Show a confirmation after production deploys go live." defaultChecked />
              <ToggleRow title="Background repo sync" description="Surface GitHub sync status while repositories warm in batches." defaultChecked />
            </div>
          </SurfaceCard>

          <SurfaceCard className="border-red-500/20 p-6">
            <SectionHeader icon={ShieldAlert} title="Danger Zone" description="High-risk actions that can affect every project in this workspace." destructive />
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Delete workspace</p>
                  <p className="mt-1 text-sm text-muted-foreground">Permanently remove account data, projects, and deployment history.</p>
                </div>
                <Button variant="outline" className="border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200">Delete Account</Button>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}

function SectionHeader({ icon: Icon, title, description, destructive = false }: { icon: typeof Zap; title: string; description: string; destructive?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={destructive ? "rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300" : "rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary"}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className={destructive ? "font-semibold text-red-200" : "font-semibold text-foreground"}>{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ToggleRow({ title, description, defaultChecked }: { title: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
