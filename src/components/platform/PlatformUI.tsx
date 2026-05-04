import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import type React from "react";
import {
  CheckCircle2,
  CircleDashed,
  Lock,
  XCircle,
  Globe,
  Loader2,
  ArrowUpRight,
  Terminal,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Deployment, GithubRepo } from "@/lib/api";
import type { RepoOwnershipFilter, RepoVisibilityFilter } from "@/lib/github-repos";

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

function getLanguageWatermark(language?: string | null) {
  if (!language) return "CODE";

  const normalized = language.trim().toLowerCase();
  const map: Record<string, string> = {
    javascript: "JS",
    typescript: "TS",
    python: "PY",
    html: "HTML",
    css: "CSS",
    shell: "SH",
    markdown: "MD",
    dockerfile: "DOCKER",
    go: "GO",
    rust: "RS",
    java: "JAVA",
    php: "PHP",
  };

  if (map[normalized]) {
    return map[normalized];
  }

  return language.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "CODE";
}

function formatUpdatedAt(updatedAt?: string) {
  if (!updatedAt) return "recently";

  try {
    return formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
  } catch {
    return "recently";
  }
}

export function PageFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div {...pageMotion} className={cn("mx-auto w-full max-w-7xl px-6 py-8 md:px-10", className)}>
      {children}
    </motion.div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary/80">{eyebrow}</p>}
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function SurfaceCard({
  children,
  className,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_80px_rgba(0,0,0,0.35)]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]",
        interactive && "transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_90px_rgba(14,165,233,0.12)]",
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );

  return interactive ? (
    <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.2 }}>
      {content}
    </motion.div>
  ) : (
    content
  );
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection = "up",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend: string;
  trendDirection?: "up" | "down" | "flat";
}) {
  const trendStyles =
    trendDirection === "down"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : trendDirection === "flat"
        ? "border-zinc-700 bg-zinc-900/70 text-zinc-400"
        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  const TrendArrow = trendDirection === "down" ? "↓" : trendDirection === "flat" ? "→" : "↑";
  return (
    <SurfaceCard interactive className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-2 text-primary transition group-hover:border-primary/40 group-hover:text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={cn("mt-5 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs", trendStyles)}>
        <span className="font-mono">{TrendArrow}</span>
        {trend}
      </div>
    </SurfaceCard>
  );
}

