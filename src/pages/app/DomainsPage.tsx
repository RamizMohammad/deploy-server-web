import { useDeploymentStore } from "@/stores/deploymentStore";
import { motion } from "framer-motion";
import { Globe, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function DomainsPage() {
  const { projects, addDomain, verifyDomain } = useDeploymentStore();
  const allDomains = projects.flatMap((p) => p.domains.map((d) => ({ ...d, projectName: p.name, projectId: p.id })));

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Domains</h1>
        <p className="text-muted-foreground mb-8">Manage custom domains across your projects.</p>
      </motion.div>

      <div className="space-y-4">
        {allDomains.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">{d.domain}</span>
                  <p className="text-xs text-muted-foreground">{d.projectName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.verified ? (
                  <span className="text-xs text-success flex items-center gap-1"><Shield className="h-3 w-3" /> SSL Active</span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => verifyDomain(d.projectId, d.id)} className="text-xs border-border/50">Verify</Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {allDomains.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No custom domains configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
