"use client";
import React from "react";

interface CourierDetailSheetProps {
  className?: string;
  [key: string]: unknown;
}

export function CourierDetailSheet({ className, ...props }: CourierDetailSheetProps) {
  return (
    <div className={className} data-component="CourierDetailSheet" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CourierDetailSheet]</p>
    </div>
  );
}

export default CourierDetailSheet;
