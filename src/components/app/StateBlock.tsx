"use client";
import React from "react";

export interface StateBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  loadingHint?: "rows" | "card" | "content";
  loadingCount?: number;
  isEmpty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyCta?: React.ReactNode;
  children?: React.ReactNode;
}

export function StateBlock({
  className,
  isLoading = false,
  loadingHint = "content",
  loadingCount = 3,
  isEmpty = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyCta,
  children,
  ...props
}: StateBlockProps) {
  if (isLoading) {
    return (
      <div className={className} data-component="StateBlock" {...props}>
        <div className="space-y-3 rounded-xl border border-dashed p-4">
          {Array.from({ length: loadingCount }, (_, index) => (
            <div
              key={index}
              className={[
                "animate-pulse rounded-md bg-muted",
                loadingHint === "rows" ? "h-12 w-full" : loadingHint === "card" ? "h-24 w-full" : "h-16 w-full",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={className} data-component="StateBlock" {...props}>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
          {emptyIcon ? <div className="mb-3 text-muted-foreground">{emptyIcon}</div> : null}
          {emptyTitle ? <div className="text-base font-medium">{emptyTitle}</div> : null}
          {emptyDescription ? <div className="mt-2 text-sm text-muted-foreground">{emptyDescription}</div> : null}
          {emptyCta ? <div className="mt-4">{emptyCta}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={className} data-component="StateBlock" {...props}>
      {children}
    </div>
  );
}

export default StateBlock;
