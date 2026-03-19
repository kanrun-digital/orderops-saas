"use client";

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { DataToolbar } from '@/components/app/DataToolbar';
import { FilterChips, type FilterChip } from '@/components/app/FilterChips';
import { SummaryBar, type SummaryItem } from '@/components/app/SummaryBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomers, type CustomerSortColumn, type SortDirection, type SourceFilter } from '@/hooks/useCustomers';
import { useCustomerStats } from '@/hooks/useCustomerStats';
import { useProviderConnections } from '@/hooks/useCustomerDataOps';
import { useSalesboxClearCustomers } from '@/hooks/salesbox';
import { useNeedsReviewQueue } from '@/hooks/useCustomerMatchLog';
import { useCustomerBulkPush } from '@/hooks/useCustomerBulkPush';
import { CustomerNeedsReviewQueue } from '@/components/customers/CustomerNeedsReviewQueue';
import { CustomerCsvImport } from '@/components/customers/CustomerCsvImport';
import { CustomerAlgorithmGuide } from '@/components/customers/CustomerAlgorithmGuide';
import { CustomerSystemPresence } from '@/components/customers/CustomerSystemPresence';
import { CustomerProviderSyncPanel } from '@/components/customers/CustomerProviderSyncPanel';
import {
  AlertTriangle, ArrowRight, ArrowUpDown, RefreshCw, Trash2, Users,
  Link2, Upload, GitCompare, BarChart2,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { PAGINATION, TIMING } from '@/lib/constants';
import { PROVIDER_CODES } from '@/lib/constants/integrations';

const t = (key: string, params?: Record<string, any>) => key;

const formatDate = (value?: string | null) =>
  value ? format(new Date(value), 'd MMM yyyy', { locale: uk }) : '—';

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    currencyDisplay: 'symbol',
  }).format(value);
};

const PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE;

