"use client";
import React from "react";

interface TestRoutingTabProps {
  className?: string;
  [key: string]: unknown;
}

export function TestRoutingTab({ className, ...props }: TestRoutingTabProps) {
  return (
    <div className={className} data-component="TestRoutingTab" {...props}>
      <p className="text-sm text-muted-foreground p-4">[TestRoutingTab]</p>
    </div>
  );
}

export default TestRoutingTab;
