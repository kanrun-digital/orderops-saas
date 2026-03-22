"use client";

import { useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAccount } from '@/contexts/AccountContext';
import {
  useSyrveOrganizations,
  useSyrveTerminalGroups,
  useSyrveCouriersMultiOrg,
  useSyrveCourierLocationsMultiOrg,
} from '@/hooks/useSyrve';
import {
  CheckCircle2, ChevronRight, Clock, HelpCircle, MapPin, Monitor, Navigation, Pencil, RefreshCw,
  Truck, Users, Wifi, WifiOff, XCircle, AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { StatusBadge } from '@/components/app/StatusBadge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TIMING } from '@/lib/constants';
import { syrveApi } from '@/lib/api/syrve';
import { CourierDetailSheet } from '@/components/operations/CourierDetailSheet';

const t = (key: string, opts?: Record<string, unknown>) => key;

/* ─── Helpers ─── */

type WorkingHoursMap = Record<string, { open: string; close: string } | null>;

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const WEEKDAY_MAP: Record<string, string> = {
  mon: 'mon', tue: 'tue', wed: 'wed', thu: 'thu', fri: 'fri', sat: 'sat', sun: 'sun',
};

type WorkingStatus = { state: 'open' | 'closed' | 'unknown'; label: string; todayKey?: string };

function isRestaurantOpen(workingHours: WorkingHoursMap | null, timezone: string, tFn: (key: string, opts?: Record<string, unknown>) => string): WorkingStatus {
  if (!workingHours) return { state: 'unknown', label: tFn('operations.scheduleNotSet') };

  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'Europe/Kyiv',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'short',
    });
    const parts = formatter.formatToParts(now);
    const hour = parts.find((p: any) => p.type === 'hour')?.value ?? '00';
    const minute = parts.find((p: any) => p.type === 'minute')?.value ?? '00';
    const currentTime = `${hour}:${minute}`;

    const weekdayPart = parts.find((p: any) => p.type === 'weekday')?.value ?? '';
    const dayKey = WEEKDAY_MAP[weekdayPart.toLowerCase().slice(0, 3)] ?? 'mon';

    const slot = workingHours[dayKey];
    if (!slot) return { state: 'closed', label: tFn('operations.closedDay', { day: tFn(`operations.days.${dayKey}`) }), todayKey: dayKey };

    let isOpen: boolean;
    const isNightShift = slot.close <= slot.open;
    if (isNightShift) {
      isOpen = currentTime >= slot.open || currentTime < slot.close;
    } else {
      isOpen = currentTime >= slot.open && currentTime < slot.close;
    }

    return {
      state: isOpen ? 'open' : 'closed',
      label: isOpen
        ? (isNightShift
            ? tFn('operations.openUntilTomorrow', { time: slot.close })
            : tFn('operations.openUntil', { time: slot.close }))
        : tFn('operations.closedHours', { hours: `${slot.open}–${slot.close}` }),
      todayKey: dayKey,
    };
  } catch {
    return { state: 'unknown', label: tFn('operations.scheduleUndefined') };
  }
}

type TerminalStatus = { state: 'open' | 'closed' | 'offline' | 'unlinked' | 'unknown'; label: string };

function getTerminalStatus(
  terminal: { id?: string; syrve_terminal_id?: string | null },
  locations: Array<{ syrve_terminal_group_id?: string | null; working_hours?: unknown; timezone?: string | null }>,
  aliveMap: Map<string, boolean> | undefined,
  tFn: (key: string) => string,
): TerminalStatus {
  if (aliveMap && terminal.id && aliveMap.has(terminal.id)) {
    const isAlive = aliveMap.get(terminal.id);
    if (!isAlive) return { state: 'offline', label: tFn('operations.terminalUnavailable') };
  }

  if (!terminal.syrve_terminal_id) return { state: 'unlinked', label: tFn('operations.unlinked') };
  const loc = locations.find((l: any) => l.syrve_terminal_group_id === terminal.syrve_terminal_id);
  if (!loc) return { state: 'unlinked', label: tFn('operations.unlinked') };
  const wh = loc.working_hours as WorkingHoursMap | null;
  const tz = loc.timezone ?? 'Europe/Kyiv';
  const result = isRestaurantOpen(wh, tz, tFn);
  return { state: result.state, label: result.label };
}

