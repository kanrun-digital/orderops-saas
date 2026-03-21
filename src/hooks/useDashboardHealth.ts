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
  return {
    data: { status: 'ok', integrations: [], alerts: [] },
    connections: [],
    healthyCount: 0,
    warningCount: 0,
    errorCount: 0,
    failedSyncs: [],
    unmappedCount: 0,
    isAdmin: false,
    unresolvedAlerts: [],
    actionItems: [],
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}
export default useDashboardHealth;
