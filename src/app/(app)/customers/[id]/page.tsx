"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCustomer, useCustomerOrders } from '@/hooks/useCustomers';
import { CustomerMergeDialog } from '@/components/customers/CustomerMergeDialog';
import { CustomerSyncStateCard } from '@/components/customers/CustomerSyncStateCard';
import { CustomerPushActions } from '@/components/customers/CustomerPushActions';
import { CustomerMatchHistory } from '@/components/customers/CustomerMatchHistory';
import { CustomerFieldProvenance } from '@/components/customers/CustomerFieldProvenance';
import { SyrveCustomerCategoriesCard } from '@/components/customers/SyrveCustomerCategoriesCard';
import { SalesboxLoyaltyCard } from '@/components/customers/SalesboxLoyaltyCard';
import { useAccount } from '@/contexts/AccountContext';
import { ArrowLeft, ExternalLink, Package, UserRound, Calendar, Merge, Bell, MessageSquare, Mail } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { SendPushDialog } from '@/components/chats/SendPushDialog';
import { SendEmailDialog } from '@/components/customers/SendEmailDialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { useCustomerSegment } from '@/hooks/useCustomerSegments';
import { ValueSegmentBadge, RecencySegmentBadge } from '@/components/customers/SegmentBadge';

const t = (key: string) => key;

const formatDate = (value?: string | null) =>
  value ? format(new Date(value), 'MMM d, yyyy') : '—';

const formatDateTime = (value?: string | null) =>
  value ? format(new Date(value), 'MMM d, yyyy HH:mm') : '—';

