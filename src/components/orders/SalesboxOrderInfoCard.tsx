"use client";
import React from "react";

interface SalesboxOrderInfoCardProps {
  className?: string;
  [key: string]: unknown;
}

export function SalesboxOrderInfoCard({ className, ...props }: SalesboxOrderInfoCardProps) {
  return (
    <div className={className} data-component="SalesboxOrderInfoCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SalesboxOrderInfoCard]</p>
    </div>
  );
}

export default SalesboxOrderInfoCard;