/* ─── Main Page ─── */

export default function OperationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentAccount, locations } = useAccount();
  const accountId = currentAccount?.id;

  const { data: organizations, isLoading: orgsLoading } = useSyrveOrganizations();
  const selectedOrgs = useMemo(() => (organizations as any[])?.filter((o: any) => o.is_selected) ?? [], [organizations]);
  const selectedOrgIds = useMemo(() => selectedOrgs.map((o: any) => o.id), [selectedOrgs]);

  const { data: terminals, isLoading: terminalsLoading } = useSyrveTerminalGroups(selectedOrgIds);
  const selectedTerminals = useMemo(() => (terminals as any[])?.filter((t: any) => t.is_selected) ?? [], [terminals]);

  const { data: courierGroups, isLoading: couriersLoading } = useSyrveCouriersMultiOrg(selectedOrgs);
  const { data: allCourierLocations, isLoading: locationsLoading } = useSyrveCourierLocationsMultiOrg(selectedOrgs);

  const terminalIds = useMemo(() => selectedTerminals.map((t: any) => t.id), [selectedTerminals]);
  const { data: aliveData, isLoading: aliveLoading } = useQuery({
    queryKey: ['syrve-terminals-alive', selectedOrgIds, terminalIds],
    queryFn: () => syrveApi.getTerminalsAliveStatus(selectedOrgIds, terminalIds, accountId),
    enabled: !!accountId && selectedOrgIds.length > 0 && terminalIds.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const aliveMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if ((aliveData as any)?.isAliveStatus) {
      for (const s of (aliveData as any).isAliveStatus) {
        map.set(s.terminalGroupId, s.isAlive);
      }
    }
    return map;
  }, [aliveData]);

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['syrve-terminal-groups'] }),
      queryClient.invalidateQueries({ queryKey: ['syrve-terminals-alive'] }),
      queryClient.invalidateQueries({ queryKey: ['syrve-couriers-multi'] }),
      queryClient.invalidateQueries({ queryKey: ['syrve-active-courier-locations-multi'] }),
    ]);
    setTimeout(() => setRefreshing(false), TIMING.UI_FEEDBACK_MS);
  };

  const accountLocations = useMemo(
    () => locations.filter((l: any) => l.account_id === accountId),
    [locations, accountId],
  );

  const terminalStatuses = useMemo(
    () => selectedTerminals.map((term: any) => ({ terminal: term, status: getTerminalStatus(term, accountLocations as any, aliveMap, t) })),
    [selectedTerminals, accountLocations, aliveMap],
  );
  const openTerminalsCount = terminalStatuses.filter((ts: any) => ts.status.state === 'open').length;
  const offlineCount = terminalStatuses.filter((ts: any) => ts.status.state === 'offline').length;

  const totalCouriers = useMemo(() => {
    return ((courierGroups as any[]) ?? []).reduce((sum: number, g: any) => sum + g.couriers.length, 0);
  }, [courierGroups]);

  const courierLocationMap = useMemo(() => {
    const map = new Map<string, { latitude: number; longitude: number; updatedAt?: string }>();
    for (const loc of ((allCourierLocations as any[]) ?? []) as Array<Record<string, unknown>>) {
      const id = (loc.courierId ?? loc.id ?? loc.employeeId) as string;
      const coords = loc.coordinates as Record<string, unknown> | undefined;
      if (id && coords) {
        map.set(id, {
          latitude: coords.latitude as number,
          longitude: coords.longitude as number,
          updatedAt: (coords.date ?? loc.lastUpdateTime) as string | undefined,
        });
      } else if (id && loc.latitude != null) {
        map.set(id, {
          latitude: loc.latitude as number,
          longitude: loc.longitude as number,
          updatedAt: loc.lastUpdateTime as string | undefined,
        });
      }
    }
    return map;
  }, [allCourierLocations]);

  // Shift status cache
  const [shiftCache, setShiftCache] = useState<Map<string, boolean>>(new Map());
  const [checkingShiftsForOrg, setCheckingShiftsForOrg] = useState<string | null>(null);
  const stopCheckingRef = useRef(false);

  type CourierFilter = 'all' | 'gps' | 'shiftOpen' | 'shiftClosed';
  const [courierFilter, setCourierFilter] = useState<CourierFilter>('all');
  const [courierSearch, setCourierSearch] = useState('');

  const handleCheckShiftsForOrg = useCallback(async (orgId: string) => {
    if (!courierGroups || selectedTerminals.length === 0) return;

    if (checkingShiftsForOrg === orgId) {
      stopCheckingRef.current = true;
      return;
    }

    stopCheckingRef.current = false;
    setCheckingShiftsForOrg(orgId);
    const newCache = new Map<string, boolean>(shiftCache);
    const terminalId = selectedTerminals[0]?.id;
    const group = (courierGroups as any[]).find((g: any) => g.orgId === orgId);
    if (!group) { setCheckingShiftsForOrg(null); return; }

    for (const courier of group.couriers) {
      if (stopCheckingRef.current) break;
      const id = (courier.id ?? courier.employeeId) as string;
      if (!id) continue;
      try {
        const result = await syrveApi.isShiftOpen(orgId, terminalId, id);
        newCache.set(id, (result as any)?.isSessionOpened === true);
        setShiftCache(new Map(newCache));
      } catch {
        // skip failed checks
      }
      await new Promise(r => setTimeout(r, 200));
    }
    setCheckingShiftsForOrg(null);
    stopCheckingRef.current = false;
  }, [courierGroups, selectedTerminals, shiftCache, checkingShiftsForOrg]);

  // Filter courier groups
  const filteredCourierGroups = useMemo(() => {
    if (!courierGroups) return [];
    const searchLower = courierSearch.toLowerCase();
    return (courierGroups as any[]).map((group: any) => ({
      ...group,
      couriers: group.couriers.filter((courier: any) => {
        const id = (courier.id ?? courier.employeeId) as string;
        if (courierFilter === 'gps' && !courierLocationMap.has(id)) return false;
        if (courierFilter === 'shiftOpen' && shiftCache.get(id) !== true) return false;
        if (courierFilter === 'shiftClosed' && !(shiftCache.has(id) && shiftCache.get(id) === false)) return false;
        if (searchLower) {
          const fields = [courier.displayName, courier.name, courier.firstName, courier.lastName] as Array<string | undefined>;
          if (!fields.some((f: any) => f?.toLowerCase().includes(searchLower))) return false;
        }
        return true;
      }),
    })).filter((g: any) => g.couriers.length > 0 || (courierFilter === 'all' && !courierSearch));
  }, [courierGroups, courierFilter, courierLocationMap, shiftCache, courierSearch]);

  const [selectedCourier, setSelectedCourier] = useState<Record<string, unknown> | null>(null);
  const [selectedCourierOrgId, setSelectedCourierOrgId] = useState<string | undefined>();
  const [courierSheetOpen, setCourierSheetOpen] = useState(false);

  const handleCourierClick = useCallback((courier: Record<string, unknown>, orgId: string) => {
    setSelectedCourier(courier);
    setSelectedCourierOrgId(orgId);
    setCourierSheetOpen(true);
  }, []);

  const firstTerminalId = selectedTerminals[0]?.id;
  const isLoading = orgsLoading || terminalsLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('operations.title')}
          subtitle={t('operations.subtitle')}
          actions={
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {t('operations.refresh')}
            </Button>
          }
        />

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('operations.terminals')}</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{selectedTerminals.length}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {t('operations.terminalsAvailable', { open: openTerminalsCount, total: selectedTerminals.length })}
                {offlineCount > 0 && (
                  <span className="text-destructive ml-1">· {t('operations.offline', { count: offlineCount })}</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('operations.locations')}</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{accountLocations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('operations.locationsOpen', {
                      count: accountLocations.filter((l: any) => {
                        const wh = l.working_hours as WorkingHoursMap | null;
                        return isRestaurantOpen(wh, l.timezone ?? 'Europe/Kyiv', t).state === 'open';
                      }).length,
                    })}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('operations.couriers')}</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {couriersLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalCouriers}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('operations.withActiveGeo', { count: courierLocationMap.size })}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Terminal Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              {t('operations.syrveTerminals')}
            </CardTitle>
            <CardDescription>{t('operations.syrveTerminalsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : selectedTerminals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <WifiOff className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>{t('operations.noSelectedTerminals')}</p>
                <p className="text-xs mt-1">{t('operations.goToIntegrations')}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {terminalStatuses.map(({ terminal, status }: any) => {
                  const org = selectedOrgs.find((o: any) => o.id === terminal.organization_id);
                  const isOpen = status.state === 'open';
                  const isClosed = status.state === 'closed';
                  const isOffline = status.state === 'offline';
                  const isUnknown = status.state === 'unknown';
                  return (
                    <div
                      key={terminal.id}
                      className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => {
                        const linkedLocation = accountLocations.find(
                          (l: any) => l.syrve_terminal_group_id === terminal.syrve_terminal_id
                        );
                        if (linkedLocation) {
                          router.push(`${ROUTES.restaurants}?editLocationId=${(linkedLocation as any).id}`);
                        } else {
                          router.push(ROUTES.restaurants);
                          toast({ title: t('operations.linkTerminalHint') });
                        }
                      }}
                    >
                      <div className="mt-0.5">
                        <Tooltip>
                          <TooltipTrigger>
                            {isOffline ? (
                              <WifiOff className="h-5 w-5 text-destructive" />
                            ) : isOpen ? (
                              <Wifi className="h-5 w-5 text-success" />
                            ) : isClosed ? (
                              <AlertTriangle className="h-5 w-5 text-warning" />
                            ) : isUnknown ? (
                              <HelpCircle className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Wifi className="h-5 w-5 text-muted-foreground" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>{status.label}</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{terminal.name}</div>
                        {terminal.address && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{terminal.address}</span>
                          </div>
                        )}
                        {org && (
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {t('operations.org')}: {(org as any).name}
                          </div>
                        )}
                      </div>
                      <StatusBadge
                        intent={
                          isOffline ? 'danger'
                            : isOpen ? 'success'
                            : isClosed ? 'warning'
                            : 'neutral'
                        }
                        icon={
                          isOffline ? <XCircle className="h-3 w-3" />
                            : isOpen ? <CheckCircle2 className="h-3 w-3" />
                            : isClosed ? <AlertTriangle className="h-3 w-3" />
                            : isUnknown ? <HelpCircle className="h-3 w-3" />
                            : null
                        }
                        label={
                          isOffline ? t('operations.statusOffline')
                            : isOpen ? t('operations.statusActive')
                            : isClosed ? t('operations.statusClosed')
                            : isUnknown ? t('operations.statusUnknown')
                            : t('operations.statusUnlinked')
                        }
                        className="text-[10px] shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restaurant Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('operations.workingHours')}
            </CardTitle>
            <CardDescription>{t('operations.workingHoursDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {accountLocations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>{t('operations.noLocations')}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {accountLocations.map((location: any) => {
                  const wh = location.working_hours as WorkingHoursMap | null;
                  const tz = location.timezone ?? 'Europe/Kyiv';
                  const status = isRestaurantOpen(wh, tz, t);

                  return (
                    <div key={location.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm truncate flex-1 mr-2">{location.name}</div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => router.push(`${ROUTES.restaurants}?editLocationId=${location.id}`)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('operations.editSchedule')}</TooltipContent>
                          </Tooltip>
                          <StatusBadge
                            intent={status.state === 'open' ? 'success' : status.state === 'closed' ? 'danger' : 'neutral'}
                            icon={
                              status.state === 'open' ? <CheckCircle2 className="h-3 w-3" />
                                : status.state === 'closed' ? <XCircle className="h-3 w-3" />
                                : <HelpCircle className="h-3 w-3" />
                            }
                            label={
                              status.state === 'open' ? t('operations.open')
                                : status.state === 'closed' ? t('operations.closed')
                                : t('operations.statusUnknown')
                            }
                            className="text-[10px]"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">{status.label}</p>

                      {location.address && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{location.address}</span>
                        </div>
                      )}

                      {wh && (
                        <div className="flex flex-wrap gap-1.5">
                          {DAY_KEYS.map(day => {
                            const slot = wh[day];
                            const isToday = status.todayKey === day;
                            return (
                              <Tooltip key={day}>
                                <TooltipTrigger>
                                  <div
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                      !slot
                                        ? 'bg-destructive/5 border-destructive/20 text-destructive'
                                        : isToday
                                          ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                                          : 'bg-muted border-border text-muted-foreground'
                                    }`}
                                  >
                                    {t(`operations.days.${day}`)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {slot ? `${slot.open} – ${slot.close}` : t('operations.closed')}
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Couriers */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('operations.couriers')}
                </CardTitle>
                <CardDescription>
                  {selectedOrgs.length > 0
                    ? t('operations.couriersDesc')
                    : t('operations.selectOrgForCouriers')}
                </CardDescription>
              </div>
            </div>
            {/* Filter buttons */}
            {selectedOrgs.length > 0 && totalCouriers > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Input
                  placeholder={t('operations.searchCourier')}
                  value={courierSearch}
                  onChange={(e: any) => setCourierSearch(e.target.value)}
                  className="h-7 text-xs w-48"
                />
                {(['all', 'gps', 'shiftOpen', 'shiftClosed'] as CourierFilter[]).map(f => (
                  <Button
                    key={f}
                    variant={courierFilter === f ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCourierFilter(f)}
                  >
                    {t(`operations.filter_${f}`)}
                  </Button>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedOrgs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Truck className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>{t('operations.noSelectedOrg')}</p>
              </div>
            ) : couriersLoading || locationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : totalCouriers === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>{t('operations.noCouriers')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCourierGroups.map((group: any) => (
                  <Collapsible key={group.orgId}>
                    <div className="flex items-center justify-between gap-2">
                      <CollapsibleTrigger className="flex items-center gap-2 py-2 group flex-1 min-w-0 text-left">
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90 shrink-0" />
                        <h4 className="text-sm font-semibold truncate">{group.orgName}</h4>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {group.couriers.length}
                        </Badge>
                      </CollapsibleTrigger>
                      {selectedTerminals.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs shrink-0"
                          onClick={() => handleCheckShiftsForOrg(group.orgId)}
                          disabled={checkingShiftsForOrg !== null && checkingShiftsForOrg !== group.orgId}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${checkingShiftsForOrg === group.orgId ? 'animate-spin' : ''}`} />
                          {checkingShiftsForOrg === group.orgId
                            ? t('operations.cancelCheck')
                            : t('operations.checkShifts')}
                        </Button>
                      )}
                    </div>
                    <CollapsibleContent>
                      {group.couriers.length === 0 ? (
                        <p className="text-xs text-muted-foreground pt-2">{t('operations.noCouriersInOrg')}</p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-3">
                          {group.couriers.map((courier: any, idx: number) => {
                            const id = (courier.id ?? courier.employeeId ?? `c-${idx}`) as string;
                            const name = ((courier.displayName ?? courier.name ?? courier.firstName ?? t('operations.courierDefault')) as string);
                            const loc = courierLocationMap.get(id);
                            const hasGps = !!loc;
                            const shiftStatus = shiftCache.has(id) ? shiftCache.get(id) : undefined;

                            return (
                              <div
                                key={id}
                                className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => handleCourierClick(courier, group.orgId)}
                              >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  hasGps ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{name}</div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {hasGps ? (
                                      <span className="text-xs text-success flex items-center gap-1">
                                        <Navigation className="h-3 w-3" />
                                        {t('operations.gpsActive')}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">{t('operations.noGeo')}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 items-end shrink-0">
                                  {hasGps && (
                                    <Badge variant="outline" className="text-[10px] border-success text-success">
                                      {t('uiLiterals.common.gps')}
                                    </Badge>
                                  )}
                                  {shiftStatus !== undefined && (
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${
                                        shiftStatus
                                          ? 'border-success text-success'
                                          : 'border-destructive text-destructive'
                                      }`}
                                    >
                                      {shiftStatus ? t('operations.shiftOpen') : t('operations.shiftClosed')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CourierDetailSheet
        open={courierSheetOpen}
        onOpenChange={setCourierSheetOpen}
        courier={selectedCourier}
        organizationId={selectedCourierOrgId}
        terminalGroupId={firstTerminalId}
        location={selectedCourier ? courierLocationMap.get((selectedCourier.id ?? selectedCourier.employeeId ?? '') as string) : undefined}
      />
    </AppLayout>
  );
}
