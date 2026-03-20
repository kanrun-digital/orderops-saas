"use client";
import React from "react";

interface RowActionsMenuProps {
  className?: string;
  [key: string]: unknown;
}

export function RowActionsMenu({ className, ...props }: RowActionsMenuProps) {
  return (
    <div className={className} data-component="RowActionsMenu" {...props}>
      <p className="text-sm text-muted-foreground p-4">[RowActionsMenu]</p>
    </div>
  );
}

export default RowActionsMenu;

export interface RowAction {
  key: string;
  label: string;
  icon?: any;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}