const formatCurrency = (value?: number | string | null, currency?: string | null) => {
  if (value === null || value === undefined) return '—';
  const numericValue = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: currency ?? 'UAH',
    currencyDisplay: 'symbol',
  }).format(numericValue);
};

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { currentAccount } = useAccount();
  const { data: customer, isLoading, error } = useCustomer(id);
  const { data: orders = [], isLoading: ordersLoading } = useCustomerOrders(id);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const { data: segment } = useCustomerSegment(id);

  const fieldSources = (customer?.field_sources ?? {}) as Record<string, { source: string; updated_at: string }>;
  const fieldLocks = (customer?.field_locks ?? {}) as Record<string, boolean>;

  // Check if a Salesbox chat exists for this customer via NCB API
  const { data: hasSalesboxChat } = useQuery({
    queryKey: ['salesbox-chat-exists', currentAccount?.id, customer?.salesbox_customer_id],
    queryFn: async () => {
      if (!currentAccount?.id || !customer?.salesbox_customer_id) return false;
      const res = await fetch(
        `/api/data/salesbox_chats?account_id=eq.${currentAccount.id}&salesbox_user_id=eq.${customer.salesbox_customer_id}&select=id&limit=1`,
        { credentials: 'include' }
      );
      if (!res.ok) return false;
      const json = await res.json();
      if (Array.isArray(json)) return json.length > 0;
      if (json === null) return false;
      return typeof json === 'object';
    },
    enabled: !!currentAccount?.id && !!customer?.salesbox_customer_id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-64" />
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error || !customer) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Link href="/customers">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('customerDetails.backToCustomers')}
            </Button>
          </Link>
          <Card>
            <CardContent className="py-16 text-center">
              <UserRound className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h2 className="mb-2 text-xl font-semibold">{t('customerDetails.notFound')}</h2>
              <p className="text-muted-foreground">
                {t('customerDetails.notFoundDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={customer.name ?? t('customerDetails.unnamed')}
          subtitle={t('customerDetails.subtitle')}
          meta={segment ? (
            <div className="flex items-center gap-2">
              <ValueSegmentBadge segment={segment.value_segment} />
              <RecencySegmentBadge segment={segment.recency_segment} />
            </div>
          ) : undefined}
          breadcrumbs={
            <Link href="/customers">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                {t('customerDetails.backToCustomers')}
              </Button>
            </Link>
          }
          actions={
            <Button variant="outline" onClick={() => setMergeDialogOpen(true)}>
              <Merge className="mr-2 h-4 w-4" />
              {t('customerDetails.mergeWith')}
            </Button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Contact Card */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {t('customerDetails.contact')}
            </CardTitle>
            <CardDescription>{t('customerDetails.primaryIdentifiers')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('customerDetails.email')}</p>
                <CustomerFieldProvenance
                  customerId={customer.id}
                  accountId={currentAccount?.id ?? ''}
                  fieldKey="email"
                  value={customer.normalized_email}
                  fieldSources={fieldSources}
                  fieldLocks={fieldLocks}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('customerDetails.phone')}</p>
                <CustomerFieldProvenance
                  customerId={customer.id}
                  accountId={currentAccount?.id ?? ''}
                  fieldKey="phone"
                  value={customer.normalized_phone}
                  fieldSources={fieldSources}
                  fieldLocks={fieldLocks}
                />
              </div>
              {(customer.salesbox_customer_id || customer.normalized_email) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {customer.salesbox_customer_id && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setPushDialogOpen(true)}>
                        <Bell className="mr-1.5 h-3.5 w-3.5" />
                        {t('customerDetails.pushButton')}
                      </Button>
                      {hasSalesboxChat ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/chats?customer=${customer.salesbox_customer_id}`}>
                            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                            {t('customerDetails.chatButton')}
                          </Link>
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0}>
                              <Button size="sm" variant="outline" disabled>
                                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                {t('customerDetails.chatButton')}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{t('customerDetails.chatNotStarted')}</TooltipContent>
                        </Tooltip>
                      )}
                    </>
                  )}
                  {customer.normalized_email && (
                    <Button size="sm" variant="outline" onClick={() => setEmailDialogOpen(true)}>
                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                      Email
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lifetime Value Card */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('customerDetails.lifetimeValue')}
            </CardTitle>
            <CardDescription>{t('customerDetails.overallActivity')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('customerDetails.orders')}</p>
                <p className="text-2xl font-semibold">{customer.orders_count ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('customerDetails.totalSpent')}</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(customer.total_spent)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('customerDetails.activity')}
            </CardTitle>
            <CardDescription>{t('customerDetails.orderTimeline')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('customerDetails.firstOrder')}</p>
                <p className="font-medium">{formatDate(customer.first_order_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('customerDetails.lastOrder')}</p>
                <p className="font-medium">{formatDate(customer.last_order_at)}</p>
              </div>
            </CardContent>
          </Card>

          <CustomerSyncStateCard customerId={customer.id} />
        </div>

        {/* System Presence & Push Actions */}
        <CustomerPushActions
          customerId={customer.id}
          customerName={customer.name}
          customerPhone={customer.normalized_phone}
          customerEmail={customer.normalized_email}
          salesboxId={customer.salesbox_customer_id}
          bitrixId={customer.bitrix_customer_id}
          syrveId={customer.syrve_customer_id}
        />

        {/* Timestamps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('customerDetails.recordInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">{t('customerDetails.created')}</span>{' '}
                <span className="font-medium">{formatDateTime(customer.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('customerDetails.updated')}</span>{' '}
                <span className="font-medium">{formatDateTime(customer.updated_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('customerDetails.customerId')}</span>{' '}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{customer.id}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salesbox Loyalty */}
        {customer.salesbox_customer_id && (
          <SalesboxLoyaltyCard
            salesboxCustomerId={customer.salesbox_customer_id}
            currentBalance={(customer as any).salesbox_balance ?? 0}
          />
        )}

        {/* Syrve Categories */}
        <SyrveCustomerCategoriesCard syrveCustomerId={customer.syrve_customer_id} />

        {/* Match History */}
        <CustomerMatchHistory customerId={customer.id} />

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('customerDetails.orders')}</CardTitle>
            <CardDescription>{t('customerDetails.recentOrders')}</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p>{t('customerDetails.noOrdersForCustomer')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('customerDetails.tableOrder')}</TableHead>
                    <TableHead>{t('customerDetails.tableStatus')}</TableHead>
                    <TableHead>{t('customerDetails.tableSource')}</TableHead>
                    <TableHead>{t('customerDetails.tableTotal')}</TableHead>
                    <TableHead>{t('customerDetails.tableDate')}</TableHead>
                    <TableHead className="text-right">{t('customerDetails.tableActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-primary hover:underline"
                        >
                          {order.external_order_id ?? order.id.slice(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.status}</Badge>
                      </TableCell>
                      <TableCell className="uppercase text-xs">
                        {order.source_provider ?? '—'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.total, order.currency)}
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/orders/${order.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Merge Dialog */}
        <CustomerMergeDialog
          open={mergeDialogOpen}
          onOpenChange={setMergeDialogOpen}
          primaryCustomer={customer}
          onMerged={(customerId: any) => {
            router.push(`/customers/${customerId}`);
          }}
        />

        {/* Push Dialog */}
        {customer.salesbox_customer_id && (
          <SendPushDialog
            open={pushDialogOpen}
            onOpenChange={setPushDialogOpen}
            userId={customer.salesbox_customer_id}
            customerName={customer.name}
          />
        )}

        {/* Email Dialog */}
        {customer.normalized_email && (
          <SendEmailDialog
            open={emailDialogOpen}
            onOpenChange={setEmailDialogOpen}
            recipientEmail={customer.normalized_email}
            customerName={customer.name}
            accountId={currentAccount?.id ?? ''}
          />
        )}
      </div>
    </AppLayout>
  );
}
