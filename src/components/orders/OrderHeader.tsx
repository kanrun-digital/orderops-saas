"use client";
import React from "react";

interface OrderHeaderProps {
  className?: string;
  [key: string]: unknown;
}

export function OrderHeader({ className, ...props }: OrderHeaderProps) {
  return (
    <div className={className} data-component="OrderHeader" {...props}>
      <p className="text-sm text-muted-foreground p-4">[OrderHeader]</p>
    </div>
  );
}

export default OrderHeader;
