"use client";
import React from "react";

interface IntegrationHealthMiniProps {
  className?: string;
  [key: string]: unknown;
}

export function IntegrationHealthMini({ className, ...props }: IntegrationHealthMiniProps) {
  return (
    <div className={className} data-component="IntegrationHealthMini" {...props}>
      <p className="text-sm text-muted-foreground p-4">[IntegrationHealthMini]</p>
    </div>
  );
}

export default IntegrationHealthMini;
