"use client";

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncActions } from '@/hooks/useSyncActions';
import { AppLayout } from '@/components/layout/AppLayout';
import { SyncRunDetailPanel } from '@/components/sync/SyncRunDetailPanel';
import { SyncHistoryTable } from '@/components/sync/SyncHistoryTable';
import { AddressRoutingMetrics } from '@/components/sync/AddressRoutingMetrics';
import { SummaryBar } from '@/components/app/SummaryBar';
import { PageHeader } from '@/components/app/PageHeader';
import { PROVIDER_DISPLAY_NAMES } from '@/lib/constants/integrations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSyncJobs } from '@/hooks/useSyncLogs';
import { useUnifiedSyncLogs } from '@/hooks/useUnifiedSyncLogs';
import type { UnifiedSyncLog } from '@/hooks/useUnifiedSyncLogs';
import { PROVIDER_LABELS } from '@/lib/constants/syncLabels';
import { formatDateFns, formatDistanceToNowLocalized } from '@/lib/utils/formatDateTime';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Activity,
  AlertTriangle,
  History,
  MapPin,
} from 'lucide-react';

const t = (key: string) => key;

/* ───────────────────────── Provider summary types ───────────────────────── */

interface SyncJob {
  provider: string;
  job_type: string;
  status: string;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
  error_message?: string | null;
}

interface ProviderSummary {
  provider: string;
  jobType: string;
  lastSuccess: SyncJob | null;
  lastError: SyncJob | null;
  totalJobs: number;
  successCount: number;
  errorCount: number;
  avgDurationMs: number | null;
}

function computeSummaries(jobs: SyncJob[]): ProviderSummary[] {
  const groups = new Map<string, SyncJob[]>();
  for (const job of jobs) {
    const key = `${job.provider}::${job.job_type}`;
    const list = groups.get(key) ?? [];
    list.push(job);
    groups.set(key, list);
  }

  const summaries: ProviderSummary[] = [];
  groups.forEach((groupJobs, key) => {
    const [provider, jobType] = key.split('::');
    const completed = groupJobs.filter((j: any) => j.status === 'completed');
    const failed = groupJobs.filter((j: any) => j.status === 'failed');

    const durations = completed
      .filter((j: any) => j.started_at && j.finished_at)
      .map((j: any) => new Date(j.finished_at).getTime() - new Date(j.started_at).getTime())
      .filter((d: any) => d > 0);

    summaries.push({
      provider,
      jobType,
      lastSuccess: completed[0] ?? null,
      lastError: failed[0] ?? null,
      totalJobs: groupJobs.length,
      successCount: completed.length,
      errorCount: failed.length,
      avgDurationMs: durations.length > 0 ? durations.reduce((a: any, b: any) => a + b, 0) / durations.length : null,
    });
  });

  return summaries.sort((a, b) => a.provider.localeCompare(b.provider));
}

/* ───────────────────────── Small helpers ───────────────────────── */

function SummaryStatusBadge({ status }: { status: string | null }) {
  if (status === 'completed')
    return <Badge variant="outline" className="gap-1 border-success/20 text-success bg-success/10"><CheckCircle2 className="h-3 w-3" />{t('syncDashboard.status.ok')}</Badge>;
  if (status === 'failed')
    return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{t('syncDashboard.status.error')}</Badge>;
  if (status === 'running')
    return <Badge variant="secondary" className="gap-1"><RefreshCw className="h-3 w-3 animate-spin" />{t('syncDashboard.status.running')}</Badge>;
  return <Badge variant="secondary">{status ?? '—'}</Badge>;
}

