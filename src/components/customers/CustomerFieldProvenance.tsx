"use client";
import React from "react";

interface CustomerFieldProvenanceProps {
  className?: string;
  [key: string]: unknown;
}

export function CustomerFieldProvenance({ className, ...props }: CustomerFieldProvenanceProps) {
  return (
    <div className={className} data-component="CustomerFieldProvenance" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CustomerFieldProvenance]</p>
    </div>
  );
}

export default CustomerFieldProvenance;
