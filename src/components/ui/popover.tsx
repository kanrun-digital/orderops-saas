"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Popover = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => <>{children}</>;
const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  (props, ref) => <button ref={ref} {...props} />
);
PopoverTrigger.displayName = "PopoverTrigger";
const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: string; sideOffset?: number }>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", className)} {...props} />
  )
);
PopoverContent.displayName = "PopoverContent";
const PopoverAnchor = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />
);
PopoverAnchor.displayName = "PopoverAnchor";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
export default Popover;
