import { useState } from "react";
import { Globe, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { mockDomains } from "@/lib/mock-data";

const DomainsPage = () => {
  const [newDomain, setNewDomain] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Domains</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage custom domains for your projects.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Domain</CardTitle>
          <CardDescription>Enter your custom domain name to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="example.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} className="max-w-sm" />
            <Button className="gap-1.5"><Plus className="h-4 w-4" />Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Domain</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>SSL</TableHead>
              <TableHead className="hidden sm:table-cell">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDomains.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />{d.domain}</TableCell>
                <TableCell className="text-muted-foreground">{d.project}</TableCell>
                <TableCell><StatusBadge status={d.sslStatus === "active" ? "active" : d.sslStatus === "pending" ? "pending" : "failed"} /></TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{d.addedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />DNS Configuration</CardTitle>
          <CardDescription>Add these DNS records to your domain provider.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm space-y-2">
            <div className="flex gap-8"><span className="text-muted-foreground w-16">Type</span><span className="text-muted-foreground w-24">Name</span><span>Value</span></div>
            <div className="flex gap-8"><span className="w-16">CNAME</span><span className="w-24">www</span><span>cname.deploy.app</span></div>
            <div className="flex gap-8"><span className="w-16">A</span><span className="w-24">@</span><span>76.76.21.21</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainsPage;
