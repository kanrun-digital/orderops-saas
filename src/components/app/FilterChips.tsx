"use client";
import React from "react";

export interface FilterChip {
  key?: string;
  label: string;
  value: string;
  count?: number;
  onRemove?: () => void;
}

export interface FilterChipsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  chips?: FilterChip[];
  value?: string;
  onChange?: (value: string) => void;
  allLabel?: string;
  allCount?: unknown;
}

interface FilterChipsDisplayProps {
  className?: string;
  label: string;
  count?: unknown;
  isActive?: boolean;
  onClick?: () => void;
}

function FilterChipButton({ className, label, count, isActive = false, onClick }: FilterChipsDisplayProps) {
  return (
    <button
      type="button"
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-muted",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      <span>{label}</span>
      {typeof count === "number" || typeof count === "string" ? (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function FilterChips({
  className,
  chips = [],
  value = "all",
  onChange,
  allLabel = "All",
  allCount,
  ...props
}: FilterChipsProps) {
  return (
    <div
      className={["flex flex-wrap items-center gap-2", className].filter(Boolean).join(" ")}
      data-component="FilterChips"
      {...props}
    >
      <FilterChipButton
        label={allLabel}
        count={allCount}
        isActive={value === "all"}
        onClick={() => onChange?.("all")}
      />

      {chips.map((chip, index) => (
        <FilterChipButton
          key={chip.key ?? `${chip.value}-${index}`}
          label={chip.label}
          count={chip.count}
          isActive={chip.value === value}
          onClick={() => onChange?.(chip.value)}
        />
      ))}
    </div>
  );
}

export default FilterChips;
