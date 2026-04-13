import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and preferences.</p>
      </motion.div>

      <div className="space-y-6">
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Display Name</label>
              <Input defaultValue="Developer" className="bg-secondary/50 border-border/50" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Email</label>
              <Input defaultValue="dev@launchly.app" className="bg-secondary/50 border-border/50" />
            </div>
            <Button className="bg-foreground text-background hover:bg-foreground/90">Save Changes</Button>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Connected Accounts</h3>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold text-foreground">GH</div>
              <div>
                <p className="text-sm font-medium text-foreground">GitHub</p>
                <p className="text-xs text-muted-foreground">Connected as @developer</p>
              </div>
            </div>
            <span className="text-xs text-success">Connected</span>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all projects.</p>
          <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">Delete Account</Button>
        </div>
      </div>
    </div>
  );
}
