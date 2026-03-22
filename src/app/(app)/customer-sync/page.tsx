"use client";

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatusBadge } from '@/components/app/StatusBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCustomerIngestionStats } from '@/hooks/useCustomerIngestionStats';
import {
  useStartBackgroundCustomerSync,
  useStartBackgroundBitrixSync,
  useStartBackgroundBitrixAutoMatch,
  useActiveBackgroundSyncJobs,
  useCancelBackgroundSync,
} from '@/hooks/useBackgroundSync';
import { BACKGROUND_SYNC_JOB_TYPES } from '@/lib/constants/jobs';
import { formatRelativeShort } from '@/lib/utils/formatTime';
import {
  CheckCircle2, XCircle, RefreshCw, Minus,
  Users, Link2, Clock, ArrowLeft, AlertTriangle, Info, PauseCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useAccountSettings, useUpdateAccountSettings } from '@/hooks/useAccountSettings';
import { ROUTES } from '@/constants/routes';

const t = (key: string) => key;

// 5 minutes threshold for stale processing jobs
const STALE_PROCESSING_THRESHOLD_MS = 5 * 60 * 1000;

// ─── Helpers ────────────────────────────────────────────────────────────────

function JobStatusIcon({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === 'failed') return <XCircle className="h-4 w-4 text-destructive" />;
  if (status === 'pending' || status === 'processing') {
    return <RefreshCw className="h-4 w-4 text-info animate-spin" />;
  }
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function jobStatusIntent(status: string): 'success' | 'danger' | 'info' | 'neutral' {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'pending' || status === 'processing') return 'info';
  return 'neutral';
}

function isStaleProcessingJob(job: any): boolean {
  if (job.status !== 'processing' || !job.startedAt) return false;
  return Date.now() - new Date(job.startedAt).getTime() > STALE_PROCESSING_THRESHOLD_MS;
}

// ─── Provider card ───────────────────────────────────────────────────────────

interface ProviderCardProps {
  title: string;
  icon: React.ElementType;
  linkedCount: number;
  lastJobAt: string | null;
  lastJobStatus: string | null;
  extra?: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  linkedCustomersLabel: string;
  notAvailableLabel: string;
  statusLabelResolver: (status: string) => string;
}

