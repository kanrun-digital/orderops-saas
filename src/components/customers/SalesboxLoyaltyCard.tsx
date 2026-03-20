"use client";
import React from "react";

interface SalesboxLoyaltyCardProps {
  className?: string;
  [key: string]: unknown;
}

export function SalesboxLoyaltyCard({ className, ...props }: SalesboxLoyaltyCardProps) {
  return (
    <div className={className} data-component="SalesboxLoyaltyCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SalesboxLoyaltyCard]</p>
    </div>
  );
}

export default SalesboxLoyaltyCard;
