"use client";
import React from "react";

interface OnboardingChecklistProps {
  className?: string;
  [key: string]: unknown;
}

export function OnboardingChecklist({ className, ...props }: OnboardingChecklistProps) {
  return (
    <div className={className} data-component="OnboardingChecklist" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OnboardingChecklist]</p>
    </div>
  );
}

export default OnboardingChecklist;
