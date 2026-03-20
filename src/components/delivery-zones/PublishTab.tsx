"use client";
import React from "react";

interface PublishTabProps {
  className?: string;
  [key: string]: unknown;
}

export function PublishTab({ className, ...props }: PublishTabProps) {
  return (
    <div className={className} data-component="PublishTab" {...props}>
      <p className="text-sm text-muted-foreground p-4">[PublishTab]</p>
    </div>
  );
}

export default PublishTab;