function formatDuration(ms: number | null) {
  if (ms === null) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/* ───────────────────────── Main component ───────────────────────── */

export default function SyncDashboard() {
  const searchParams = useSearchParams();

  // --- State for detail panel & filters ---
  const [providerFilter, setProviderFilter] = useState<string>(searchParams.get('provider') || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // --- Data fetching ---
  const { data: syncJobs = [], isLoading: syncJobsLoading } = useSyncJobs();
  const { logs: unifiedLogs, isLoading, refetch } = useUnifiedSyncLogs();

  const {
    actionInProgress,
    handleCancelJob,
    handleCancelJobQueue,
    handleRetryJobQueue,
    handleCancelSyncRun,
    handleRetrySyncRun,
  } = useSyncActions(refetch);

  // --- Provider summary (top cards & table) ---
  const summaries = useMemo(() => computeSummaries((syncJobs ?? []) as any), [syncJobs]);
  const totalSuccess = summaries.reduce((s: any, x: any) => s + x.successCount, 0);
  const totalError = summaries.reduce((s: any, x: any) => s + x.errorCount, 0);
  const running = ((syncJobs ?? []) as any[]).filter((j: any) => j.status === 'running').length;

  const jobTypeLabel = (key: string) => key;
  const providerLabel = (key: string) => (PROVIDER_LABELS as any)[key] ?? key;

  const filteredLogs = useMemo(() => {
    return (unifiedLogs as any[]).filter((log: any) => {
      if (providerFilter !== 'all' && log.provider !== providerFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      return true;
    });
  }, [unifiedLogs, providerFilter, statusFilter]);

  // --- Cancel / Retry dispatch ---
  const handleCancel = useCallback((logId: string, source: string) => {
    if (source === 'sync_jobs') handleCancelJob(logId);
    else if (source === 'job_queue') handleCancelJobQueue(logId);
    else if (source === 'sync_runs') handleCancelSyncRun(logId);
  }, [handleCancelJob, handleCancelJobQueue, handleCancelSyncRun]);

  const handleRetry = useCallback((logId: string, source: string) => {
    if (source === 'job_queue') handleRetryJobQueue(logId);
    else if (source === 'sync_runs') handleRetrySyncRun(logId);
  }, [handleRetryJobQueue, handleRetrySyncRun]);

  const lang = 'en';

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title={t('syncDashboard.title')} subtitle={t('syncDashboard.subtitle')} />

        <Tabs defaultValue={searchParams.get('tab') || 'overview'}>
          <TabsList>
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              {t('syncDashboard.tabs.overview')}
            </TabsTrigger>
            <TabsTrigger value="address-routing">
              <MapPin className="h-4 w-4 mr-2" />
              {t('syncDashboard.tabs.addressRouting')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* ────── Summary bar ────── */}
            <SummaryBar
              items={syncJobsLoading ? [] : [
                { label: t('syncDashboard.stats.success'), value: totalSuccess, icon: <CheckCircle2 className="h-4 w-4" />, highlight: 'success' as const },
                { label: t('syncDashboard.stats.errors'), value: totalError, icon: <AlertTriangle className="h-4 w-4" />, highlight: totalError > 0 ? 'destructive' as const : undefined },
                { label: t('syncDashboard.stats.running'), value: running, icon: <Activity className="h-4 w-4" /> },
              ]}
            />

            {/* ────── Provider summary table ────── */}
            <Card>
              <CardHeader>
                <CardTitle>{t('syncDashboard.table.title')}</CardTitle>
                <CardDescription>{t('syncDashboard.table.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                {syncJobsLoading ? (
                  <div className="space-y-2">{[1, 2, 3].map((i: any) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : summaries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t('syncDashboard.table.empty')}</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('syncDashboard.table.provider')}</TableHead>
                          <TableHead>{t('syncDashboard.table.type')}</TableHead>
                          <TableHead>{t('syncDashboard.table.lastStatus')}</TableHead>
                          <TableHead>{t('syncDashboard.table.lastSuccess')}</TableHead>
                          <TableHead>{t('syncDashboard.table.lastError')}</TableHead>
                          <TableHead className="text-right">{t('syncDashboard.table.avgDuration')}</TableHead>
                          <TableHead className="text-right">{t('syncDashboard.table.total')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summaries.map((s: any) => {
                          const latestJob = ((syncJobs ?? []) as any[]).find((j: any) => j.provider === s.provider && j.job_type === s.jobType);
                          return (
                            <TableRow key={`${s.provider}-${s.jobType}`}>
                              <TableCell className="font-medium">{providerLabel(s.provider)}</TableCell>
                              <TableCell className="text-muted-foreground">{jobTypeLabel(s.jobType)}</TableCell>
                              <TableCell><SummaryStatusBadge status={latestJob?.status ?? null} /></TableCell>
                              <TableCell>
                                {s.lastSuccess ? (
                                  <div className="text-xs">
                                    <div>{formatDistanceToNowLocalized(s.lastSuccess.finished_at || s.lastSuccess.created_at, lang)} {t('syncDashboard.table.ago')}</div>
                                    <div className="text-muted-foreground">{formatDateFns(s.lastSuccess.created_at, 'dd.MM HH:mm', lang)}</div>
                                  </div>
                                ) : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell>
                                {s.lastError ? (
                                  <div className="text-xs">
                                    <div className="text-destructive">{formatDistanceToNowLocalized(s.lastError.finished_at || s.lastError.created_at, lang)} {t('syncDashboard.table.ago')}</div>
                                    {s.lastError.error_message && <div className="text-muted-foreground truncate max-w-[200px]" title={s.lastError.error_message}>{s.lastError.error_message}</div>}
                                  </div>
                                ) : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="flex items-center justify-end gap-1 text-sm"><Clock className="h-3 w-3 text-muted-foreground" />{formatDuration(s.avgDurationMs)}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-sm">{s.totalJobs}</span>
                                {s.errorCount > 0 && <span className="ml-1 text-xs text-destructive">({s.errorCount} {t('syncDashboard.table.err')})</span>}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ────── Detailed synchronization history ────── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      {t('syncDashboard.history.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('syncDashboard.history.subtitle')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      {t('syncDashboard.history.refresh')}
                    </Button>
                    <Select value={providerFilter} onValueChange={setProviderFilter}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder={t('syncDashboard.filters.providerPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('syncDashboard.filters.allProviders')}</SelectItem>
                        {Object.entries(PROVIDER_DISPLAY_NAMES)
                          .filter(([key]: any) => key !== 'internal')
                          .map(([key, label]: any) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t('syncDashboard.filters.statusPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('syncDashboard.filters.allStatuses')}</SelectItem>
                        <SelectItem value="pending">{t('syncDashboard.filters.pending')}</SelectItem>
                        <SelectItem value="running">{t('syncDashboard.filters.running')}</SelectItem>
                        <SelectItem value="completed">{t('syncDashboard.filters.completed')}</SelectItem>
                        <SelectItem value="failed">{t('syncDashboard.filters.failed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">{[1, 2, 3, 4, 5].map((i: any) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">{t('syncDashboard.history.empty')}</h3>
                    <p className="text-muted-foreground">{t('syncDashboard.history.emptyDesc')}</p>
                  </div>
                ) : (
                  <SyncHistoryTable
                    logs={filteredLogs}
                    actionInProgress={actionInProgress}
                    onCancel={handleCancel}
                    onRetry={handleRetry}
                    onSelectJob={(jobId: any) => {
                      setSelectedJobId(jobId);
                      setDetailPanelOpen(true);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address-routing" className="mt-4">
            <AddressRoutingMetrics />
          </TabsContent>
        </Tabs>

        <SyncRunDetailPanel jobId={selectedJobId} open={detailPanelOpen} onOpenChange={setDetailPanelOpen} />
      </div>
    </AppLayout>
  );
}
