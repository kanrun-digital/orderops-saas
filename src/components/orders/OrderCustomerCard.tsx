"use client";
import React from "react";

interface OrderCustomerCardProps {
  className?: string;
  [key: string]: unknown;
}

export function OrderCustomerCard({ className, ...props }: OrderCustomerCardProps) {
  return (
    <div className={className} data-component="OrderCustomerCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OrderCustomerCard]</p>
    </div>
  );
}

export default OrderCustomerCard;
