"use client";
import React from "react";

interface SegmentBadgeProps {
  className?: string;
  [key: string]: unknown;
}

export function SegmentBadge({ className, ...props }: SegmentBadgeProps) {
  return (
    <div className={className} data-component="SegmentBadge" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SegmentBadge]</p>
    </div>
  );
}

export default SegmentBadge;
