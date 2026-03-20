"use client";
import React from "react";

interface ReviewSettingsTabProps {
  className?: string;
  [key: string]: unknown;
}

export function ReviewSettingsTab({ className, ...props }: ReviewSettingsTabProps) {
  return (
    <div className={className} data-component="ReviewSettingsTab" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ReviewSettingsTab]</p>
    </div>
  );
}

export default ReviewSettingsTab;
