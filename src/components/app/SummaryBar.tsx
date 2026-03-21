"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SummaryItem {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "flat";
  icon?: React.ReactNode;
  highlight?: "warning" | "success" | "destructive";
}

interface SummaryBarProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: SummaryItem[];
}

const itemHighlightClasses: Record<NonNullable<SummaryItem["highlight"]>, string> = {
  warning: "border-warning/30 bg-warning/5 text-warning",
  success: "border-success/30 bg-success/5 text-success",
  destructive: "border-destructive/30 bg-destructive/5 text-destructive",
};

const valueHighlightClasses: Record<NonNullable<SummaryItem["highlight"]>, string> = {
  warning: "text-warning",
  success: "text-success",
  destructive: "text-destructive",
};

const trendClasses: Record<NonNullable<SummaryItem["trend"]>, string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

function formatChange(change: number) {
  if (change === 0) return "0%";
  return `${change > 0 ? "+" : ""}${change}%`;
}

export function SummaryBar({ className, items = [], ...props }: SummaryBarProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground",
          className,
        )}
        data-component="SummaryBar"
        {...props}
      >
        No summary data available.
      </div>
    );
  }

  return (
    <div
      className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-4", className)}
      data-component="SummaryBar"
      {...props}
    >
      {items.map((item, index) => {
        const highlightClass = item.highlight ? itemHighlightClasses[item.highlight] : "border-border bg-card";
        const valueClass = item.highlight ? valueHighlightClasses[item.highlight] : "text-foreground";

        return (
          <div
            key={`${item.label}-${index}`}
            className={cn(
              "flex min-w-0 items-start gap-3 rounded-xl border px-4 py-3 shadow-sm transition-colors",
              highlightClass,
            )}
          >
            {item.icon ? (
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/80 text-muted-foreground",
                  item.highlight && valueHighlightClasses[item.highlight],
                )}
              >
                {item.icon}
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate text-sm text-muted-foreground">{item.label}</p>
                {typeof item.change === "number" ? (
                  <span className={cn("shrink-0 text-xs font-medium", trendClasses[item.trend ?? "flat"])}>
                    {formatChange(item.change)}
                  </span>
                ) : null}
              </div>

              <p className={cn("mt-1 text-2xl font-semibold tracking-tight", valueClass)}>{item.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryBar;
