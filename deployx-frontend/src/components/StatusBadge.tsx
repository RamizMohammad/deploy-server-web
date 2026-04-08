import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "live" | "building" | "failed" | "active" | "pending";
  className?: string;
}

const statusConfig = {
  live: { label: "Live", dotClass: "bg-success", bgClass: "bg-success/10 text-success" },
  active: { label: "Active", dotClass: "bg-success", bgClass: "bg-success/10 text-success" },
  building: { label: "Building", dotClass: "bg-warning animate-pulse-dot", bgClass: "bg-warning/10 text-warning" },
  pending: { label: "Pending", dotClass: "bg-warning animate-pulse-dot", bgClass: "bg-warning/10 text-warning" },
  failed: { label: "Failed", dotClass: "bg-destructive", bgClass: "bg-destructive/10 text-destructive" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", config.bgClass, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
