"use client";

import {
  ShoppingBag,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";

const STATS = [
  {
    label: "Total Orders",
    value: "—",
    change: "+0%",
    icon: ShoppingBag,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Revenue",
    value: "—",
    change: "+0%",
    icon: DollarSign,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    label: "Customers",
    value: "—",
    change: "+0%",
    icon: Users,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    label: "Avg. Order",
    value: "—",
    change: "+0%",
    icon: TrendingUp,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your restaurant operations
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No orders yet. Orders will appear here once connected.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Active Drivers</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No active drivers. Driver status will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
