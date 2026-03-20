"use client";
import React from "react";

interface MappingTabProps {
  className?: string;
  [key: string]: unknown;
}

export function MappingTab({ className, ...props }: MappingTabProps) {
  return (
    <div className={className} data-component="MappingTab" {...props}>
      <p className="text-sm text-muted-foreground p-4">[MappingTab]</p>
    </div>
  );
}

export default MappingTab;
