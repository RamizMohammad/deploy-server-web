import { motion } from "framer-motion";
import { Globe, Info } from "lucide-react";

export default function DomainsPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Domains</h1>
        <p className="text-muted-foreground mb-8">Manage custom domains across your projects.</p>
      </motion.div>

      <div className="glass rounded-xl p-10 text-center">
        <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-medium mb-2">Domain management is not available yet</p>
        <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
          <Info className="h-4 w-4" />
          Your backend currently exposes projects, deployments, logs, and GitHub repo APIs only.
        </p>
      </div>
    </div>
  );
}
