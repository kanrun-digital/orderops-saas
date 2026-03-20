"use client";
import React from "react";

interface SegmentDashboardProps {
  className?: string;
  [key: string]: unknown;
}

export function SegmentDashboard({ className, ...props }: SegmentDashboardProps) {
  return (
    <div className={className} data-component="SegmentDashboard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SegmentDashboard]</p>
    </div>
  );
}

export default SegmentDashboard;
