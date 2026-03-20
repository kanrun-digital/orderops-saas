"use client";
import React from "react";

interface OrderTransferCardProps {
  className?: string;
  [key: string]: unknown;
}

export function OrderTransferCard({ className, ...props }: OrderTransferCardProps) {
  return (
    <div className={className} data-component="OrderTransferCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OrderTransferCard]</p>
    </div>
  );
}

export default OrderTransferCard;
