"use client";
import React from "react";

interface CollapsibleSectionProps {
  className?: string;
  [key: string]: unknown;
}

export function CollapsibleSection({ className, ...props }: CollapsibleSectionProps) {
  return (
    <div className={className} data-component="CollapsibleSection" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CollapsibleSection]</p>
    </div>
  );
}

export default CollapsibleSection;