function ProviderCard({
  title,
  icon: Icon,
  linkedCount,
  lastJobAt,
  lastJobStatus,
  extra,
  isLoading,
  isError,
  linkedCustomersLabel,
  notAvailableLabel,
  statusLabelResolver,
}: ProviderCardProps) {
  const showUnavailable = isError && !isLoading;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-3xl font-bold">{showUnavailable ? '—' : linkedCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{showUnavailable ? notAvailableLabel : linkedCustomersLabel}</p>
            {!showUnavailable && lastJobStatus && (
              <StatusBadge
                intent={jobStatusIntent(lastJobStatus)}
                label={statusLabelResolver(lastJobStatus)}
                icon={<JobStatusIcon status={lastJobStatus} />}
              />
            )}
            {!showUnavailable && lastJobAt && (
              <p className="text-xs text-muted-foreground">{formatRelativeShort(lastJobAt)}</p>
            )}
            {!showUnavailable && extra}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CustomerSyncStatus() {
  const { data: stats, isLoading, isError, error, refetch } = useCustomerIngestionStats();

  const salesboxSyncMutation = useStartBackgroundCustomerSync();
  const bitrixImportMutation = useStartBackgroundBitrixSync();
  const bitrixAutoMatchMutation = useStartBackgroundBitrixAutoMatch();
  const cancelSalesboxSyncMutation = useCancelBackgroundSync(BACKGROUND_SYNC_JOB_TYPES.SYNC_SALESBOX_CUSTOMERS);
  const cancelBitrixImportMutation = useCancelBackgroundSync(BACKGROUND_SYNC_JOB_TYPES.SYNC_BITRIX_USERS);
  const cancelBitrixMatchMutation = useCancelBackgroundSync(BACKGROUND_SYNC_JOB_TYPES.BITRIX_AUTO_MATCH);
  const { settings: accountSettings } = useAccountSettings();
  const updateAccountSettings = useUpdateAccountSettings();

  const { data: activeJobs = [] } = useActiveBackgroundSyncJobs();
  const activeSalesboxJobs = (activeJobs as any[]).filter((job: any) => job.job_type === BACKGROUND_SYNC_JOB_TYPES.SYNC_SALESBOX_CUSTOMERS);
  const activeBitrixImportJobs = (activeJobs as any[]).filter((job: any) => job.job_type === BACKGROUND_SYNC_JOB_TYPES.SYNC_BITRIX_USERS);
  const activeBitrixMatchJobs = (activeJobs as any[]).filter((job: any) => job.job_type === BACKGROUND_SYNC_JOB_TYPES.BITRIX_AUTO_MATCH);

  const salesboxBusy = activeSalesboxJobs.length > 0 || salesboxSyncMutation.isPending;
  const bitrixImportBusy = activeBitrixImportJobs.length > 0 || bitrixImportMutation.isPending;
  const bitrixMatchBusy = activeBitrixMatchJobs.length > 0 || bitrixAutoMatchMutation.isPending;
  const autoMatchEnabled = ((accountSettings as any)?.bitrix && typeof (accountSettings as any).bitrix === 'object' && !Array.isArray((accountSettings as any).bitrix)
    ? ((accountSettings as any).bitrix as Record<string, unknown>).auto_match_enabled
    : undefined) !== false;

  const bitrix = (stats as any)?.bitrix;
  const hasFailures = bitrix?.hasFailures ?? false;
  const totalBitrixUsers = (bitrix?.matched ?? 0) + (bitrix?.pending ?? 0) + (bitrix?.skipped ?? 0) + (bitrix?.needsReview ?? 0);
  const matchPercent = totalBitrixUsers > 0
    ? Math.round(((bitrix?.matched ?? 0) / totalBitrixUsers) * 100)
    : 0;

  const activeBitrixMatchProcessingJobs = activeBitrixMatchJobs.filter((job: any) => job.status === 'processing');
  const activeBitrixMatchPendingJobs = activeBitrixMatchJobs.filter((job: any) => job.status === 'pending');
  const lastBitrixAutoMatchJob = (stats as any)?.recentJobs?.find((job: any) => job.jobType === BACKGROUND_SYNC_JOB_TYPES.BITRIX_AUTO_MATCH);

  const queueStatus: {
    label: string;
    tooltip: string;
    icon: React.ReactNode;
  } = (() => {
    if (activeBitrixMatchProcessingJobs.length > 0) {
      return {
        label: t('customerSyncStatus.queueStatus.processing'),
        tooltip: t('customerSyncStatus.queueStatus.tooltip.reasons.processing'),
        icon: <RefreshCw className="h-3 w-3 animate-spin" />,
      };
    }

    if (activeBitrixMatchPendingJobs.length > 0) {
      return {
        label: t('customerSyncStatus.queueStatus.queued') + ` (${activeBitrixMatchPendingJobs.length})`,
        tooltip: t('customerSyncStatus.queueStatus.tooltip.reasons.queued'),
        icon: <Clock className="h-3 w-3" />,
      };
    }

    if (!autoMatchEnabled) {
      return {
        label: t('customerSyncStatus.queueStatus.paused'),
        tooltip: t('customerSyncStatus.queueStatus.tooltip.reasons.paused'),
        icon: <PauseCircle className="h-3 w-3" />,
      };
    }

    if (lastBitrixAutoMatchJob?.status === 'cancelled') {
      return {
        label: t('customerSyncStatus.queueStatus.stopped'),
        tooltip: t('customerSyncStatus.queueStatus.tooltip.reasons.stopped'),
        icon: <XCircle className="h-3 w-3" />,
      };
    }

    if ((bitrix?.pending ?? 0) > 0) {
      return {
        label: t('customerSyncStatus.queueStatus.needsAction'),
        tooltip: t('customerSyncStatus.queueStatus.tooltip.reasons.needsAction'),
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    }

    return {
      label: t('customerSyncStatus.queueStatus.completed'),
      tooltip: t('customerSyncStatus.queueStatus.tooltip.reasons.completed'),
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  })();

  // Detect stale processing jobs (>5 min)
  const hasStaleJobs = (stats as any)?.recentJobs?.some(isStaleProcessingJob) ?? false;

  const jobTypeLabels: Record<string, string> = {
    SYNC_SALESBOX_CUSTOMERS: t('customerSyncStatus.jobTypes.syncSalesboxCustomers'),
    SYNC_BITRIX_USERS: t('customerSyncStatus.jobTypes.syncBitrixUsers'),
    BITRIX_AUTO_MATCH: t('customerSyncStatus.jobTypes.bitrixAutoMatch'),
  };

  const getStatusLabel = (status: string) => {
    return t(`customerSyncStatus.status.${status}`);
  };

  const getJobDuration = (job: any): string => {
    if (!job.startedAt || !job.finishedAt) return '—';
    const ms = new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime();
    const secs = Math.floor(ms / 1000);
    if (secs < 60) {
      return `${secs}s`;
    }
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  const errorMessage = error instanceof Error
    ? error.message
    : t('customerSyncStatus.errorBanner.descriptionFallback');

  const handleAutoMatchToggle = (enabled: boolean) => {
    const currentBitrixSettings =
      (accountSettings as any)?.bitrix && typeof (accountSettings as any).bitrix === 'object' && !Array.isArray((accountSettings as any).bitrix)
        ? ((accountSettings as any).bitrix as Record<string, unknown>)
        : {};

    updateAccountSettings.mutate({
      bitrix: {
        ...currentBitrixSettings,
        auto_match_enabled: enabled,
      },
    } as any);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={t('customerSyncStatus.title')}
          subtitle={t('customerSyncStatus.subtitle')}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.customers}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('customerSyncStatus.backToCustomers')}
              </Link>
            </Button>
          }
        />

        {/* Stale job warning */}
        {hasStaleJobs && (
          <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{t('customerSyncStatus.staleJobsWarning')}</span>
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('customerSyncStatus.errorBanner.title')}</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                {t('customerSyncStatus.errorBanner.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Section A — Provider Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ProviderCard
            title={t('customerSyncStatus.providers.salesbox')}
            icon={Link2}
            linkedCount={(stats as any)?.salesbox?.linkedCount ?? 0}
            lastJobAt={(stats as any)?.salesbox?.lastJobAt ?? null}
            lastJobStatus={(stats as any)?.salesbox?.lastJobStatus ?? null}
            isLoading={isLoading}
            isError={isError}
            linkedCustomersLabel={t('customerSyncStatus.linkedCustomers')}
            notAvailableLabel={t('customerSyncStatus.fallback.notAvailable')}
            statusLabelResolver={getStatusLabel}
          />

          <ProviderCard
            title={t('customerSyncStatus.providers.bitrix')}
            icon={Users}
            linkedCount={(stats as any)?.bitrix?.linkedCount ?? 0}
            lastJobAt={(stats as any)?.bitrix?.lastImportAt ?? null}
            lastJobStatus={(stats as any)?.bitrix?.lastImportStatus ?? null}
            isLoading={isLoading}
            isError={isError}
            extra={
              !isLoading && !isError && (bitrix?.pending ?? 0) > 0 ? (
                <p className="text-xs text-warning">
                  {t('customerSyncStatus.pendingUsersMatch')}: {bitrix?.pending ?? 0}
                </p>
              ) : undefined
            }
            linkedCustomersLabel={t('customerSyncStatus.linkedCustomers')}
            notAvailableLabel={t('customerSyncStatus.fallback.notAvailable')}
            statusLabelResolver={getStatusLabel}
          />

          <ProviderCard
            title={t('customerSyncStatus.providers.syrve')}
            icon={Users}
            linkedCount={(stats as any)?.syrve?.linkedCount ?? 0}
            lastJobAt={null}
            lastJobStatus={null}
            isLoading={isLoading}
            isError={isError}
            linkedCustomersLabel={t('customerSyncStatus.linkedCustomers')}
            notAvailableLabel={t('customerSyncStatus.fallback.notAvailable')}
            statusLabelResolver={getStatusLabel}
          />
        </div>

        {/* Section B — Bitrix Pipeline Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('customerSyncStatus.bitrixPipelineTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-48" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('customerSyncStatus.bitrixPipelineMatchedOfTotal')}: {(bitrix?.matched ?? 0).toLocaleString()} / {totalBitrixUsers.toLocaleString()}
                  </span>
                  <span className="font-semibold">{matchPercent}%</span>
                </div>
                <Progress value={matchPercent} className="h-3" />
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{t('customerSyncStatus.pendingCount')}: {bitrix?.pending ?? 0}</span>
                  <span>{t('customerSyncStatus.needsReviewCount')}: {bitrix?.needsReview ?? 0}</span>
                  <span>{t('customerSyncStatus.skippedCount')}: {bitrix?.skipped ?? 0}</span>
                  <Badge variant="outline" className="gap-1 border-info/20 bg-info/10 text-info">
                    {queueStatus.icon}
                    {queueStatus.label}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex"
                          aria-label={t('customerSyncStatus.queueStatus.tooltip.ariaLabel')}
                        >
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        {queueStatus.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </Badge>
                  {hasFailures && (
                    <Badge variant="outline" className="gap-1 border-warning/30 bg-warning/10 text-warning">
                      <AlertTriangle className="h-3 w-3" />
                      {t('customerSyncStatus.queueStatus.hasFailures')}
                    </Badge>
                  )}
                  {bitrix?.lastMatchAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('customerSyncStatus.lastMatchAt')}: {formatRelativeShort(bitrix.lastMatchAt)}
                    </span>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Section D — Action Buttons */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('customerSyncStatus.manualSyncControlsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => salesboxSyncMutation.mutate({})}
                  disabled={salesboxBusy}
                  variant="outline"
                >
                  {salesboxBusy ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {t('customerSyncStatus.actions.syncSalesboxCustomers')}
                </Button>
                {activeSalesboxJobs.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => cancelSalesboxSyncMutation.mutate()}
                    disabled={cancelSalesboxSyncMutation.isPending}
                  >
                    {t('customerSyncStatus.actions.stop')}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => bitrixImportMutation.mutate({})}
                  disabled={bitrixImportBusy}
                  variant="outline"
                >
                  {bitrixImportBusy ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {t('customerSyncStatus.actions.importBitrixUsers')}
                </Button>
                {activeBitrixImportJobs.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => cancelBitrixImportMutation.mutate()}
                    disabled={cancelBitrixImportMutation.isPending}
                  >
                    {t('customerSyncStatus.actions.pauseOrStop')}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => bitrixAutoMatchMutation.mutate({})}
                  disabled={bitrixMatchBusy || !autoMatchEnabled || (bitrix?.pending ?? 0) === 0}
                  className={cn(
                    (bitrix?.pending ?? 0) > 0 && !bitrixMatchBusy && autoMatchEnabled
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : ''
                  )}
                >
                  {bitrixMatchBusy ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {t('customerSyncStatus.actions.runBitrixAutoMatch')}
                  {(bitrix?.pending ?? 0) > 0 && !bitrixMatchBusy && (
                    <Badge variant="secondary" className="ml-2">
                      {bitrix?.pending ?? 0}
                    </Badge>
                  )}
                </Button>
                {activeBitrixMatchJobs.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => cancelBitrixMatchMutation.mutate()}
                    disabled={cancelBitrixMatchMutation.isPending}
                  >
                    {t('customerSyncStatus.actions.pauseOrStop')}
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-md border p-3">
              <Switch
                checked={autoMatchEnabled}
                onCheckedChange={handleAutoMatchToggle}
                disabled={updateAccountSettings.isPending}
              />
              <div className="text-sm">
                <p className="font-medium">
                  {t('customerSyncStatus.autoMatchState')}: {autoMatchEnabled
                    ? t('customerSyncStatus.autoMatchStateEnabled')
                    : t('customerSyncStatus.autoMatchStateDisabled')}
                </p>
                <p className="text-xs text-muted-foreground">{t('customerSyncStatus.autoMatchRestartHint')}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t('customerSyncStatus.autoMatchHint')}
            </p>
          </CardContent>
        </Card>

        {/* Section C — Recent Job History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('customerSyncStatus.recentSyncJobsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_: any, i: any) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : ((stats as any)?.recentJobs?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t('customerSyncStatus.noSyncJobsFound')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-2 text-left font-medium">{t('customerSyncStatus.table.jobType')}</th>
                      <th className="pb-2 text-left font-medium">{t('customerSyncStatus.table.status')}</th>
                      <th className="pb-2 text-left font-medium">{t('customerSyncStatus.table.started')}</th>
                      <th className="pb-2 text-left font-medium">{t('customerSyncStatus.table.duration')}</th>
                      <th className="pb-2 text-left font-medium">{t('customerSyncStatus.table.error')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(stats as any)?.recentJobs?.map((job: any) => (
                      <tr key={job.id} className={cn("py-2", isStaleProcessingJob(job) && "bg-warning/5")}>
                        <td className="py-2 pr-4 font-medium">
                          {jobTypeLabels[job.jobType] ?? job.jobType}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-1">
                            <StatusBadge
                              intent={jobStatusIntent(job.status)}
                              label={getStatusLabel(job.status)}
                              icon={<JobStatusIcon status={job.status} />}
                            />
                            {isStaleProcessingJob(job) && (
                              <AlertTriangle className="h-3 w-3 text-warning" />
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {job.startedAt ? formatRelativeShort(job.startedAt) : (
                            job.createdAt ? formatRelativeShort(job.createdAt) : '—'
                          )}
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {getJobDuration(job)}
                        </td>
                        <td className="py-2 max-w-xs">
                          {job.lastError ? (
                            <span className="text-destructive truncate text-xs" title={job.lastError}>
                              {job.lastError.slice(0, 60)}{job.lastError.length > 60 ? '...' : ''}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
