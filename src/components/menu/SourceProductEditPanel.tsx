"use client";
import React from "react";

interface SourceProductEditPanelProps {
  className?: string;
  [key: string]: unknown;
}

export function SourceProductEditPanel({ className, ...props }: SourceProductEditPanelProps) {
  return (
    <div className={className} data-component="SourceProductEditPanel" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SourceProductEditPanel]</p>
    </div>
  );
}

export default SourceProductEditPanel;
