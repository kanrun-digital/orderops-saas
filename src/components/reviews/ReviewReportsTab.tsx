"use client";
import React from "react";

interface ReviewReportsTabProps {
  className?: string;
  [key: string]: unknown;
}

export function ReviewReportsTab({ className, ...props }: ReviewReportsTabProps) {
  return (
    <div className={className} data-component="ReviewReportsTab" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ReviewReportsTab]</p>
    </div>
  );
}

export default ReviewReportsTab;
