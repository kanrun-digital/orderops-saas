"use client";
import React from "react";

interface OrderSyncTimelineProps {
  className?: string;
  [key: string]: unknown;
}

export function OrderSyncTimeline({ className, ...props }: OrderSyncTimelineProps) {
  return (
    <div className={className} data-component="OrderSyncTimeline" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OrderSyncTimeline]</p>
    </div>
  );
}

export default OrderSyncTimeline;
