"use client";

import { parseJsonSettings } from '@/lib/utils/settings';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useOrder } from '@/hooks/useOrders';
import { useIsSystemAdmin } from '@/hooks/useSystemAdmin';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package } from 'lucide-react';
import { OrderActionsPanel } from '@/components/orders/OrderActionsPanel';
import { syrveApi } from '@/lib/api/syrve';
import { useUpdateOrder } from '@/hooks/useOrders';
import { LoyaltyCalculateSection } from '@/components/orders/LoyaltyCalculateSection';
import { OrderCustomerCard } from '@/components/orders/OrderCustomerCard';
import { OrderCourierCard } from '@/components/orders/OrderCourierCard';
import { OrderHeader } from '@/components/orders/OrderHeader';
import { OrderItemsCard } from '@/components/orders/OrderItemsCard';
import { OrderStatusCard } from '@/components/orders/OrderStatusCard';
import { OrderRoutingCard } from '@/components/orders/OrderRoutingCard';
import { OrderTransferCard } from '@/components/orders/OrderTransferCard';
import { SalesboxOrderInfoCard } from '@/components/orders/SalesboxOrderInfoCard';
import { OrderSyncTimeline } from '@/components/orders/OrderSyncTimeline';
import { useAccount } from '@/contexts/AccountContext';
import { useSelectedSyrveOrganization, useSyrveRefreshOrder, useLocationSyrveConfig } from '@/hooks/useSyrve';
import { useAssignOrder, useOrderAssignmentHistory, useOrderAssignmentPermissions, useOrderOperators } from '@/hooks/useOrderAssignments';
import { useAuthStore } from '@/stores/auth-store';
import { useCanViewPii } from '@/hooks/useOrderPii';
import { getPhoneByPiiPolicy } from '@/lib/orders/piiPhone';
import { resolveAssignedOperator } from '@/lib/orders/assignedOperator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';

const t = (key: string) => key;

type CourierInfo = {
  id?: string;
  name?: string;
  phone?: string;
  phone_masked?: string;
  is_courier_selected_manually?: boolean;
};

type CrmOperatorInfo = {
  id?: string;
  name?: string;
  phone?: string;
  phone_masked?: string;
  synced_at?: string;
};

const readString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const readBoolean = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

const parseCourierInfoFromSyrveOrder = (order: Record<string, unknown>): CourierInfo | null => {
  const courierInfoRaw =
    (order.courierInfo as Record<string, unknown> | undefined)
    ?? (order.courier_info as Record<string, unknown> | undefined);

  if (!courierInfoRaw || typeof courierInfoRaw !== 'object' || Array.isArray(courierInfoRaw)) {
    return null;
  }

  const nestedCourier = courierInfoRaw.courier as Record<string, unknown> | undefined;
  const courier = nestedCourier ?? courierInfoRaw;

  const parsed: CourierInfo = {
    id: readString(courier.id),
    name: readString(courier.name),
    phone: readString(courier.phone),
    phone_masked: readString(courier.phone_masked),
    is_courier_selected_manually:
      readBoolean(courierInfoRaw.isCourierSelectedManually)
      ?? readBoolean(courierInfoRaw.is_courier_selected_manually)
      ?? readBoolean(courier.isCourierSelectedManually)
      ?? readBoolean(courier.is_courier_selected_manually),
  };

  return parsed.id || parsed.name || parsed.phone || parsed.phone_masked || parsed.is_courier_selected_manually !== undefined
    ? parsed
    : null;
};

const parseCourierInfoFromDb = (value: unknown): CourierInfo | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const courier = value as Record<string, unknown>;
  const parsed: CourierInfo = {
    id: readString(courier.id),
    name: readString(courier.name),
    phone: readString(courier.phone),
    phone_masked: readString(courier.phone_masked),
    is_courier_selected_manually:
      readBoolean(courier.is_courier_selected_manually)
      ?? readBoolean(courier.isCourierSelectedManually),
  };

  return parsed.id || parsed.name || parsed.phone || parsed.phone_masked || parsed.is_courier_selected_manually !== undefined
    ? parsed
    : null;
};