export default function CustomersPage() {
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [sortColumn, setSortColumn] = useState<CustomerSortColumn>('last_order_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch } = useCustomers({
    page,
    pageSize: PAGE_SIZE,
    sortColumn,
    sortDirection,
    searchQuery: debouncedSearch,
    sourceFilter,
  });

  const customers = data?.customers ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const { data: customerStats } = useCustomerStats();
  const perConnection = customerStats?.perConnection ?? [];
  const matchedCount = customerStats?.matchedCount ?? 0;
  const totalCustomerCount = customerStats?.totalCustomerCount ?? 0;
  const isFiltered = sourceFilter !== 'all';

  const { data: connections = [] } = useProviderConnections();
  const activeConnections = useMemo(
    () => connections.filter((c: any) => c.status === 'active'),
    [connections],
  );
  const activeProviderCodes = useMemo(
    () => activeConnections.map((c: any) => c.provider_code),
    [activeConnections],
  );

  const { data: needsReviewItems = [] } = useNeedsReviewQueue();
  const needsReviewCount = needsReviewItems.length;

  const clearCustomersMutation = useSalesboxClearCustomers();
  const bulkPushMutation = useCustomerBulkPush();

  useEffect(() => {
    const timer = setTimeout(() => refetch(), TIMING.DEBOUNCE_DEFAULT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Clear selection when page/filter changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, debouncedSearch, sourceFilter]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, TIMING.DEBOUNCE_SEARCH_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleSort = useCallback((column: CustomerSortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setPage(1);
  }, [sortColumn]);

  const handleSourceFilterChange = useCallback((value: string) => {
    setSourceFilter(value as SourceFilter);
    setPage(1);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback(() => {
    const allOnPage = customers.map((c: any) => c.id);
    const allSelected = allOnPage.every((id: any) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allOnPage.forEach((id: any) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allOnPage.forEach((id: any) => next.add(id));
        return next;
      });
    }
  }, [customers, selectedIds]);

  const selectedCount = selectedIds.size;
  const allOnPageSelected = customers.length > 0 && customers.every((c: any) => selectedIds.has(c.id));

  // Summary bar items
  const summaryItems: SummaryItem[] = useMemo(() => {
    const shownCount = (() => {
      if (sourceFilter === 'matched' || sourceFilter === 'none') {
        return totalCount;
      }
      if (sourceFilter !== 'all') {
        const sourceStat = perConnection.find((s: any) => s.connection_id === sourceFilter);
        return sourceStat?.customer_count ?? totalCount;
      }
      return totalCount;
    })();

    const items: SummaryItem[] = [
      { label: t('customers.totalCustomers'), value: totalCustomerCount, icon: <Users className="h-3.5 w-3.5" /> },
    ];
    if (isFiltered) {
      items.push({ label: t('customers.shown'), value: shownCount });
    }
    perConnection.forEach((stat: any) => {
      items.push({ label: stat.connection_name, value: stat.customer_count });
    });
    if (matchedCount > 0) {
      items.push({
        label: t('customers.matched'),
        value: matchedCount,
        icon: <Link2 className="h-3.5 w-3.5" />,
      });
    }
    if (needsReviewCount > 0) {
      items.push({
        label: t('customers.needsReview.label'),
        value: needsReviewCount,
        highlight: 'warning',
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
      });
    }
    return items;
  }, [sourceFilter, totalCustomerCount, totalCount, isFiltered, perConnection, matchedCount, needsReviewCount]);

  // Source filter chips
  const sourceChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = activeConnections.map((conn: any) => {
      const stat = perConnection.find((s: any) => s.connection_id === conn.id);
      return {
        value: conn.id,
        label: conn.name,
        count: stat?.customer_count ?? 0,
      };
    });
    if (matchedCount > 0) {
      chips.push({ value: 'matched', label: t('customers.matchedSources'), count: matchedCount });
    }
    chips.push({ value: 'none', label: t('customers.noExternalId'), count: customerStats?.noExternalCount ?? 0 });
    return chips;
  }, [activeConnections, perConnection, matchedCount, customerStats]);

  // Bulk push buttons based on active providers
  const bulkActions = useMemo(() => {
    const actions: Array<{ providerCode: string; label: string }> = [];
    if (activeProviderCodes.includes(PROVIDER_CODES.SALESBOX)) {
      actions.push({ providerCode: PROVIDER_CODES.SALESBOX, label: t('customers.bulkPushSalesbox') });
    }
    if (activeProviderCodes.includes(PROVIDER_CODES.BITRIX_SITE)) {
      actions.push({ providerCode: PROVIDER_CODES.BITRIX_SITE, label: t('customers.bulkPushBitrix') });
    }
    if (activeProviderCodes.includes(PROVIDER_CODES.SYRVE)) {
      actions.push({ providerCode: PROVIDER_CODES.SYRVE, label: t('customers.bulkFindSyrve') });
    }
    return actions;
  }, [activeProviderCodes]);

  const handleBulkPush = useCallback((providerCode: string) => {
    bulkPushMutation.mutate({
      providerCode,
      customerIds: Array.from(selectedIds),
    });
  }, [selectedIds, bulkPushMutation]);

  const SortableHeader = ({ column, children }: { column: CustomerSortColumn; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn('h-3 w-3 transition-opacity', sortColumn === column ? 'opacity-100' : 'opacity-30')} />
      </div>
    </TableHead>
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <PageHeader
          title={t('customers.title')}
          subtitle={t('customers.subtitle')}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/customers/segments">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Сегменти
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/customers/sync">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  {t('customers.syncStatusButton')}
                </Link>
              </Button>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('customers.refresh')}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={totalCount === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('customers.clearAll')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('customers.clearAllTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('customers.clearAllDesc', { count: totalCount })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('customers.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => clearCustomersMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {clearCustomersMutation.isPending ? t('customers.clearing') : t('customers.clearAllConfirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          }
        />

        {/* Needs review alert */}
        {needsReviewCount > 0 && (
          <Alert className="border-warning/50 bg-warning/5 text-foreground">
            <AlertDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <span>
                <strong>{needsReviewCount}</strong> {t('customers.needsReviewAlert', { count: needsReviewCount })}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Compact summary bar replacing stat cards */}
        <SummaryBar items={summaryItems} />

        {/* Source filter chips */}
        {sourceChips.length > 0 && (
          <FilterChips
            chips={sourceChips}
            value={sourceFilter}
            onChange={handleSourceFilterChange}
            allLabel={t('customers.allSources')}
            allCount={totalCustomerCount}
          />
        )}

        {needsReviewCount > 0 && <CustomerNeedsReviewQueue />}

        <CustomerCsvImport />

        <CustomerAlgorithmGuide />

        {/* Provider Sync Section */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <GitCompare className="h-4 w-4" />
              {t('customerSync.title')}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <CustomerProviderSyncPanel />
          </CollapsibleContent>
        </Collapsible>

        {/* Toolbar + bulk actions */}
        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t('customers.searchPlaceholder')}
          selectedCount={selectedCount}
          bulkActions={
            selectedCount > 0 && bulkActions.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('common.nSelected', { count: selectedCount })}
                </span>
                {bulkActions.map(({ providerCode, label }) => (
                  <Button
                    key={providerCode}
                    size="sm"
                    variant="outline"
                    disabled={bulkPushMutation.isPending}
                    onClick={() => handleBulkPush(providerCode)}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    {label} ({selectedCount})
                  </Button>
                ))}
              </div>
            ) : undefined
          }
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p>{t('customers.noCustomersMatch')}</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allOnPageSelected}
                        onCheckedChange={toggleAllOnPage}
                        aria-label={t('common.accessibility.selectAll')}
                      />
                    </TableHead>
                    <SortableHeader column="name">{t('customers.name')}</SortableHeader>
                    <TableHead>{t('customers.contact')}</TableHead>
                    <TableHead>{t('customers.source')}</TableHead>
                    <SortableHeader column="orders_count">{t('customers.orders')}</SortableHeader>
                    <SortableHeader column="total_spent">{t('customers.totalSpent')}</SortableHeader>
                    <TableHead>{t('customers.balance')}</TableHead>
                    <SortableHeader column="last_order_at">{t('customers.lastOrder')}</SortableHeader>
                    <TableHead className="text-right">{t('customers.details')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer: any) => (
                    <TableRow key={customer.id} data-state={selectedIds.has(customer.id) ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(customer.id)}
                          onCheckedChange={() => toggleSelection(customer.id)}
                          aria-label={`Select ${customer.name ?? 'customer'}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.name ?? t('customers.unnamedCustomer')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{customer.normalized_email ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{customer.normalized_phone ?? '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CustomerSystemPresence
                          salesboxId={customer.salesbox_customer_id}
                          bitrixId={customer.bitrix_customer_id}
                          syrveId={customer.syrve_customer_id}
                          activeProviders={activeProviderCodes}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.orders_count ?? 0}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(customer.total_spent)}</TableCell>
                      <TableCell>
                        {customer.salesbox_customer_id ? (
                          <Badge variant="outline">{customer.salesbox_balance ?? 0}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(customer.last_order_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost" className="gap-1">
                          <Link href={`/app/customers/${customer.id}`}>
                            {t('customers.view')}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('customers.page')} {page} / {totalPages}
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {totalPages > 5 && page < totalPages - 2 && (
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
