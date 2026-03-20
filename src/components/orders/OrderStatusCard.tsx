"use client";
import React from "react";

interface OrderStatusCardProps {
  className?: string;
  [key: string]: unknown;
}

export function OrderStatusCard({ className, ...props }: OrderStatusCardProps) {
  return (
    <div className={className} data-component="OrderStatusCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OrderStatusCard]</p>
    </div>
  );
}

export default OrderStatusCard;
