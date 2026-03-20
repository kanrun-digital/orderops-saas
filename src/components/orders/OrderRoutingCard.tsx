"use client";
import React from "react";

interface OrderRoutingCardProps {
  className?: string;
  [key: string]: unknown;
}

export function OrderRoutingCard({ className, ...props }: OrderRoutingCardProps) {
  return (
    <div className={className} data-component="OrderRoutingCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OrderRoutingCard]</p>
    </div>
  );
}

export default OrderRoutingCard;
