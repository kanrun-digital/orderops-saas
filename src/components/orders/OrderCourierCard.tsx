"use client";
import React from "react";

interface OrderCourierCardProps {
  className?: string;
  [key: string]: unknown;
}

export function OrderCourierCard({ className, ...props }: OrderCourierCardProps) {
  return (
    <div className={className} data-component="OrderCourierCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OrderCourierCard]</p>
    </div>
  );
}

export default OrderCourierCard;
