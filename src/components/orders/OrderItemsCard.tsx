"use client";
import React from "react";

interface OrderItemsCardProps {
  className?: string;
  [key: string]: unknown;
}

export function OrderItemsCard({ className, ...props }: OrderItemsCardProps) {
  return (
    <div className={className} data-component="OrderItemsCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OrderItemsCard]</p>
    </div>
  );
}

export default OrderItemsCard;
