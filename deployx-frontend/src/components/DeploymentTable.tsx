import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, GitCommit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Deployment } from "@/lib/mock-data";

interface DeploymentTableProps {
  deployments: Deployment[];
}

export function DeploymentTable({ deployments }: DeploymentTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Commit</TableHead>
            <TableHead className="hidden sm:table-cell">Duration</TableHead>
            <TableHead className="hidden sm:table-cell">Time</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((d) => (
            <TableRow key={d.id} className="cursor-pointer">
              <TableCell className="font-medium">{d.projectName}</TableCell>
              <TableCell><StatusBadge status={d.status} /></TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <GitCommit className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px]">{d.commit}</span>
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{d.duration}</TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{d.timestamp}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
