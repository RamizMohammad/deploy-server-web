import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Github, Mail, AlertTriangle, User, Bell, Trash2, LogOut, Pencil, Check } from "lucide-react";
import { PageFrame, PageHeader, SurfaceCard } from "@/components/platform/PlatformUI";
import { useAuth } from "@/hooks/useAuth";

function Section({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
    >
      <SurfaceCard className="p-6">
        <div className="mb-5 border-b border-zinc-800/70 pb-4">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </SurfaceCard>
    </motion.div>
  );
}

function InlineField({
  label,
  defaultValue,
  icon,
}: {
  label: string;
  defaultValue: string;
  icon: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [draft, setDraft] = useState(defaultValue);

  const save = () => {
    setValue(draft);
    setEditing(false);
  };

  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {icon} {label}
      </Label>
      {editing ? (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-10 border-zinc-800 bg-zinc-950 font-mono text-sm"
            autoFocus
          />
          <Button size="icon" onClick={save} className="h-10 w-10 bg-foreground text-background hover:bg-foreground/90">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="group flex items-center justify-between rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2.5">
          <span className="font-mono text-sm text-foreground">{value}</span>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [deployNotif, setDeployNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <PageFrame className="max-w-4xl">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, connected providers, notifications, and account-level controls."
      />

      <div className="space-y-5">
        <Section title="Profile" description="Your personal information." delay={0.04}>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,hsl(199,89%,48%),hsl(265,80%,60%))] text-base font-bold text-background shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                D
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Developer</p>
                <p className="text-xs text-muted-foreground">Free plan • Workspace owner</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InlineField label="Display Name" defaultValue="Developer" icon={<User className="h-3 w-3" />} />
              <InlineField label="Email" defaultValue="dev@launchly.app" icon={<Mail className="h-3 w-3" />} />
            </div>
          </div>
        </Section>

        <Section title="Connected Accounts" description="Git providers linked to your account." delay={0.08}>
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                <Github className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">GitHub</p>
                <p className="text-xs text-muted-foreground">Connected via OAuth</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-status-pulse" />
              Connected
            </span>
          </div>
        </Section>

        <Section title="Notifications" description="Choose what updates you receive." delay={0.12}>
          <div className="divide-y divide-zinc-900/80">
            {[
              { id: "email", label: "Email notifications", desc: "Receive deployment status emails", checked: emailNotif, set: setEmailNotif, icon: Mail },
              { id: "deploy", label: "Deployment alerts", desc: "Get notified on failed builds", checked: deployNotif, set: setDeployNotif, icon: Bell },
              { id: "marketing", label: "Product updates", desc: "Occasional news and tips", checked: marketingNotif, set: setMarketingNotif, icon: Bell },
            ].map((row) => (
              <div key={row.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-muted-foreground">
                    <row.icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <Label htmlFor={row.id} className="cursor-pointer text-sm font-medium text-foreground">{row.label}</Label>
                    <p className="text-xs text-muted-foreground">{row.desc}</p>
                  </div>
                </div>
                <Switch id={row.id} checked={row.checked} onCheckedChange={row.set} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Session" description="Sign out of this browser." delay={0.16}>
          <Button variant="outline" onClick={handleSignOut} className="gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-900">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </Section>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-red-500/30 bg-red-500/5 p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-300">Danger Zone</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently delete your workspace, projects, and deployment history. This cannot be undone.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2 border-red-500/40 bg-red-500/5 text-red-300 hover:bg-red-500/10 hover:text-red-200">
                  <Trash2 className="h-4 w-4" /> Delete workspace
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-red-300">
                  Reset GitHub connection
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageFrame>
  );
}
