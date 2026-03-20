"use client";
import React from "react";

interface MappingHubProps {
  className?: string;
  [key: string]: unknown;
}

export function MappingHub({ className, ...props }: MappingHubProps) {
  return (
    <div className={className} data-component="MappingHub" {...props}>
      <p className="text-sm text-muted-foreground p-4">[MappingHub]</p>
    </div>
  );
}

export default MappingHub;