export function StatusBadge({ status, size = "md" }: { status?: string; size?: "sm" | "md" }) {
  const normalized = status || "queued";
  const config: Record<string, { label: string; className: string; dotClassName: string; icon?: React.ReactNode }> = {
    success: {
      label: "Live",
      className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
      dotClassName: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-status-pulse",
    },
    building: {
      label: "Building",
      className: "border-amber-500/25 bg-amber-500/10 text-amber-300",
      dotClassName: "bg-amber-300",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    failed: {
      label: "Failed",
      className: "border-red-500/25 bg-red-500/10 text-red-300",
      dotClassName: "bg-red-400",
      icon: <XCircle className="h-3 w-3" />,
    },
    queued: {
      label: "Queued",
      className: "border-zinc-700 bg-zinc-900/80 text-zinc-400",
      dotClassName: "bg-zinc-500",
      icon: <CircleDashed className="h-3 w-3" />,
    },
  };
  const current = config[normalized] || config.queued;
  const sizing = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide", sizing, current.className)}>
      {current.icon ?? <span className={cn("h-1.5 w-1.5 rounded-full", current.dotClassName)} />}
      {current.label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <SurfaceCard className="p-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.25),transparent_60%)] text-primary shadow-[0_0_40px_rgba(14,165,233,0.18)]">
        {icon ?? <RocketGlyph />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </SurfaceCard>
  );
}

function RocketGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.5 4.5c2.2-.7 4.2-.6 5-.1.4.7.6 2.8-.1 5-1.1 3.6-4.5 6.5-8.4 7.3l-3.8.8.8-3.8c.8-3.9 3.7-7.3 6.5-9.2Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.2 15.4 6 18.6M13.7 8.7h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function DeploymentItem({ deployment, onClick }: { deployment: Deployment; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-zinc-900/80 px-5 py-4 text-left transition hover:bg-white/[0.035]"
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", deployment.status === "success" ? "bg-emerald-400" : deployment.status === "failed" ? "bg-red-400" : "bg-amber-300 animate-pulse")} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{deployment.project_name}</p>
        <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{deployment.commit_hash || "manual deploy"}</p>
      </div>
      <div className="text-right">
        <StatusBadge status={deployment.status} />
        <p className="mt-1 text-xs text-muted-foreground">{deployment.duration ? `${deployment.duration}s` : "in progress"}</p>
      </div>
    </button>
  );
}

export function RepoCard({
  repo,
  onImport,
  actionLabel = "Pull",
  ownership = "owner",
}: {
  repo: GithubRepo;
  onImport: () => void;
  actionLabel?: string;
  ownership?: "owner" | "collaborator";
}) {
  const ownershipLabel = ownership === "owner" ? "Your repository" : "Collaboration";
  const updatedLabel = formatUpdatedAt(repo.updated_at);
  const watermark = getLanguageWatermark(repo.language);

  return (
    <SurfaceCard interactive className="h-full p-5 md:p-6">
      <div className="pointer-events-none absolute right-4 top-3 select-none text-[56px] font-semibold tracking-tight text-white/[0.06] blur-[0.2px] md:text-[72px]">
        {watermark}
      </div>

      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Github className="h-4 w-4 text-primary" />
              <p className="truncate text-sm font-semibold text-foreground md:text-base">{repo.name}</p>
              <RepoVisibilityBadge isPrivate={repo.private} />
              <RepoOwnershipBadge ownership={ownership} />
            </div>
            <p className="mt-2 truncate text-xs text-muted-foreground md:text-sm">{repo.full_name}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-zinc-800 bg-zinc-900/90 px-2.5 py-1">{repo.language || "Code"}</span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/90 px-2.5 py-1">{repo.default_branch || "main"}</span>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              <p>{ownershipLabel}</p>
              <p className="mt-1">Updated {updatedLabel}</p>
            </div>
            <Button
              size="sm"
              onClick={onImport}
              className="h-9 gap-2 rounded-md border border-primary/25 bg-primary/10 text-primary transition hover:scale-[1.02] hover:border-primary/40 hover:bg-primary/15 hover:text-primary"
            >
              <Github className="h-4 w-4" />
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function RepoVisibilityBadge({ isPrivate }: { isPrivate: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
        isPrivate
          ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      )}
    >
      {isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
      {isPrivate ? "Private" : "Public"}
    </span>
  );
}

export function RepoOwnershipBadge({ ownership }: { ownership: "owner" | "collaborator" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
        ownership === "owner"
          ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
          : "border-violet-500/20 bg-violet-500/10 text-violet-300"
      )}
    >
      {ownership === "owner" ? "Owner" : "Collaborator"}
    </span>
  );
}

export function RepoFilterTabs({
  ownership,
  visibility,
  onOwnershipChange,
  onVisibilityChange,
}: {
  ownership: RepoOwnershipFilter;
  visibility: RepoVisibilityFilter;
  onOwnershipChange: (value: RepoOwnershipFilter) => void;
  onVisibilityChange: (value: RepoVisibilityFilter) => void;
}) {
  const ownershipOptions: Array<{ value: RepoOwnershipFilter; label: string }> = [
    { value: "owned", label: "Owned" },
    { value: "collaborations", label: "Collaborations" },
  ];

  const visibilityOptions: Array<{ value: RepoVisibilityFilter; label: string }> = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="inline-flex h-11 w-full max-w-xl items-center rounded-lg border border-zinc-800/80 bg-zinc-950/70 p-1">
        {ownershipOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onOwnershipChange(option.value)}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center rounded-md px-3 py-2 text-sm transition",
              ownership === option.value ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="truncate">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="inline-flex h-10 items-center self-start rounded-lg border border-zinc-800/80 bg-zinc-950/70 p-1">
        {visibilityOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onVisibilityChange(option.value)}
            className={cn(
              "inline-flex items-center rounded-md px-4 py-1.5 text-sm transition",
              visibility === option.value ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LogViewer({
  title,
  logs,
  streaming = false,
  status,
}: {
  title: string;
  logs: string;
  streaming?: boolean;
  status?: string;
}) {
  const lines = logs ? logs.split("\n") : [];
  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-black/50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          {title}
        </span>
        {status && (
          <div className="ml-auto">
            <StatusBadge status={status} size="sm" />
          </div>
        )}
      </div>
      <div className="terminal-bg max-h-[460px] overflow-y-auto p-4 scrollbar-thin">
        {lines.length > 0 ? (
          <>
            {lines.map((line, index) => {
              const tone = /error|fail|fatal/i.test(line)
                ? "text-red-300"
                : /warn/i.test(line)
                  ? "text-amber-300"
                  : /success|complete|live|ready|✓|done/i.test(line)
                    ? "text-emerald-300"
                    : /^\$|^>/.test(line)
                      ? "text-primary"
                      : "text-zinc-300/90";
              return (
                <motion.p
                  key={`${index}-${line.slice(0, 24)}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.012, 0.35), duration: 0.18 }}
                  className={cn("flex gap-3 font-mono text-[13px] leading-6", tone)}
                >
                  <span className="w-8 shrink-0 select-none text-right font-mono text-zinc-700">{String(index + 1).padStart(3, " ")}</span>
                  <span className="whitespace-pre-wrap break-all">{line || "\u00A0"}</span>
                </motion.p>
              );
            })}
            {streaming && (
              <p className="ml-11 mt-1 inline-flex items-center gap-1 font-mono text-[13px] text-emerald-300">
                <span className="inline-block h-3.5 w-1.5 animate-blink-caret bg-emerald-300" />
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 font-mono text-sm text-zinc-600">
            <span className="inline-block h-3.5 w-1.5 animate-blink-caret bg-zinc-500" />
            <span>Waiting for log stream…</span>
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition",
              index <= current ? "border-primary/40 bg-primary/15 text-primary" : "border-zinc-800 bg-zinc-950 text-zinc-500"
            )}
          >
            {index < current ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
          </div>
          <span className={cn("hidden text-xs md:inline", index <= current ? "text-foreground" : "text-muted-foreground")}>{step}</span>
          {index < steps.length - 1 && <div className={cn("h-px flex-1", index < current ? "bg-primary/50" : "bg-zinc-800")} />}
        </div>
      ))}
    </div>
  );
}

export function SkeletonPanel({ rows = 3 }: { rows?: number }) {
  return (
    <SurfaceCard className="p-5">
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-12 overflow-hidden rounded-md bg-zinc-900">
            <div className="h-full w-1/2 animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
