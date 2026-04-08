import { useEffect, useState } from "react";
import { mockBuildLogs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";

interface LogViewerProps {
  status?: "live" | "building" | "failed";
}

export function LogViewer({ status = "live" }: LogViewerProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (status === "building") {
      const interval = setInterval(() => {
        setVisibleLines((prev) => {
          if (prev >= mockBuildLogs.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 300);
      return () => clearInterval(interval);
    } else {
      setVisibleLines(mockBuildLogs.length);
    }
  }, [status]);

  const logs = mockBuildLogs.slice(0, visibleLines);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <span className="text-sm font-medium">Build Logs</span>
        <StatusBadge status={status} />
      </div>
      <div className="p-4 font-mono text-xs leading-6 max-h-[500px] overflow-auto bg-background">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 hover:bg-muted/30 px-1 rounded">
            <span className="text-muted-foreground select-none shrink-0">{log.time}</span>
            <span className="text-foreground/90">{log.text}</span>
          </div>
        ))}
        {status === "building" && visibleLines < mockBuildLogs.length && (
          <div className="flex gap-3 px-1">
            <span className="text-muted-foreground">...</span>
            <span className="animate-pulse text-muted-foreground">▊</span>
          </div>
        )}
      </div>
    </div>
  );
}
