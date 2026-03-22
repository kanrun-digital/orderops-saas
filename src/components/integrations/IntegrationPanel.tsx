"use client";

import React, { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Clock3, Link2Off, RefreshCw, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeShort } from "@/lib/utils/formatTime";

export type IntegrationStatus = "connected" | "syncing" | "error" | "disabled" | "disconnected" | string;

interface IntegrationPanelProps {
  provider: string;
  icon: LucideIcon;
  name: string;
  status: IntegrationStatus;
  lastSyncAt?: string | null;
  metric?: string | null;
  typeBadge?: string | null;
  children?: ReactNode;
  className?: string;
}

const statusConfig: Record<string, { label: string; icon: LucideIcon; classes: string }> = {
  connected: { label: "Connected", icon: BadgeCheck, classes: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  syncing: { label: "Syncing", icon: RefreshCw, classes: "bg-sky-500/10 text-sky-700 border-sky-200" },
  error: { label: "Needs attention", icon: ShieldAlert, classes: "bg-rose-500/10 text-rose-700 border-rose-200" },
  disabled: { label: "Disabled", icon: Link2Off, classes: "bg-slate-500/10 text-slate-700 border-slate-200" },
  disconnected: { label: "Disconnected", icon: Link2Off, classes: "bg-amber-500/10 text-amber-700 border-amber-200" },
};

export function IntegrationPanel({
  provider,
  icon: Icon,
  name,
  status,
  lastSyncAt,
  metric,
  typeBadge,
  children,
  className,
}: IntegrationPanelProps) {
  const config = statusConfig[status] ?? statusConfig.disconnected;
  const StatusIcon = config.icon;

  return (
    <Card className={cn("overflow-hidden border-border/70", className)} data-provider={provider}>
      <CardHeader className="gap-4 border-b bg-muted/20 px-6 py-5 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold leading-none">{name}</h3>
              {typeBadge ? (
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {typeBadge}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium", config.classes)}>
                <StatusIcon className={cn("h-3.5 w-3.5", status === "syncing" && "animate-spin")} />
                {config.label}
              </span>

              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {lastSyncAt ? `Last sync ${formatRelativeShort(lastSyncAt)}` : "No sync history yet"}
              </span>
            </div>

            {metric ? <p className="text-sm text-muted-foreground">{metric}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled>
            Manage
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled>
            Sync now
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 py-5">{children}</CardContent>
    </Card>
  );
}

export default IntegrationPanel;
