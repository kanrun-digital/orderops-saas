"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

interface DashboardConnection {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
}

interface DashboardAlert {
  id: string;
  message: string;
}

interface DashboardActionItem {
  id: string;
  title: string;
  description?: string;
}

interface UseDashboardHealthResult {
  data: {
    status: string;
    integrations: DashboardConnection[];
    alerts: DashboardAlert[];
  };
  connections: DashboardConnection[];
  healthyCount: number;
  warningCount: number;
  errorCount: number;
  failedSyncs: DashboardAlert[];
  unmappedCount: number;
  isAdmin: boolean;
  unresolvedAlerts: DashboardAlert[];
  actionItems: DashboardActionItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDashboardHealth(): UseDashboardHealthResult {
  const accountId = useAuthStore((s) => s.accountId);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const query = useQuery({
    queryKey: ["dashboard-health", accountId],
    queryFn: async () => {
      const [connectionsRes, alertsRes, unmappedRes, failedJobsRes] = await Promise.all([
        apiGet<{ data: any[] }>(
          `/api/data/provider_connections?account_id=${accountId}&_sort=created_at&_order=desc`
        ),
        apiGet<{ data: any[] }>(
          `/api/data/admin_alerts?account_id=${accountId}&resolved_at=&_sort=created_at&_order=desc&_limit=20`
        ),
        apiGet<{ data: any[]; total?: number }>(
          `/api/data/external_item_mappings?account_id=${accountId}&_limit=1&includeTotal=true`
        ),
        apiGet<{ data: any[] }>(
          `/api/data/sync_jobs?account_id=${accountId}&status=failed&_sort=created_at&_order=desc&_limit=10`
        ),
      ]);

      const connections: DashboardConnection[] = (connectionsRes.data ?? []).map((c: any) => ({
        id: c.id,
        name: c.name ?? c.provider_id,
        status: c.last_auth_error ? 'error' : c.status === 'active' ? 'healthy' : 'warning',
      }));

      const alerts: DashboardAlert[] = (alertsRes.data ?? []).map((a: any) => ({
        id: a.id,
        message: a.message ?? a.title,
      }));

      const failedSyncs: DashboardAlert[] = (failedJobsRes.data ?? []).map((j: any) => ({
        id: j.id,
        message: `${j.job_type} failed: ${j.error_message ?? "unknown error"}`,
      }));

      return { connections, alerts, failedSyncs, unmappedCount: unmappedRes.total ?? 0 };
    },
    enabled: !!accountId,
  });

  const connections = query.data?.connections ?? [];
  const alerts = query.data?.alerts ?? [];
  const failedSyncs = query.data?.failedSyncs ?? [];
  const unmappedCount = query.data?.unmappedCount ?? 0;

  const healthyCount = connections.filter((c) => c.status === 'healthy').length;
  const warningCount = connections.filter((c) => c.status === 'warning').length;
  const errorCount = connections.filter((c) => c.status === 'error').length;

  const actionItems: DashboardActionItem[] = [];
  if (errorCount > 0) actionItems.push({ id: "fix-errors", title: "Fix connection errors", description: `${errorCount} connections have errors` });
  if (failedSyncs.length > 0) actionItems.push({ id: "fix-syncs", title: "Resolve failed syncs", description: `${failedSyncs.length} syncs failed recently` });
  if (unmappedCount > 0) actionItems.push({ id: "map-items", title: "Map unmapped products", description: `${unmappedCount} products need mapping` });

  const overallStatus = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'ok';

  return {
    data: { status: overallStatus, integrations: connections, alerts },
    connections,
    healthyCount,
    warningCount,
    errorCount,
    failedSyncs,
    unmappedCount,
    isAdmin,
    unresolvedAlerts: alerts,
    actionItems,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useDashboardHealth;
