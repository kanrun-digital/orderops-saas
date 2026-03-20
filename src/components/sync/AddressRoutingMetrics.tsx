"use client";
import React from "react";

interface AddressRoutingMetricsProps {
  className?: string;
  [key: string]: unknown;
}

export function AddressRoutingMetrics({ className, ...props }: AddressRoutingMetricsProps) {
  return (
    <div className={className} data-component="AddressRoutingMetrics" {...props}>
      <p className="text-sm text-muted-foreground p-4">[AddressRoutingMetrics]</p>
    </div>
  );
}

export default AddressRoutingMetrics;
