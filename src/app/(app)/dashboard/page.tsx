"use client";

import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import { useOrders } from '@/hooks/useOrders';
import { useAllMenuProducts } from '@/hooks/useMenu';
import { useDashboardHealth } from '@/hooks/useDashboardHealth';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { PageHeader } from '@/components/app/PageHeader';
import { StateBlock } from '@/components/app/StateBlock';
import { SummaryBar, type SummaryItem } from '@/components/app/SummaryBar';
import { ActionQueueCard } from '@/components/dashboard/ActionQueueCard';
import { IntegrationHealthMini } from '@/components/dashboard/IntegrationHealthMini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  ArrowRight,
  Package,
  AlertTriangle,
  Plug,
  RefreshCw,
  Link2Off,
  Bell,
} from 'lucide-react';
import { useMemo } from 'react';
import { statusMeta, type OrderStatus } from '@/lib/orders/config';
import { cn } from '@/lib/utils';
import { formatDateFns } from '@/lib/utils/formatDateTime';
import { ROUTES } from '@/constants/routes';

const t = (key: string, params?: Record<string, any>) => key;

export default function DashboardPage() {
  const currentLanguage = 'uk'; // default language
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useAllMenuProducts();
  const health = useDashboardHealth();

  const recentOrders = orders?.slice(0, 5) ?? [];
  const formatOrderTotal = (total: number | string, currency?: string) =>
    new Intl.NumberFormat(currentLanguage === 'uk' ? 'uk-UA' : 'en-US', {
      style: 'currency',
      currency: currency ?? 'UAH',
      currencyDisplay: 'symbol',
    }).format(Number(total));

  const title = profileLoading
    ? t('dashboard.loading')
    : profile?.full_name
      ? t('dashboard.welcomeName', { name: profile.full_name })
      : t('dashboard.welcome');

  const summaryItems: SummaryItem[] = useMemo(() => {
    const items: SummaryItem[] = [
      { label: t('dashboard.totalOrders'), value: orders?.length ?? 0, icon: <Package className="h-3.5 w-3.5" /> },
      { label: t('dashboard.menuProducts'), value: products?.length ?? 0, icon: <ShoppingBag className="h-3.5 w-3.5" /> },
    ];

    const needsAttention = orders?.filter((o: any) => o.requires_attention).length ?? 0;
    if (needsAttention > 0) {
      items.push({
        label: t('dashboard.needsAttention'),
        value: needsAttention,
        highlight: 'warning',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
      });
    }

    // Integration health
    if (health.connections.length > 0) {
      items.push({
        label: t('dashboard.integrationsHealthy'),
        value: `${health.healthyCount}/${health.connections.length}`,
        icon: <Plug className="h-3.5 w-3.5" />,
        highlight: health.errorCount > 0 ? 'destructive' : health.warningCount > 0 ? 'warning' : 'success',
      });
    }

    // Sync errors
    if (health.failedSyncs.length > 0) {
      items.push({
        label: t('dashboard.syncErrors'),
        value: health.failedSyncs.length,
        highlight: 'destructive',
        icon: <RefreshCw className="h-3.5 w-3.5" />,
      });
    }

    // Unmapped products
    if (health.unmappedCount > 0) {
      items.push({
        label: t('dashboard.unmappedProducts'),
        value: health.unmappedCount,
        highlight: 'warning',
        icon: <Link2Off className="h-3.5 w-3.5" />,
      });
    }

    // Admin alerts
    if (health.isAdmin && health.unresolvedAlerts.length > 0) {
      items.push({
        label: t('dashboard.unresolvedAlerts'),
        value: health.unresolvedAlerts.length,
        highlight: 'warning',
        icon: <Bell className="h-3.5 w-3.5" />,
      });
    }

    return items;
  }, [orders, products, health]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={title}
          subtitle={t('dashboard.subtitle')}
        />

        <OnboardingChecklist />

        {/* Compact Summary Bar */}
        <StateBlock isLoading={ordersLoading || productsLoading || health.isLoading} loadingHint="rows" loadingCount={1} isEmpty={false}>
          <SummaryBar items={summaryItems} />
        </StateBlock>

        {/* Action Queue */}
        {health.actionItems.length > 0 && (
          <ActionQueueCard items={health.actionItems} isLoading={health.isLoading} />
        )}

        {/* Two-column grid: Integrations + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IntegrationHealthMini
            integrations={health.connections}
            isLoading={health.isLoading}
          />

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
              <CardDescription>{t('dashboard.recentOrdersDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <StateBlock
                isLoading={ordersLoading}
                loadingHint="rows"
                loadingCount={3}
                isEmpty={recentOrders.length === 0}
                emptyIcon={<Package className="h-12 w-12" />}
                emptyTitle={t('dashboard.noOrdersYet')}
                emptyCta={
                  <Link href={ROUTES.menu}>
                    <Button variant="link">{t('dashboard.viewMenu')} →</Button>
                  </Link>
                }
              >
                <div className="space-y-2">
                  {recentOrders.map((order: any) => {
                    const statusConfig = statusMeta[order.status as OrderStatus] || statusMeta.pending;
                    return (
                      <Link
                        key={order.id}
                        href={ROUTES.orderDetail(order.id)}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{t('dashboard.orderNumber', { id: order.id.slice(0, 8) })}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateFns(order.created_at, 'd MMM yyyy', currentLanguage)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatOrderTotal(order.total, order.currency)}</p>
                          <Badge className={cn('gap-1 text-xs', statusConfig.badgeClass)}>
                            <statusConfig.icon className={statusConfig.iconClass} />
                            {t(statusConfig.label)}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                  <Link href={ROUTES.orders}>
                    <Button variant="ghost" className="w-full mt-1" size="sm">
                      {t('dashboard.viewAllOrders')}
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </StateBlock>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
