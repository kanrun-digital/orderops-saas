"use client";
import React from "react";

export interface DataToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  selectedCount?: number;
  filters?: React.ReactNode;
  bulkActions?: React.ReactNode;
}

export function DataToolbar({
  className,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search",
  selectedCount = 0,
  filters,
  bulkActions,
  ...props
}: DataToolbarProps) {
  return (
    <div
      className={[
        "flex flex-col gap-3 rounded-xl border bg-card/50 p-3 md:flex-row md:items-center md:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-component="DataToolbar"
      {...props}
    >
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring md:max-w-sm"
        />
        {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      </div>

      {(selectedCount > 0 || bulkActions) && (
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {selectedCount > 0 ? (
            <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
          ) : null}
          {bulkActions}
        </div>
      )}
    </div>
  );
}

export default DataToolbar;
