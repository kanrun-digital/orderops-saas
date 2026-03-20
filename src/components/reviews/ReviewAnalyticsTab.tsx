"use client";
import React from "react";

interface ReviewAnalyticsTabProps {
  className?: string;
  [key: string]: unknown;
}

export function ReviewAnalyticsTab({ className, ...props }: ReviewAnalyticsTabProps) {
  return (
    <div className={className} data-component="ReviewAnalyticsTab" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ReviewAnalyticsTab]</p>
    </div>
  );
}

export default ReviewAnalyticsTab;
