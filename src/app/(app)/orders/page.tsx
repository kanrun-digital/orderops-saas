"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { StateBlock } from '@/components/app/StateBlock';
import { DataToolbar } from '@/components/app/DataToolbar';
import { FilterChips, type FilterChip } from '@/components/app/FilterChips';
import { SummaryBar, type SummaryItem } from '@/components/app/SummaryBar';
import { RowActionsMenu, type RowAction } from '@/components/app/RowActionsMenu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  ShoppingCart,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Send,
  Package,
  Ban,
  Trash2,
  ArrowUpDown,
  Tag,
  Loader2,
  MapPin,
} from 'lucide-react';
import { PAGINATION } from '@/lib/constants';
import { PROVIDER_CODES } from '@/lib/constants/integrations';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
  useOrdersServerQuery,
  type UnifiedOrder,
  type SortColumn,
  type SortDir,
} from '@/hooks/useOrdersServerQuery';
import { useBitrixUpdateOrderStatus } from '@/hooks/useBitrix';
import { useBoltOrderAction } from '@/hooks/useBolt';
import { useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import { useAccountIntegrations } from '@/hooks/useAccountIntegrations';
import { useIsSystemAdmin } from '@/hooks/useSystemAdmin';
import { useProviderConnections } from '@/hooks/useCustomerDataOps';
import { useAccount } from '@/contexts/AccountContext';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { useSalesboxUpdateOrderStatus } from '@/hooks/salesbox';
import { useCanViewPii } from '@/hooks/useOrderPii';
import { useAssignOrder, useOrderAssignmentPermissions, useOrderOperators } from '@/hooks/useOrderAssignments';
import {
  statusMeta,
  statusOptions,
  getSourceLabel,
  getSourceBadgeVariant,
  type OrderStatus,
} from '@/lib/orders/config';
import { syrveApi } from '@/lib/api/syrve';
import { platformApi } from '@/lib/api/platforms';
import { getBulkEligibility } from '@/lib/orders/bulkEligibility';
import { normalizeOrderDeliveryType } from '@/lib/orders/deliveryType';
import { resolveAssignedOperator } from '@/lib/orders/assignedOperator';
import { cn } from '@/lib/utils';
import { getPhoneByPiiPolicy, maskPhoneForDisplay } from '@/lib/orders/piiPhone';

const t = (key: string, params?: Record<string, any>) => key;

function getOrderDisplayId(
  order: Pick<UnifiedOrder, 'id' | 'externalId'> | null | undefined,
): string {
  if (!order) return '';
  return order.externalId || order.id;
}

type LocalizedOrderError = Error & {
  i18nKey?: string;
  i18nParams?: Record<string, string | number>;
};

type OrdersPageQueryError = Error & {
  code?: string;
  details?: string;
  hint?: string;
  traceId?: string;
};

const shouldShowSourceChips = (sourceChipsLength: number, sourceFilter: string): boolean =>
  sourceChipsLength > 0 || sourceFilter !== 'all';

const buildVisibleSourceChips = (
  perSourceCounts: Record<string, number>,
  dynamicSourceOptions: Array<{ value: string; label: string }>,
  sourceFilter: string,
): FilterChip[] => {
  const dynamicLabels = new Map(dynamicSourceOptions.map((opt) => [opt.value, opt.label]));
  const allSourceEntries = Object.entries(perSourceCounts);
  const visibleSourceEntries = allSourceEntries
    .filter(([sourceKey, count]) => count > 0 || sourceKey === sourceFilter)
    .map(([sourceKey, count]) => ({
      value: sourceKey,
      label: dynamicLabels.get(sourceKey) ?? getSourceLabel(sourceKey),
      count,
    }));

  if (visibleSourceEntries.length > 0) {
    return visibleSourceEntries;
  }

  return allSourceEntries.map(([sourceKey, count]) => ({
    value: sourceKey,
    label: dynamicLabels.get(sourceKey) ?? getSourceLabel(sourceKey),
    count,
  }));
};

const buildStatusChips = (
  perStatusCounts: Record<string, number>,
  tFn: (key: string) => string,
): FilterChip[] =>
  statusOptions.map((opt) => ({
    value: opt.value,
    label: tFn(opt.label),
    count: perStatusCounts[opt.value] ?? 0,
  }));

const buildDiscountChips = (
  withDiscount: number,
  withoutDiscount: number,
  tFn: (key: string) => string,
): FilterChip[] => [
  {
    value: 'with_discount',
    label: tFn('orders.filterWithDiscount'),
    count: withDiscount,
  },
  {
    value: 'no_discount',
    label: tFn('orders.filterNoDiscount'),
    count: withoutDiscount,
  },
];


export default function OrdersPage() {
  const router = useRouter();
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [discountFilter, setDiscountFilter] = useState<'all' | 'with_discount' | 'no_discount'>(
    'all',
  );
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'mine' | 'unassigned' | 'operator'>('all');
  const [assignmentOperatorId, setAssignmentOperatorId] = useState<string>('all');
  const [cancelDialogOrder, setCancelDialogOrder] = useState<UnifiedOrder | null>(null);
  const [deleteDialogOrder, setDeleteDialogOrder] = useState<UnifiedOrder | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState<number>(PAGINATION.DEFAULT_PAGE);

  const ORDER_PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE;

  const createLocalizedError = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const error = new Error(key) as LocalizedOrderError;
      error.i18nKey = key;
      error.i18nParams = params;
      return error;
    },
    [],
  );

  const getLocalizedErrorMessage = useCallback(
    (error: unknown, fallbackKey = 'orders.unknownError') => {
      if (error && typeof error === 'object' && 'i18nKey' in error) {
        const localizedError = error as LocalizedOrderError;
        if (localizedError.i18nKey) {
          return t(localizedError.i18nKey, localizedError.i18nParams);
        }
      }
      return t(fallbackKey);
    },
    [],
  );

  const { currentAccount, currentLocation, currentRole, loading: accountLoading } = useAccount();
  const user = useAuthStore((s: any) => s.user);
  const accountId = currentAccount?.id ?? null;
  const { data: accountIntegrations } = useAccountIntegrations(accountId);
  const canViewPii = useCanViewPii();
  const { data: operators = [] } = useOrderOperators();
  const { data: assignmentPermissions } = useOrderAssignmentPermissions();
  const assignOrder = useAssignOrder();

  // ── Fetch restaurant locations for filter (NCB) ──
  const { data: locations = [] } = useQuery({
    queryKey: ['restaurant-locations-filter', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const res = await fetch(
        `/api/data/restaurant_locations?account_id=eq.${accountId}&order=name.asc&select=id,name`,
        { credentials: 'include' },
      );
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!accountId,
  });

  // ── Server-side query: data + facets in parallel ─────────────────────────
  const {
    data: serverData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useOrdersServerQuery({
    page: currentPage,
    pageSize: ORDER_PAGE_SIZE,
    sourceFilter,
    statusFilter,
    discountFilter,
    locationFilter,
    assignmentFilter,
    assignmentOperatorId: assignmentOperatorId === 'all' ? undefined : assignmentOperatorId,
    searchQuery,
    sortColumn,
    sortDirection,
  });

  const orders = serverData?.orders ?? [];
  const totalCount = serverData?.totalCount ?? 0;
  const facets = serverData?.facets;
  const needsAttentionCount = serverData?.needsAttentionCount ?? 0;
  const sentToPosCount = serverData?.sentToPosCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ORDER_PAGE_SIZE));
  const queryError = (error as OrdersPageQueryError | null) ?? null;
  const errorTraceId = queryError?.traceId;
  const hasDebugErrorMeta = Boolean(queryError?.code || queryError?.details || queryError?.hint);
  const showOrdersLoadError = !accountLoading && Boolean(currentAccount?.id) && isError;

  const { data: connections = [] } = useProviderConnections();
  const { data: isAdmin = false } = useIsSystemAdmin();
  const canViewDebugErrorMeta = isAdmin || currentRole === 'owner' || currentRole === 'admin';
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();
  const bitrixUpdateStatus = useBitrixUpdateOrderStatus();
  const boltOrderAction = useBoltOrderAction();
  const salesboxUpdateStatus = useSalesboxUpdateOrderStatus();
  const queryClient = useQueryClient();

  // Dynamic source filter options from active connections
  const dynamicSourceOptions = useMemo(() => {
    const active = connections.filter((c: any) => c.status === 'active');
    return active.map((c: any) => ({
      value: c.provider_code,
      label: c.name || getSourceLabel(c.provider_code),
    }));
  }, [connections]);

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter, statusFilter, discountFilter, locationFilter, assignmentFilter, assignmentOperatorId]);

  // Build filter chips from server facets
  const perStatusCounts = facets?.perStatus ?? {};
  const perSourceCounts = facets?.perSource ?? {};
  const fullStatusCount = Object.values(perStatusCounts).reduce((a: any, b: any) => a + b, 0);
  const fullSourceCount = Object.values(perSourceCounts).reduce((a: any, b: any) => a + b, 0);

  const statusChips: FilterChip[] = useMemo(
    () => buildStatusChips(perStatusCounts, t),
    [perStatusCounts],
  );

  const sourceChips: FilterChip[] = useMemo(
    () => buildVisibleSourceChips(perSourceCounts, dynamicSourceOptions, sourceFilter),
    [dynamicSourceOptions, perSourceCounts, sourceFilter],
  );

  const discountChips: FilterChip[] = useMemo(
    () => buildDiscountChips(facets?.withDiscount ?? 0, facets?.withoutDiscount ?? 0, t),
    [facets],
  );

  const locationChips: FilterChip[] = useMemo(
    () =>
      locations.map((loc: any) => ({
        value: loc.id,
        label: loc.name || loc.id.slice(0, 8),
      })),
    [locations],
  );

  // Summary bar
  const hasActiveFilters =
    sourceFilter !== 'all' || statusFilter !== 'all' || discountFilter !== 'all' || locationFilter !== 'all';
  const unifiedAllCount = totalCount;
  const summaryItems: SummaryItem[] = useMemo(() => {
    const totalLabel = hasActiveFilters
      ? t('orders.summaryShownOfTotal', { shown: totalCount, total: fullStatusCount })
      : t('orders.totalOrders');
    const items: SummaryItem[] = [
      { label: totalLabel, value: hasActiveFilters ? totalCount : fullStatusCount },
    ];
    if (needsAttentionCount > 0) {
      items.push({
        label: t('orders.needsAttention'),
        value: needsAttentionCount,
        highlight: 'warning',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
      });
    }
    if (sentToPosCount > 0) {
      items.push({
        label: t('orders.sentToPOS'),
        value: sentToPosCount,
        highlight: 'success',
      });
    }
    return items;
  }, [needsAttentionCount, sentToPosCount, totalCount, fullStatusCount, hasActiveFilters]);

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const pageIds = orders.map((o: any) => o.id);
    const allPageSelected = pageIds.every((id: any) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id: any) => next.delete(id));
      } else {
        pageIds.forEach((id: any) => next.add(id));
      }
      return next;
    });
  }, [selectedIds, orders]);

  const handleSort = useCallback((col: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === col) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDirection('desc');
      return col;
    });
    setCurrentPage(1);
  }, []);

  // --- Business logic (unchanged) ---
  const syrveConnection = useMemo(() => {
    const conns = accountIntegrations?.connections ?? [];
    return (
      conns.find((connection: any) => {
        const providerCode = connection.integration_providers?.code;
        const status = connection.status?.toLowerCase();
        if (providerCode !== PROVIDER_CODES.SYRVE) return false;
        if (status !== 'active' && status !== 'connected') return false;
        if (!currentLocation?.id) return true;
        return true;
      }) ?? null
    );
  }, [accountIntegrations?.connections, currentLocation?.id]);

  const autoSendEnabled = useMemo(() => {
    if (!currentAccount?.settings || typeof currentAccount.settings !== 'object') return false;
    if (Array.isArray(currentAccount.settings)) return false;
    const settings = currentAccount.settings as Record<string, unknown>;
    const direct = settings.auto_send_to_pos;
    const nested =
      settings.account_settings &&
      typeof settings.account_settings === 'object' &&
      !Array.isArray(settings.account_settings)
        ? (settings.account_settings as Record<string, unknown>).auto_send_to_pos
        : undefined;
    return Boolean(direct ?? nested);
  }, [currentAccount?.settings]);

  const organizationId = currentLocation?.syrve_org_id ?? null;
  const terminalGroupId = currentLocation?.syrve_terminal_group_id ?? null;

  const posBlockReason = useMemo(() => {
    if (!syrveConnection)
      return {
        canSend: false,
        reasonKey: 'orders.posBlockNoCredentials',
        href: '/app/integrations',
      } as const;
    if (!currentLocation)
      return {
        canSend: false,
        reasonKey: 'orders.posBlockNoLocation',
        href: '/app/restaurants',
      } as const;
    if (!currentLocation.syrve_org_id)
      return {
        canSend: false,
        reasonKey: 'orders.posBlockNoOrg',
        href: '/app/restaurants',
      } as const;
    if (!currentLocation.syrve_terminal_group_id)
      return {
        canSend: false,
        reasonKey: 'orders.posBlockNoTerminal',
        href: '/app/restaurants',
      } as const;
    return { canSend: true, reasonKey: null, href: null } as const;
  }, [syrveConnection, currentLocation]);

  const canSendToSyrve = posBlockReason.canSend;

  const canCancelOrder = (order: UnifiedOrder) =>
    statusMeta[order.status as OrderStatus]?.isCancellable ?? false;

  const buildCreateOrderOptions = (order: UnifiedOrder) => {
    const rawOrder = order as unknown as Record<string, unknown>;
    const guestsCount = Number(rawOrder.guestsCount ?? rawOrder.guest_count);
    const splitBetweenPersons = rawOrder.splitBetweenPersons;
    return {
      ...(typeof rawOrder.completeBefore === 'string' ? { completeBefore: rawOrder.completeBefore } : {}),
      ...(Number.isFinite(guestsCount)
        ? {
          guests: {
            count: guestsCount,
            ...(typeof splitBetweenPersons === 'boolean' ? { splitBetweenPersons } : {}),
          },
        }
        : {}),
      ...(typeof rawOrder.operatorId === 'string' ? { operatorId: rawOrder.operatorId } : {}),
      ...(typeof rawOrder.phoneExtension === 'string' ? { phoneExtension: rawOrder.phoneExtension } : {}),
      ...(typeof rawOrder.sourceKey === 'string' ? { sourceKey: rawOrder.sourceKey } : {}),
      ...(Array.isArray(rawOrder.externalData) ? { externalData: rawOrder.externalData } : {}),
      ...(rawOrder.chequeAdditionalInfo && typeof rawOrder.chequeAdditionalInfo === 'object'
        ? { chequeAdditionalInfo: rawOrder.chequeAdditionalInfo }
        : {}),
    };
  };

  const handleSendToSyrve = async (order: UnifiedOrder) => {
    if (!organizationId || !terminalGroupId || !syrveConnection) {
      toast.error(t('orders.syrveNotConfigured'), {
        description: t('orders.syrveNotConfiguredDesc'),
      });
      return;
    }

    toast.info(t('orders.sendingToSyrve'), {
      description: `${t('orders.orderLabel')} ${getOrderDisplayId(order)}`,
    });

    try {
      const response = await syrveApi.createOrder(
        order.id,
        organizationId,
        terminalGroupId,
        buildCreateOrderOptions(order),
      );
      const errorInfo = response?.orderInfo?.errorInfo;

      if (errorInfo) {
        throw createLocalizedError('orders.errors.syrveApiError', {
          message: errorInfo.description || errorInfo.message || t('orders.errors.syrveUnknown'),
        });
      }

      if (
        response?.orderInfo?.creationStatus &&
        response.orderInfo.creationStatus.toLowerCase() !== 'success'
      ) {
        throw createLocalizedError('orders.errors.syrveStatus', {
          status: response.orderInfo.creationStatus,
        });
      }

      const syrveOrderId = response?.orderInfo?.order?.id ?? response?.orderInfo?.id ?? null;

      if (!syrveOrderId) {
        throw createLocalizedError('orders.errors.syrveMissingOrderId');
      }

      await updateOrder.mutateAsync({
        orderId: order.id,
        updates: { syrve_order_id: syrveOrderId } as any,
      });

      toast.success(t('orders.sentToSyrve'), {
        description: `${t('orders.orderLabel')} ${getOrderDisplayId(order)} ${t('orders.queuedInPOS')}`,
      });
    } catch (err) {
      console.error('Failed to send order to Syrve:', err);
      toast.error(t('orders.sendToSyrveFailed'), {
        description: getLocalizedErrorMessage(err),
      });
    }
  };

  const cancelDispatch: Record<string, (order: UnifiedOrder) => Promise<void>> = useMemo(
    () => ({
      bitrix: async (order) => {
        const bitrixOrderId = order.bitrixOrderId ?? order.externalId;
        if (!bitrixOrderId) throw createLocalizedError('orders.errors.bitrixOrderIdMissing');
        await bitrixUpdateStatus.mutateAsync({ action: 'cancel', bitrixOrderId });
      },
      salesbox: async (order) => {
        const salesboxOrderId = order.salesboxOrderId ?? order.externalId;
        if (!salesboxOrderId) throw createLocalizedError('orders.errors.salesboxOrderIdMissing');
        await salesboxUpdateStatus.mutateAsync({ orderId: salesboxOrderId, status: 'cancelled' });
      },
      bolt_food: async (order) => {
        const boltProviderId = order.externalId;
        const boltOrderId = order.platformOrderId ?? order.externalId;
        if (!boltProviderId || !boltOrderId)
          throw createLocalizedError('orders.errors.boltOrderIdentifiersMissing');
        await boltOrderAction.mutateAsync({
          action: 'reject_order',
          providerId: boltProviderId,
          orderId: Number(boltOrderId),
        });
      },
      [PROVIDER_CODES.GLOVO]: async (order) => {
        const externalOrderId = order.platformOrderId ?? order.externalId;
        if (!externalOrderId) throw createLocalizedError('orders.errors.platformOrderIdMissing');
        await platformApi.pushStatus(PROVIDER_CODES.GLOVO, externalOrderId, 'cancelled');
      },
      [PROVIDER_CODES.WOLT]: async (order) => {
        const externalOrderId = order.platformOrderId ?? order.externalId;
        if (!externalOrderId) throw createLocalizedError('orders.errors.platformOrderIdMissing');
        await platformApi.pushStatus(PROVIDER_CODES.WOLT, externalOrderId, 'cancelled');
      },
      [PROVIDER_CODES.UBER_EATS]: async (order) => {
        const externalOrderId = order.platformOrderId ?? order.externalId;
        if (!externalOrderId) throw createLocalizedError('orders.errors.platformOrderIdMissing');
        await platformApi.pushStatus(PROVIDER_CODES.UBER_EATS, externalOrderId, 'cancelled');
      },
      [PROVIDER_CODES.MENU_UA]: async (order) => {
        const externalOrderId = order.platformOrderId ?? order.externalId;
        if (!externalOrderId) throw createLocalizedError('orders.errors.platformOrderIdMissing');
        await platformApi.pushStatus(PROVIDER_CODES.MENU_UA, externalOrderId, 'cancelled');
      },
    }),
    [bitrixUpdateStatus, boltOrderAction, createLocalizedError, salesboxUpdateStatus],
  );

  const handleCancelOrder = async () => {
    if (!cancelDialogOrder) return;
    setIsCancelling(true);
    try {
      const sourceProvider = cancelDialogOrder.sourceProvider ?? cancelDialogOrder.source;
      const handler = cancelDispatch[sourceProvider];
      if (handler) {
        await handler(cancelDialogOrder);
      } else if (sourceProvider !== 'internal') {
        throw new Error('Cancellation is not supported for this provider.');
      }
      if (!cancelDialogOrder.isRaw) {
        await updateOrder.mutateAsync({
          orderId: cancelDialogOrder.id,
          updates: { status: 'cancelled' as const },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['orders-server'] });
      toast.success(t('orders.orderCancelled'), {
        description: t('orders.orderCancelledDesc', { id: getOrderDisplayId(cancelDialogOrder) }),
      });
      setCancelDialogOrder(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast.error(t('orders.cancelFailed'), {
        description: getLocalizedErrorMessage(err),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteDialogOrder) return;
    setIsDeleting(true);
    try {
      await deleteOrder.mutateAsync(deleteDialogOrder.id);
      toast.success(t('orders.orderDeleted'), {
        description: t('orders.orderDeletedDesc', { id: getOrderDisplayId(deleteDialogOrder) }),
      });
      setDeleteDialogOrder(null);
    } catch (err) {
      console.error('Failed to delete order:', err);
      toast.error(t('orders.deleteFailed'), {
        description: getLocalizedErrorMessage(err),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk eligibility from current page orders
  const { eligibleForPOS, eligibleForCancel } = useMemo(
    () => getBulkEligibility(orders, selectedIds),
    [orders, selectedIds],
  );

  const [isBulkCancelling, setIsBulkCancelling] = useState(false);

  const handleBulkSendToSyrve = async () => {
    if (!organizationId || !terminalGroupId || !syrveConnection) return;
    const eligible = eligibleForPOS;
    if (eligible.length === 0) return;

    setIsBulkSending(true);
    let success = 0;
    let failed = 0;
    const BATCH_SIZE = 10;

    for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
      const batch = eligible.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (order: any) => {
          const response = await syrveApi.createOrder(
            order.id,
            organizationId,
            terminalGroupId,
            buildCreateOrderOptions(order as unknown as UnifiedOrder),
          );
          const errorInfo = response?.orderInfo?.errorInfo;
          if (errorInfo) {
            throw createLocalizedError('orders.errors.syrveApiError', {
              message:
                errorInfo.description || errorInfo.message || t('orders.errors.syrveUnknown'),
            });
          }
          if (response?.orderInfo?.creationStatus?.toLowerCase() !== 'success') {
            throw createLocalizedError('orders.errors.syrveStatus', {
              status: response.orderInfo.creationStatus,
            });
          }
          const syrveOrderId = response?.orderInfo?.order?.id ?? response?.orderInfo?.id;
          if (!syrveOrderId) throw createLocalizedError('orders.errors.noOrderIdReturned');
          await updateOrder.mutateAsync({
            orderId: order.id,
            updates: { syrve_order_id: syrveOrderId } as any,
          });
        }),
      );
      for (const r of results) {
        if (r.status === 'fulfilled') success++;
        else failed++;
      }
      toast.info(t('orders.bulkSendProgress', { done: success + failed, total: eligible.length }));
    }

    setIsBulkSending(false);
    setSelectedIds(new Set());
    await queryClient.invalidateQueries({ queryKey: ['orders'] });
    await queryClient.invalidateQueries({ queryKey: ['orders-server'] });

    if (failed === 0) {
      toast.success(t('orders.bulkSendSuccess', { success, total: eligible.length }));
    } else if (success > 0) {
      toast.warning(t('orders.bulkSendPartial', { success, total: eligible.length, failed }));
    } else {
      toast.error(t('orders.bulkSendFailed'));
    }
  };

  const handleBulkCancel = async () => {
    const eligible = eligibleForCancel;
    if (eligible.length === 0) return;

    setIsBulkCancelling(true);
    let success = 0;
    let failed = 0;
    const BATCH_SIZE = 10;

    for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
      const batch = eligible.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (order: any) => {
          const sourceProvider = order.sourceProvider ?? order.source;
          const handler = cancelDispatch[sourceProvider];
          if (handler) await handler(order);
          if (!order.isRaw) {
            await updateOrder.mutateAsync({
              orderId: order.id,
              updates: { status: 'cancelled' as const },
            });
          }
        }),
      );
      for (const r of results) {
        if (r.status === 'fulfilled') success++;
        else failed++;
      }
    }

    setIsBulkCancelling(false);
    setSelectedIds(new Set());
    await queryClient.invalidateQueries({ queryKey: ['orders'] });
    await queryClient.invalidateQueries({ queryKey: ['orders-server'] });

    if (failed === 0) {
      toast.success(t('orders.bulkCancelSuccess', { success, total: eligible.length }));
    } else if (success > 0) {
      toast.warning(t('orders.bulkCancelPartial', { success, total: eligible.length, failed }));
    } else {
      toast.error(t('orders.bulkCancelFailed'));
    }
  };

  const buildRowActions = (order: UnifiedOrder): RowAction[] => {
    const actions: RowAction[] = [];
    const canEditAssignments = Boolean(assignmentPermissions?.canEditAssignments);
    const isCurrentOperator = user?.id && order.processingOperatorId === user.id;
    actions.push({
      label: t('orders.viewDetails'),
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: () => router.push(`/app/orders/${order.id}`),
      primary: true,
    });
    if (!order.syrveOrderId && order.source !== 'internal') {
      actions.push({
        label: t('orders.sendToPOS'),
        icon: <Send className="h-4 w-4" />,
        onClick: () => handleSendToSyrve(order),
        disabled: !canSendToSyrve,
      });
    }
    if ((canEditAssignments || isCurrentOperator) && !order.processingOperatorId) {
      actions.push({
        label: 'Взяти в роботу',
        icon: <Package className="h-4 w-4" />,
        onClick: () => assignOrder.mutate({ orderId: order.id, nextOperatorId: user?.id ?? null, action: 'take' }),
        disabled: !user?.id || assignOrder.isPending,
      });
    }
    if (order.processingOperatorId) {
      actions.push({
        label: 'Зняти з роботи',
        icon: <Ban className="h-4 w-4" />,
        onClick: () => assignOrder.mutate({ orderId: order.id, nextOperatorId: null, action: 'release' }),
        disabled: !isCurrentOperator && !canEditAssignments,
      });
      actions.push({
        label: 'Передати',
        icon: <RefreshCw className="h-4 w-4" />,
        onClick: () => {
          const candidate = operators.find((operator: any) => operator.id !== order.processingOperatorId);
          if (!candidate) return;
          assignOrder.mutate({
            orderId: order.id,
            nextOperatorId: candidate.id,
            action: 'transfer',
            note: 'manual transfer from list',
          });
        },
        disabled: !canEditAssignments || assignOrder.isPending || operators.length < 2,
      });
    }
    if (canCancelOrder(order)) {
      actions.push({
        label: t('orders.cancelOrder'),
        icon: <Ban className="h-4 w-4" />,
        onClick: () => setCancelDialogOrder(order),
        destructive: true,
      });
    }
    if (isAdmin) {
      actions.push({
        label: t('orders.deleteOrderAdmin'),
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => setDeleteDialogOrder(order),
        destructive: true,
      });
    }
    return actions;
  };

  const SortableHead = ({
    column,
    children,
  }: {
    column: SortColumn;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          className={cn(
            'h-3 w-3 transition-opacity',
            sortColumn === column ? 'opacity-100' : 'opacity-30',
          )}
        />
      </div>
    </TableHead>
  );

  const selectedCount = selectedIds.size;

  return (
    <AppLayout>
      <div className="space-y-4">
        <PageHeader
          title={t('orders.title')}
          subtitle={t('orders.subtitle')}
          actions={
            <div className="flex items-center gap-2">
              {isFetching && !isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('orders.refresh')}
              </Button>
            </div>
          }
        />

        {/* Compact summary bar */}
        <SummaryBar items={summaryItems} />

        {/* Status filter chips */}
        <FilterChips
          chips={statusChips}
          value={statusFilter}
          onChange={setStatusFilter}
          allLabel={t('orders.allStatus')}
          allCount={fullStatusCount}
        />

        {/* Source filter chips */}
        {shouldShowSourceChips(sourceChips.length, sourceFilter) && (
          <FilterChips
            chips={sourceChips}
            value={sourceFilter}
            onChange={setSourceFilter}
            allLabel={t('orders.allSources')}
            allCount={fullSourceCount}
          />
        )}

        {/* Discount filter chips */}
        <FilterChips
          chips={discountChips}
          value={discountFilter}
          onChange={(v: any) => setDiscountFilter(v as 'all' | 'with_discount' | 'no_discount')}
          allLabel={t('orders.filterAllDiscount')}
          allCount={unifiedAllCount}
        />

        {/* Location filter chips */}
        {locationChips.length > 1 && (
          <FilterChips
            chips={locationChips}
            value={locationFilter}
            onChange={setLocationFilter}
            allLabel={t('orders.allLocations')}
          />
        )}

        {/* Toolbar with search + bulk actions */}
        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t('orders.searchPlaceholder')}
          selectedCount={selectedCount}
          filters={
            <>
              <Select value={assignmentFilter} onValueChange={(value: any) => setAssignmentFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('orders.assignmentFilter.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('orders.assignmentFilter.options.all')}</SelectItem>
                  <SelectItem value="mine">{t('orders.assignmentFilter.options.mine')}</SelectItem>
                  <SelectItem value="unassigned">{t('orders.assignmentFilter.options.unassigned')}</SelectItem>
                  <SelectItem value="operator">{t('orders.assignmentFilter.options.operator')}</SelectItem>
                </SelectContent>
              </Select>
              {assignmentFilter === 'operator' && (
                <Select value={assignmentOperatorId} onValueChange={setAssignmentOperatorId}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={t('orders.assignmentFilter.operatorPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((operator: any) => (
                      <SelectItem key={operator.id} value={operator.id}>
                        {operator.full_name ?? operator.email ?? operator.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </>
          }
          bulkActions={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                {t('orders.deselectAll')}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isBulkSending || !canSendToSyrve || eligibleForPOS.length === 0}
                      onClick={handleBulkSendToSyrve}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      {t('orders.sendSelectedToPOS', { count: eligibleForPOS.length })}
                    </Button>
                  </span>
                </TooltipTrigger>
                {(!canSendToSyrve || eligibleForPOS.length === 0) && (
                  <TooltipContent className="flex flex-col gap-1">
                    <span>
                      {!canSendToSyrve
                        ? t(posBlockReason.reasonKey ?? '')
                        : t('orders.sendSelectedToPOSDisabledNoEligible')}
                    </span>
                    {!canSendToSyrve && posBlockReason.href && (
                      <Link
                        href={posBlockReason.href}
                        className="text-xs text-primary underline underline-offset-2"
                      >
                        {t('orders.posBlockGoToSettings')}
                      </Link>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isBulkCancelling || eligibleForCancel.length === 0}
                      onClick={handleBulkCancel}
                    >
                      <Ban className="h-3.5 w-3.5 mr-1.5" />
                      {t('orders.cancelSelected')} ({eligibleForCancel.length})
                    </Button>
                  </span>
                </TooltipTrigger>
                {eligibleForCancel.length === 0 && (
                  <TooltipContent>{t('orders.bulkCancelDisabledNoEligible')}</TooltipContent>
                )}
              </Tooltip>
            </>
          }
        />

        {/* Data table */}
        <StateBlock
          isLoading={isLoading}
          loadingHint="rows"
          loadingCount={5}
          isEmpty={!accountLoading && !isError && orders.length === 0 && !isFetching && !!serverData}
          emptyIcon={<Package className="h-12 w-12" />}
          emptyTitle={showOrdersLoadError ? t('orders.loadErrorTitle') : t('orders.noOrdersFound')}
          emptyDescription={
            showOrdersLoadError
              ? t('orders.loadErrorDescription')
              : searchQuery || sourceFilter !== 'all' || statusFilter !== 'all'
                ? t('orders.tryAdjustingFilters')
                : t('orders.ordersWillAppear')
          }
        >
          {showOrdersLoadError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('orders.loadErrorTitle')}</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>
                  {t('orders.loadErrorDescriptionAdmin')}
                </p>
                {errorTraceId ? (
                  <p className="text-xs text-muted-foreground">Trace ID: {errorTraceId}</p>
                ) : null}
                {canViewDebugErrorMeta && hasDebugErrorMeta ? (
                  <details className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-3 text-xs">
                    <summary className="cursor-pointer font-medium">{t('orders.debugDetailsAdminOnly')}</summary>
                    <div className="mt-2 space-y-1 font-mono">
                      {queryError?.code ? <p>code: {queryError.code}</p> : null}
                      {queryError?.details ? <p>details: {queryError.details}</p> : null}
                      {queryError?.hint ? <p>hint: {queryError.hint}</p> : null}
                    </div>
                  </details>
                ) : null}
                <Button variant="outline" size="sm" onClick={() => void refetch()}>
                  {t('common.actions.refresh')}
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div
                className={cn('rounded-lg border transition-opacity', isFetching && 'opacity-60')}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            orders.length > 0 && orders.every((o: any) => selectedIds.has(o.id))
                              ? true
                              : orders.some((o: any) => selectedIds.has(o.id))
                                ? 'indeterminate'
                                : false
                          }
                          onCheckedChange={toggleSelectAll}
                          aria-label={t('common.accessibility.selectAll')}
                        />
                      </TableHead>
                      <SortableHead column="externalId">{t('orders.tableOrder')}</SortableHead>
                      <TableHead>{t('orders.tableSource')}</TableHead>
                      <TableHead>{t('orders.tableLocation')}</TableHead>
                      <TableHead>{t('orders.tableDeliveryType')}</TableHead>
                      <TableHead>{t('orders.tableCustomer')}</TableHead>
                      <TableHead>{t('orders.tableProcessing')}</TableHead>
                      <SortableHead column="status">{t('orders.tableStatus')}</SortableHead>
                      <SortableHead column="total">{t('orders.tableTotal')}</SortableHead>
                      <TableHead className="w-[110px]">{t('orders.tableDiscount')}</TableHead>
                      <SortableHead column="createdAt">{t('orders.tableTime')}</SortableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: any) => {
                      const orderDisplayId = getOrderDisplayId(order);
                      const sourceKey = order.sourceProvider ?? order.source;
                      const badgeVariant = getSourceBadgeVariant(sourceKey);
                      const sourceLabel = getSourceLabel(sourceKey);
                      const statusConfig =
                        statusMeta[order.status as OrderStatus] || statusMeta.pending;
                      const deliveryType = normalizeOrderDeliveryType({
                        deliveryType: order.deliveryType,
                        deliveryAddress: order.deliveryAddress,
                        deliveryLatitude: order.deliveryLatitude,
                        deliveryLongitude: order.deliveryLongitude,
                      });
                      const deliveryTypeLabel =
                        deliveryType === 'pickup'
                          ? t('orders.deliveryTypePickup')
                          : deliveryType === 'delivery'
                            ? t('orders.deliveryTypeDelivery')
                            : t('orders.deliveryTypeUnknown');
                      const attentionReason = order.attentionReason?.toLowerCase() || '';
                      const autoSendFailed =
                        order.requiresAttention &&
                        (attentionReason.includes('syrve') ||
                          attentionReason.includes('terminal') ||
                          attentionReason.includes('pos'));
                      const assignedOperator = resolveAssignedOperator({
                        processingOperatorId: order.processingOperatorId,
                        processingOperatorName: order.processingOperatorName,
                        crmOperatorInfo: order.crmOperatorInfo,
                      });
                      const assignedOperatorPhone = assignedOperator.source === 'crm'
                        ? getPhoneByPiiPolicy(
                            canViewPii,
                            order.crmOperatorInfo?.phone,
                            order.crmOperatorInfo?.phoneMasked,
                          )
                        : assignedOperator.phone;

                      return (
                        <TableRow
                          key={order.id}
                          className={cn(order.requiresAttention && 'bg-warning/5')}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(order.id)}
                              onCheckedChange={() => toggleSelect(order.id)}
                              aria-label={t('orders.aria.selectOrder', { id: orderDisplayId })}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.requiresAttention && (
                                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                              )}
                              <div>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link
                                      href={`/app/orders/${order.id}`}
                                      className="inline-block max-w-[180px] truncate font-medium text-primary hover:underline"
                                    >
                                      #{orderDisplayId}
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {order.source === PROVIDER_CODES.SYRVE
                                      ? `Syrve POS #${orderDisplayId}`
                                      : order.source === PROVIDER_CODES.SALESBOX
                                        ? `Salesbox #${orderDisplayId}`
                                        : `ID: ${orderDisplayId}`}
                                  </TooltipContent>
                                </Tooltip>
                                {order.locationName && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                    {order.locationName}
                                  </p>
                                )}
                                {order.syrveOrderId && (
                                  <p
                                    className="max-w-[180px] truncate text-xs text-success"
                                    title={t('orders.labels.syrveId', { id: order.syrveOrderId })}
                                  >
                                    {t('orders.labels.syrveId', { id: order.syrveOrderId })}
                                  </p>
                                )}
                                {!order.syrveOrderId && autoSendEnabled && (
                                  <p
                                    className={cn(
                                      'text-xs',
                                      autoSendFailed ? 'text-destructive' : 'text-muted-foreground',
                                    )}
                                  >
                                    {autoSendFailed
                                      ? t('orders.autoSendFailed')
                                      : t('orders.autoSendQueued')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={badgeVariant}>{sourceLabel}</Badge>
                          </TableCell>
                          <TableCell>
                            {order.locationName ? (
                              <span className="text-sm flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate max-w-[120px]">{order.locationName}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{deliveryTypeLabel}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{order.customerName || '—'}</p>
                              <p className="text-xs text-muted-foreground">{canViewPii ? (order.customerPhone || '—') : maskPhoneForDisplay(order.customerPhone)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs">
                              <p>
                                <span>{assignedOperator.label}</span>
                                {assignedOperator.source !== 'none' && (
                                  <Badge variant="outline" className="ml-2">
                                    {assignedOperator.source === 'internal'
                                      ? t('orders.processing.operatorSourceInternal')
                                      : t('orders.processing.operatorSourceCrm')}
                                  </Badge>
                                )}
                              </p>
                              {assignedOperatorPhone && (
                                <p>
                                  <span className="text-muted-foreground">{t('orders.processing.phone')}:</span>{' '}
                                  {assignedOperatorPhone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('gap-1', statusConfig.badgeClass)}>
                              <statusConfig.icon className={statusConfig.iconClass} />
                              {t(statusConfig.label)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {order.total.toLocaleString('uk-UA')} ₴
                          </TableCell>
                          <TableCell>
                            {order.promoDiscount > 0 ? (
                              <div className="flex items-center gap-1 text-success text-sm font-medium">
                                <Tag className="h-3.5 w-3.5 shrink-0" />
                                <span className="tabular-nums">
                                  -{order.promoDiscount.toLocaleString('uk-UA')} ₴
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(order.createdAt), 'd MMM, HH:mm', { locale: uk })}
                          </TableCell>
                          <TableCell>
                            <RowActionsMenu actions={buildRowActions(order)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('orders.page')} {currentPage} / {totalPages} · {totalCount.toLocaleString()}{' '}
                    {t('orders.totalOrders')}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={
                            currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </StateBlock>
      </div>

      <ConfirmDialog
        open={!!cancelDialogOrder}
        onOpenChange={(open: any) => !open && setCancelDialogOrder(null)}
        title={t('orders.cancelOrderTitle')}
        description={
          <>
            {t('orders.cancelOrderConfirm')}{' '}
            <span className="font-semibold">#{getOrderDisplayId(cancelDialogOrder)}</span>?{' '}
            {t('orders.cannotBeUndone')}
          </>
        }
        confirmLabel={isCancelling ? t('orders.cancelling') : t('orders.cancelOrder')}
        confirmVariant="destructive"
        onConfirm={handleCancelOrder}
        isPending={isCancelling}
        cancelLabel={t('orders.keepOrder')}
      />

      <ConfirmDialog
        open={!!deleteDialogOrder}
        onOpenChange={(open: any) => !open && setDeleteDialogOrder(null)}
        title={t('orders.deleteOrderTitle')}
        description={
          <>
            {t('orders.deleteOrderConfirm')}{' '}
            <span className="font-semibold">#{getOrderDisplayId(deleteDialogOrder)}</span>?{' '}
            {t('orders.deleteOrderWarning')}
          </>
        }
        confirmLabel={isDeleting ? t('orders.deleting') : t('orders.deletePermanently')}
        confirmVariant="destructive"
        onConfirm={handleDeleteOrder}
        isPending={isDeleting}
      />
    </AppLayout>
  );
}
