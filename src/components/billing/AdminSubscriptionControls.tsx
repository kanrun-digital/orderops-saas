"use client";
import React from "react";

interface AdminSubscriptionControlsProps {
  className?: string;
  [key: string]: unknown;
}

export function AdminSubscriptionControls({ className, ...props }: AdminSubscriptionControlsProps) {
  return (
    <div className={className} data-component="AdminSubscriptionControls" {...props}>
      <p className="text-sm text-muted-foreground p-4">[AdminSubscriptionControls]</p>
    </div>
  );
}

export default AdminSubscriptionControls;
