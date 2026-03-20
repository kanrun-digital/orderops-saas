"use client";
import React from "react";

interface SyrveCustomerCategoriesCardProps {
  className?: string;
  [key: string]: unknown;
}

export function SyrveCustomerCategoriesCard({ className, ...props }: SyrveCustomerCategoriesCardProps) {
  return (
    <div className={className} data-component="SyrveCustomerCategoriesCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SyrveCustomerCategoriesCard]</p>
    </div>
  );
}

export default SyrveCustomerCategoriesCard;
