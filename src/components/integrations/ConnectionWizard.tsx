"use client";
import React from "react";

interface ConnectionWizardProps {
  className?: string;
  [key: string]: unknown;
}

export function ConnectionWizard({ className, ...props }: ConnectionWizardProps) {
  return (
    <div className={className} data-component="ConnectionWizard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ConnectionWizard]</p>
    </div>
  );
}

export default ConnectionWizard;
