"use client";
import React from "react";

export interface RowAction {
  key?: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  destructive?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export interface RowActionsMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: RowAction[];
}

export function RowActionsMenu({ className, actions = [], ...props }: RowActionsMenuProps) {
  return (
    <div
      className={["flex flex-wrap justify-end gap-2", className].filter(Boolean).join(" ")}
      data-component="RowActionsMenu"
      {...props}
    >
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className={[
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
            action.variant === "destructive"
              ? "border-destructive/30 text-destructive hover:bg-destructive/10"
              : "border-border text-foreground hover:bg-muted",
            action.disabled ? "cursor-not-allowed opacity-50" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export default RowActionsMenu;
