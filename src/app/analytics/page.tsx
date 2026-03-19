"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const t = (key: string) => key;

async function fetchAnalyticsSummary(accountId: string) {
  const res = await fetch(
    `/api/data/analytics_summary?account_id=eq.${accountId}`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const json = await res.json();
  return (json.data ?? [])[0] ?? null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const pathname = usePathname();
  const session = useAuthStore((s: any) => s.session);
  const accountId = session?.account?.id;

  const { data: summary, isLoading } = useQuery({
    queryKey: ["analytics_summary", accountId],
    queryFn: () => fetchAnalyticsSummary(accountId),
    enabled: !!accountId,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("analytics.title")}
        subtitle={t("analytics.subtitle")}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t("analytics.totalOrders")}
            value={summary?.total_orders ?? 0}
            description={t("analytics.totalOrdersDesc")}
            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title={t("analytics.revenue")}
            value={summary?.total_revenue ? `$${summary.total_revenue}` : "$0"}
            description={t("analytics.revenueDesc")}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title={t("analytics.customers")}
            value={summary?.total_customers ?? 0}
            description={t("analytics.customersDesc")}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title={t("analytics.avgOrderValue")}
            value={
              summary?.avg_order_value
                ? `$${Number(summary.avg_order_value).toFixed(2)}`
                : "$0.00"
            }
            description={t("analytics.avgOrderValueDesc")}
            icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("analytics.overview")}</CardTitle>
          <CardDescription>{t("analytics.overviewDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mr-3" />
            <span>{t("analytics.chartPlaceholder")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
