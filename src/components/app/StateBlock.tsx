"use client";
import React from "react";

interface StateBlockProps {
  className?: string;
  [key: string]: unknown;
}

export function StateBlock({ className, ...props }: StateBlockProps) {
  return (
    <div className={className} data-component="StateBlock" {...props}>
      <p className="text-sm text-muted-foreground p-4">[StateBlock]</p>
    </div>
  );
}

export default StateBlock;
