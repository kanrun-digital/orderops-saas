"use client";
import React from "react";

interface FilterChipsProps {
  className?: string;
  [key: string]: unknown;
}

export function FilterChips({ className, ...props }: FilterChipsProps) {
  return (
    <div className={className} data-component="FilterChips" {...props}>
      <p className="text-sm text-muted-foreground p-4">[FilterChips]</p>
    </div>
  );
}

export default FilterChips;

export interface FilterChip {
  key: string;
  label: string;
  value: string;
  onRemove?: () => void;
}
