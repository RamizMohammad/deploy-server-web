import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Github, Mail, AlertTriangle, User, Bell } from "lucide-react";
import { useState } from "react";

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-xl p-6"
  >
    <div className="mb-5">
      <h3 className="font-semibold text-foreground text-base">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    {children}
  </motion.div>
);

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [deployNotif, setDeployNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account, integrations, and preferences.</p>
      </motion.div>

      <div className="space-y-5">
        <Section title="Profile" description="Your personal information.">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-bold text-lg">
                D
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Developer</p>
                <p className="text-xs text-muted-foreground">Free plan</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1.5"><User className="h-3 w-3" /> Display Name</Label>
                <Input defaultValue="Developer" className="bg-secondary/50 border-border/50" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email</Label>
                <Input defaultValue="dev@launchly.app" className="bg-secondary/50 border-border/50" />
              </div>
            </div>
            <Button className="bg-foreground text-background hover:bg-foreground/90">Save Changes</Button>
          </div>
        </Section>

        <Section title="Connected Accounts" description="Git providers linked to your account.">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                <Github className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">GitHub</p>
                <p className="text-xs text-muted-foreground">Connected as @developer</p>
              </div>
            </div>
            <span className="text-xs text-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Connected
            </span>
          </div>
        </Section>

        <Section title="Notifications" description="Choose what updates you receive.">
          <div className="space-y-4">
            {[
              { id: "email", label: "Email notifications", desc: "Receive deployment status emails", checked: emailNotif, set: setEmailNotif, icon: Mail },
              { id: "deploy", label: "Deployment alerts", desc: "Get notified on failed builds", checked: deployNotif, set: setDeployNotif, icon: Bell },
              { id: "marketing", label: "Product updates", desc: "Occasional news and tips", checked: marketingNotif, set: setMarketingNotif, icon: Bell },
            ].map((row) => (
              <div key={row.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <row.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor={row.id} className="text-sm font-medium text-foreground cursor-pointer">{row.label}</Label>
                    <p className="text-xs text-muted-foreground">{row.desc}</p>
                  </div>
                </div>
                <Switch id={row.id} checked={row.checked} onCheckedChange={row.set} />
              </div>
            ))}
          </div>
        </Section>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 border border-destructive/30 bg-destructive/5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-destructive text-base">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all associated projects. This cannot be undone.</p>
            </div>
          </div>
          <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
            Delete Account
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
