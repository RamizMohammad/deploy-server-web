import { Globe, Info, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageFrame, PageHeader, SurfaceCard } from "@/components/platform/PlatformUI";

export default function DomainsPage() {
  return (
    <PageFrame className="max-w-5xl">
      <PageHeader
        eyebrow="Networking"
        title="Domains"
        description="Prepare custom domains, SSL, and routing controls for deployed applications."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <EmptyState
          title="Domain management is coming next"
          description="Your backend currently exposes projects, deployments, logs, and GitHub repo APIs. This page is ready for the domain API when it lands."
          action={<Button variant="outline">Read setup requirements</Button>}
        />

        <div className="space-y-4">
          <SurfaceCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary"><Globe className="h-4 w-4" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Automatic routing</h3>
                <p className="mt-1 text-sm text-muted-foreground">Attach domains to deployments once the backend endpoint is available.</p>
              </div>
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300"><LockKeyhole className="h-4 w-4" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Managed SSL</h3>
                <p className="mt-1 text-sm text-muted-foreground">A future certificate worker can show verification status here.</p>
              </div>
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-300"><Info className="h-4 w-4" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Backend note</h3>
                <p className="mt-1 text-sm text-muted-foreground">No mock domains are shown. Launchly waits for real domain data.</p>
              </div>
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-accent/20 bg-accent/10 p-2 text-accent"><Sparkles className="h-4 w-4" /></div>
              <div>
                <h3 className="font-semibold text-foreground">Product-ready slot</h3>
                <p className="mt-1 text-sm text-muted-foreground">The UI is structured for verification, DNS records, and project mapping.</p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageFrame>
  );
}
