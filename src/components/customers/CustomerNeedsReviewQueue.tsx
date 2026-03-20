"use client";
import React from "react";

interface CustomerNeedsReviewQueueProps {
  className?: string;
  [key: string]: unknown;
}

export function CustomerNeedsReviewQueue({ className, ...props }: CustomerNeedsReviewQueueProps) {
  return (
    <div className={className} data-component="CustomerNeedsReviewQueue" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CustomerNeedsReviewQueue]</p>
    </div>
  );
}

export default CustomerNeedsReviewQueue;
