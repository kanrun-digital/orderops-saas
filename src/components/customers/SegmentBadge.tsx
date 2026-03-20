"use client";
import React from "react";

interface SegmentBadgeProps {
  className?: string;
  [key: string]: unknown;
}

export function SegmentBadge({ className, ...props }: SegmentBadgeProps) {
  return (
    <div className={className} data-component="SegmentBadge" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SegmentBadge]</p>
    </div>
  );
}

export function ValueSegmentBadge({ segment }: { segment?: string | null }) {
  const label = segment || "Unknown";
  const colorMap: Record<string, string> = {
    high: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-red-100 text-red-800",
  };
  const color = colorMap[label.toLowerCase()] || "bg-gray-100 text-gray-800";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
}

export function RecencySegmentBadge({ segment }: { segment?: string | null }) {
  const label = segment || "Unknown";
  const colorMap: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    recent: "bg-blue-100 text-blue-800",
    lapsed: "bg-orange-100 text-orange-800",
    dormant: "bg-red-100 text-red-800",
  };
  const color = colorMap[label.toLowerCase()] || "bg-gray-100 text-gray-800";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
}

export default SegmentBadge;
