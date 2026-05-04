import { ChangeEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Mail, AlertTriangle, User, Bell, Trash2, LogOut, RefreshCcw, Upload, LoaderCircle } from "lucide-react";
import { PageFrame, PageHeader, SurfaceCard } from "@/components/platform/PlatformUI";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authMeQueryOptions, queryClient, queryKeys } from "@/lib/query";
import { api, loginWithGithub, type AuthUser } from "@/lib/api";

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
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {icon} {label}
      </Label>
      <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/60 px-3 py-2.5">
        <span className="font-mono text-sm text-foreground">{value}</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [deployNotif, setDeployNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { logout } = useAuth();
  const { data: user, isLoading: userLoading } = useQuery(authMeQueryOptions);
  const username = user?.github_username || (userLoading ? "Loading..." : "Not connected");
  const email = user?.email || (userLoading ? "Loading..." : "No email available");
  const profileInitial = (user?.github_username || user?.email || "L").slice(0, 1).toUpperCase();
  const githubConnected = Boolean(user?.github_username);

  const uploadImageMutation = useMutation({
    mutationFn: async (selectedFile: File) => {
      const formData = new FormData();
      formData.append("file", selectedFile);
      return api.postForm<{
        ok: boolean;
        image_token: string;
        image_url: string;
      }>("/auth/me/image", formData);
    },
    onSuccess: (payload) => {
      queryClient.setQueryData<AuthUser | undefined>(queryKeys.authMe, (currentUser) =>
        currentUser
          ? {
              ...currentUser,
              image_token: payload.image_token,
              image_url: payload.image_url,
            }
          : currentUser
      );
      toast.success("Profile picture updated.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to upload profile picture.");
    },
  });

  const handleSignOut = () => {
    logout();
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    await uploadImageMutation.mutateAsync(selectedFile);
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
              <Avatar className="h-14 w-14 rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,hsl(199,89%,48%),hsl(265,80%,60%))] shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                {user?.image_url ? <AvatarImage src={user.image_url} alt={`${username} profile`} className="object-cover" /> : null}
                <AvatarFallback className="rounded-2xl bg-transparent text-base font-bold text-background">
                  {profileInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{username}</p>
                <p className="text-xs text-muted-foreground">Free plan • Workspace owner</p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageSelected}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleProfileImageClick}
                  disabled={uploadImageMutation.isPending}
                  className="gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
                >
                  {uploadImageMutation.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {user?.image_url ? "Change photo" : "Upload photo"}
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, or GIF</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InlineField label="Username" value={username} icon={<User className="h-3 w-3" />} />
              <InlineField label="Email" value={email} icon={<Mail className="h-3 w-3" />} />
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
                <p className="text-xs text-muted-foreground">
                  {githubConnected ? `Connected as ${user?.github_username}` : "Reconnect GitHub to import repositories"}
                </p>
              </div>
            </div>
            {githubConnected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-status-pulse" />
                Connected
              </span>
            ) : (
              <Button size="sm" variant="outline" onClick={loginWithGithub} className="gap-2 border-zinc-800 bg-zinc-950 hover:bg-zinc-900">
                <RefreshCcw className="h-3.5 w-3.5" /> Connect
              </Button>
            )}
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
                <Button
                  variant="outline"
                  onClick={() => toast.info("Workspace deletion is not available until the account API is connected.")}
                  className="gap-2 border-red-500/40 bg-red-500/5 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                >
                  <Trash2 className="h-4 w-4" /> Delete workspace
                </Button>
                <Button
                  variant="ghost"
                  onClick={loginWithGithub}
                  className="text-muted-foreground hover:text-red-300"
                >
                  Reconnect GitHub
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageFrame>
  );
}