const parseCrmOperatorInfo = (value: unknown): CrmOperatorInfo | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const crmOperator = value as Record<string, unknown>;
  const parsed: CrmOperatorInfo = {
    id: readString(crmOperator.id),
    name: readString(crmOperator.name),
    phone: readString(crmOperator.phone),
    phone_masked: readString(crmOperator.phone_masked),
    synced_at: readString(crmOperator.synced_at),
  };

  return parsed.id || parsed.name || parsed.phone || parsed.phone_masked || parsed.synced_at ? parsed : null;
};

const mergeCourierInfo = (base: CourierInfo | null, incoming: CourierInfo | null): CourierInfo | null => {
  if (!base && !incoming) {
    return null;
  }

  return {
    id: incoming?.id ?? base?.id,
    name: incoming?.name ?? base?.name,
    phone: incoming?.phone ?? base?.phone,
    phone_masked: incoming?.phone_masked ?? base?.phone_masked,
    is_courier_selected_manually:
      incoming?.is_courier_selected_manually ?? base?.is_courier_selected_manually,
  };
};

const isSameCourierInfo = (left: CourierInfo | null, right: CourierInfo | null): boolean => {
  return (
    left?.id === right?.id
    && left?.name === right?.name
    && left?.phone === right?.phone
    && left?.phone_masked === right?.phone_masked
    && left?.is_courier_selected_manually === right?.is_courier_selected_manually
  );
};

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { canView: canViewPii } = useCanViewPii();

  const { data, isLoading, error } = useOrder(id ?? '');
  const { data: isAdmin = false } = useIsSystemAdmin();
  const { currentAccount } = useAccount();
  const { data: selectedOrg } = useSelectedSyrveOrganization();
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const displayName = useAuthStore((s) => s.displayName);
  const currentUser = useMemo(() => {
    if (!session) return null;

    return {
      id: session.id,
      email: session.email,
      name: displayName ?? profile?.display_name ?? profile?.full_name ?? session.email,
      role: session.role ?? null,
    };
  }, [displayName, profile?.display_name, profile?.full_name, session]);
  const { data: operators = [] } = useOrderOperators();
  const { data: assignmentPermissions } = useOrderAssignmentPermissions();
  const assignmentHistory = useOrderAssignmentHistory(id);
  const assignOrder = useAssignOrder();
  const { data: locationConfig } = useLocationSyrveConfig(data?.order?.location_id);
  const [syrveStatus, setSyrveStatus] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [sendingToPOS, setSendingToPOS] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [localCourierInfo, setLocalCourierInfo] = useState<CourierInfo | null>(null);
  const updateOrder = useUpdateOrder();
  const refreshOrder = useSyrveRefreshOrder();

  const handleConfirmOrder = useCallback(async () => {
    if (!data?.order) return;
    try {
      await updateOrder.mutateAsync({ orderId: data.order.id, updates: { status: 'confirmed' } });
      toast.success(t('orders.detail.orderConfirmed'));
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    }
  }, [data?.order, updateOrder]);

  const mapSyrveError = useCallback((msg: string): string => {
    const errorMap: Record<string, string> = {
      'Only confirmed orders can be sent to Syrve': t('syrve.errors.notConfirmed'),
      'terminal is offline': t('syrve.errors.terminalOffline'),
      'No Syrve mapping found': t('syrve.errors.missingMappings'),
      'Menu snapshot is missing': t('syrve.errors.menuSnapshotMissing'),
      'Menu snapshot missing': t('syrve.errors.menuSnapshotMissing'),
      'items without Syrve mappings': t('syrve.errors.missingMappings'),
      'Restaurant is closed': t('syrve.errors.restaurantClosed'),
      'PII decryption failed': t('syrve.errors.piiDecryptionFailed'),
      'Invalid organization or terminal': t('syrve.errors.invalidOrgOrTerminal'),
    };
    for (const [key, value] of Object.entries(errorMap)) {
      if (msg.toLowerCase().includes(key.toLowerCase())) return value;
    }
    return msg;
  }, []);

  const buildCreateOrderOptions = useCallback((rawOrder: Record<string, unknown>) => {
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
  }, []);

  const handleQuickSendToPOS = useCallback(async () => {
    if (!data?.order) return;
    const org = locationConfig?.organizationId || selectedOrg?.id;
    if (!org) { toast.error(t('orders.detail.noSyrveOrg')); return; }
    const terminal = locationConfig?.terminalGroupId;
    if (!terminal) { toast.error(t('orders.detail.noTerminalGroup')); return; }
    setSendingToPOS(true);
    try {
      toast.info(t('orders.detail.sendingToPOS'));
      await syrveApi.createOrder(
        data.order.id,
        org,
        terminal,
        buildCreateOrderOptions(data.order as unknown as Record<string, unknown>),
      );
      toast.success(t('orders.detail.orderSentToPOS'));
    } catch (err: any) {
      console.error('[OrderDetails] POS send failed:', err);
      const rawMsg = err.message || t('orders.detail.failedSendToPOS');
      toast.error(mapSyrveError(rawMsg));
    } finally {
      setSendingToPOS(false);
    }
  }, [data?.order, selectedOrg, locationConfig, mapSyrveError, buildCreateOrderOptions]);

  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalCourierInfo(null);
  }, [data?.order?.id]);

  useEffect(() => {
    const dbCourierInfo = parseCourierInfoFromDb(data?.order?.courier_info);
    if (!localCourierInfo || isSameCourierInfo(dbCourierInfo, localCourierInfo)) {
      setLocalCourierInfo(null);
    }
  }, [data?.order?.courier_info, localCourierInfo]);

  const handleCheckSyrveStatus = useCallback(async () => {
    if (!data?.order?.syrve_order_id) return;
    const org = locationConfig?.organizationId || selectedOrg?.id;
    if (!org) { toast.error(t('orders.detail.noSyrveOrg')); return; }
    setCheckingStatus(true);
    try {
      const result = await refreshOrder.mutateAsync({
        orderId: data.order.id,
        organizationId: org,
        customerId: data.order.customer_id,
      });
      if (result?.order) {
        const syrveOrder = result.order as Record<string, unknown>;
        if (syrveOrder.deliveryStatus) {
          setSyrveStatus(syrveOrder.deliveryStatus as string);
          setLastSyncedAt(new Date().toISOString());
        }

        const incomingCourierInfo = parseCourierInfoFromSyrveOrder(syrveOrder);
        const dbCourierInfo = parseCourierInfoFromDb(data.order.courier_info);
        const mergedCourierInfo = mergeCourierInfo(dbCourierInfo, incomingCourierInfo);

        if (mergedCourierInfo && !isSameCourierInfo(mergedCourierInfo, dbCourierInfo)) {
          setLocalCourierInfo(mergedCourierInfo);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['order', data.order.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-pii', data.order.id] });
      toast.success(t('orders.detail.statusChecked'));
    } catch (err: any) {
      toast.error(err.message || t('orders.detail.failedCheckStatus'));
    } finally {
      setCheckingStatus(false);
    }
  }, [data?.order, selectedOrg, locationConfig, refreshOrder, queryClient]);

  const autoSendEnabled = (() => {
    const settings = parseJsonSettings(currentAccount?.settings);
    return Boolean(settings.auto_send_to_pos);
  })();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Link href={ROUTES.orders}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('orders.backToOrders')}
            </Button>
          </Link>
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('orders.orderNotFound')}</h2>
              <p className="text-muted-foreground">
                {t('orders.orderNotFoundDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { order, items } = data;
  const operatorsById = new Map<string, { full_name?: string; email?: string }>(
    operators.map((operator: any) => [operator.id, operator]),
  );
  const crmOperatorInfo = parseCrmOperatorInfo(order.crm_operator_info);
  const crmOperatorSyncedAt = order.crm_operator_synced_at || crmOperatorInfo?.synced_at || null;
  const crmOperatorPhone = crmOperatorInfo
    ? getPhoneByPiiPolicy(canViewPii, crmOperatorInfo.phone, crmOperatorInfo.phone_masked)
    : null;
  const getOperatorLabel = (operatorId: string | null | undefined): string => {
    if (!operatorId) {
      return t('orders.processing.unassignedOperator');
    }

    const operator = operatorsById.get(operatorId);
    return operator?.full_name || operator?.email || t('orders.processing.unknownOperatorWithId');
  };

  const assignedOperator = resolveAssignedOperator({
    processingOperatorId: order.processing_operator_id,
    processingOperatorName: getOperatorLabel(order.processing_operator_id),
    crmOperatorInfo,
  });

  const getAssignmentActionLabel = (action: string | null | undefined): string => {
    if (!action) {
      return t('orders.processing.historyActionUpdated');
    }

    const actionMap: Record<string, string> = {
      take: t('orders.processing.actionTake'),
      transfer: t('orders.processing.actionTransfer'),
      release: t('orders.processing.actionRelease'),
    };

    return actionMap[action] || action;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${t('orders.orderLabel')} #${order.id.slice(0, 8)}`}
          subtitle={t('orders.placedOn')}
          breadcrumbs={(
            <Link href={ROUTES.orders}>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                {t('orders.backToOrders')}
              </Button>
            </Link>
          )}
        />

        <OrderHeader order={order} isAdmin={isAdmin} />

        <Card>
          <CardHeader>
            <CardTitle>{t('orders.processing.cardTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1 rounded-md border border-dashed p-3">
              <p className="text-sm">
                <span className="text-muted-foreground">{t('orders.processing.assignedTo')}:</span>{' '}
                {assignedOperator.source === 'crm' && crmOperatorSyncedAt ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        {assignedOperator.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('orders.processing.updatedAt')}: {format(new Date(crmOperatorSyncedAt), 'PPp')}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  assignedOperator.label
                )}
                {assignedOperator.source !== 'none' && (
                  <span className="ml-2 inline-flex rounded-md border px-2 py-0.5 text-xs text-foreground">
                    {assignedOperator.source === 'internal'
                      ? t('orders.processing.sourceInternal')
                      : t('orders.processing.sourceCrm')}
                  </span>
                )}
              </p>
              {crmOperatorPhone && (
                <p className="text-sm text-muted-foreground">
                  {t('orders.processing.phone')}: {crmOperatorPhone}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => assignOrder.mutate({ orderId: order.id, nextOperatorId: currentUser?.id ?? null, action: 'take' })}
                disabled={!assignmentPermissions?.canEditAssignments || !currentUser?.id}
              >
                {t('orders.processing.actionTake')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const target = operators.find((operator: any) => operator.id !== order.processing_operator_id);
                  if (!target) return;
                  assignOrder.mutate({ orderId: order.id, nextOperatorId: target.id, action: 'transfer' });
                }}
                disabled={!assignmentPermissions?.canEditAssignments || operators.length < 2}
              >
                {t('orders.processing.actionTransfer')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => assignOrder.mutate({ orderId: order.id, nextOperatorId: null, action: 'release' })}
                disabled={!assignmentPermissions?.canEditAssignments}
              >
                {t('orders.processing.actionRelease')}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {(assignmentHistory.data ?? []).slice(0, 5).map((event: any) => (
                <p key={event.id}>
                  {getAssignmentActionLabel(event.action)} · {format(new Date(event.changed_at), 'PPp')} · {t('orders.processing.historyFromTo')}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <OrderTransferCard order={order} />
            <OrderRoutingCard order={order} />

            <OrderStatusCard order={order} autoSendEnabled={autoSendEnabled} syrveDeliveryStatus={syrveStatus} lastSyncedAt={lastSyncedAt} onSendToPOS={handleQuickSendToPOS} isSendingToPOS={sendingToPOS} onConfirmOrder={handleConfirmOrder} isConfirming={updateOrder.isPending} onCheckSyrveStatus={order.syrve_order_id ? handleCheckSyrveStatus : undefined} isCheckingStatus={checkingStatus} />
            <SalesboxOrderInfoCard order={order} />

            <OrderCourierCard order={order} courierInfoOverride={localCourierInfo} />

            <OrderCustomerCard order={order} />

            <OrderItemsCard order={order} items={items} />

            <OrderSyncTimeline orderId={order.id} />

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('orders.orderNotes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <OrderActionsPanel order={order} />
            <LoyaltyCalculateSection order={order} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
