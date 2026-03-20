"use client";
import React from "react";

interface MenuSourceTabProps {
  className?: string;
  [key: string]: unknown;
}

export function MenuSourceTab({ className, ...props }: MenuSourceTabProps) {
  return (
    <div className={className} data-component="MenuSourceTab" {...props}>
      <p className="text-sm text-muted-foreground p-4">[MenuSourceTab]</p>
    </div>
  );
}

export default MenuSourceTab;
