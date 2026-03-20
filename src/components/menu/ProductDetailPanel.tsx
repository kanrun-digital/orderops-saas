"use client";
import React from "react";

interface ProductDetailPanelProps {
  className?: string;
  [key: string]: unknown;
}

export function ProductDetailPanel({ className, ...props }: ProductDetailPanelProps) {
  return (
    <div className={className} data-component="ProductDetailPanel" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ProductDetailPanel]</p>
    </div>
  );
}

export default ProductDetailPanel;
