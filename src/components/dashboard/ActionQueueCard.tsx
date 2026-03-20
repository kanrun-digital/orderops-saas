"use client";
import React from "react";

interface ActionQueueCardProps {
  className?: string;
  [key: string]: unknown;
}

export function ActionQueueCard({ className, ...props }: ActionQueueCardProps) {
  return (
    <div className={className} data-component="ActionQueueCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ActionQueueCard]</p>
    </div>
  );
}

export default ActionQueueCard;
