"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/app/PageHeader';
import { SummaryBar } from '@/components/app/SummaryBar';
import { DataToolbar } from '@/components/app/DataToolbar';
import { StateBlock } from '@/components/app/StateBlock';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useAllMenuProducts, useMenuCategories, useModifierGroups } from '@/hooks/useMenu';
import { useProductMappingMatrix } from '@/hooks/useProductMappingMatrix';
import { useMenuSyncProviders } from '@/hooks/useMenuSyncProviders';
import { ProductDetailPanel } from '@/components/menu/ProductDetailPanel';
import { Package, Puzzle, CheckCircle2, XCircle, Info, ArrowRight } from 'lucide-react';

const t = (key: string) => key;

const PAGE_SIZE = 50;

function MappingIcon({ mapped, provider }: { mapped: boolean; provider: string }) {
  const label = mapped ? t('unmappedInbox.mappedIn') + ' ' + provider : t('unmappedInbox.noMappingIn') + ' ' + provider;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          {mapped ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <XCircle className="h-4 w-4 text-destructive mx-auto" />}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default function UnmappedInbox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('any');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productsPage, setProductsPage] = useState(1);
  const [modifiersPage, setModifiersPage] = useState(1);

  const { data: products, isLoading: productsLoading } = useAllMenuProducts();
  const { data: categories } = useMenuCategories();
  const { data: modifierGroups, isLoading: modifiersLoading } = useModifierGroups();

  const { providers } = useMenuSyncProviders();
  const { providerColumns, getMappingStatus } = useProductMappingMatrix("product");
  const { providerColumns: modProviderColumns, getMappingStatus: getModMappingStatus } = useProductMappingMatrix("modifier_group");

  const categoryMap = useMemo(() => new Map((categories as any[])?.map((c: any) => [c.id, c.name]) ?? []), [categories]);

  const isUnmapped = (id: string, columns: any[], getStatus: any) => {
    if (providerFilter === 'any') {
      return columns.some((p: any) => !getStatus(id, p.enum).mapped);
    }
    const col = columns.find((p: any) => p.enum === providerFilter || p.code === providerFilter);
    if (!col) return true;
    return !getStatus(id, col.enum).mapped;
  };

  const unmappedProducts = useMemo(() => {
    if (!products) return [];
    return (products as any[]).filter((p: any) => {
      if (!isUnmapped(p.id, providerColumns, getMappingStatus)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, providerColumns, getMappingStatus, searchQuery, providerFilter]);

  const unmappedModifiers = useMemo(() => {
    if (!modifierGroups) return [];
    return (modifierGroups as any[]).filter((m: any) => {
      if (!isUnmapped(m.id, modProviderColumns, getModMappingStatus)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!m.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [modifierGroups, modProviderColumns, getModMappingStatus, searchQuery, providerFilter]);

  // Per-provider missing counts
  const missingByProvider = useMemo(() => {
    return (providerColumns as any[]).map((p: any) => ({
      ...p,
      missingCount: (products as any[])?.filter((prod: any) => !getMappingStatus(prod.id, p.enum).mapped).length ?? 0,
    }));
  }, [products, providerColumns, getMappingStatus]);

  const isLoading = productsLoading || modifiersLoading;

  // Pagination
  const productsTotalPages = Math.max(1, Math.ceil(unmappedProducts.length / PAGE_SIZE));
  const modifiersTotalPages = Math.max(1, Math.ceil(unmappedModifiers.length / PAGE_SIZE));
  const paginatedProducts = unmappedProducts.slice((productsPage - 1) * PAGE_SIZE, productsPage * PAGE_SIZE);
  const paginatedModifiers = unmappedModifiers.slice((modifiersPage - 1) * PAGE_SIZE, modifiersPage * PAGE_SIZE);

  // Reset pages on filter change
  useEffect(() => { setProductsPage(1); setModifiersPage(1); }, [searchQuery, providerFilter]);

  const mappingQuery = useMemo(() => {
    const params = new URLSearchParams({ status: 'not_linked' });
    if (providerFilter !== 'any') {
      params.set('provider', providerFilter);
    }
    return params.toString();
  }, [providerFilter]);

  // Alerts for providers with zero mappings
  const emptyProviders = missingByProvider.filter((p: any) => p.missingCount === ((products as any[])?.length ?? 0) && ((products as any[])?.length ?? 0) > 0);

  const summaryItems = [
    { label: t('unmappedInbox.unmappedProducts'), value: unmappedProducts.length, icon: <Package className="h-4 w-4" />, highlight: unmappedProducts.length > 0 ? 'warning' as const : undefined },
    { label: t('unmappedInbox.unmappedModifiers'), value: unmappedModifiers.length, icon: <Puzzle className="h-4 w-4" />, highlight: unmappedModifiers.length > 0 ? 'warning' as const : undefined },
    ...missingByProvider.map((p: any) => ({
      label: t('unmappedInbox.withoutProvider') + ' ' + p.displayName,
      value: p.missingCount,
    })),
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        <PageHeader
          title={t('unmappedInbox.title')}
          subtitle={t('unmappedInbox.subtitle')}
          actions={
            <Button asChild>
              <Link href={`/app/menu/mapping?${mappingQuery}`}>
                {t('unmappedInbox.openMapping')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          }
        />

        {emptyProviders.map((p: any) => (
          <Alert key={p.code}>
            <Info className="h-4 w-4" />
            <AlertTitle>{t('unmappedInbox.providerMissing') + ' ' + p.displayName}</AlertTitle>
            <AlertDescription>{t('unmappedInbox.providerMissingDesc') + ' ' + p.displayName}</AlertDescription>
          </Alert>
        ))}

        <SummaryBar items={summaryItems} />

        <DataToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t('unmappedInbox.searchPlaceholder')}
          filters={
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('unmappedInbox.provider')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t('unmappedInbox.anyProvider')}</SelectItem>
                {(providerColumns as any[]).map((p: any) => (
                  <SelectItem key={p.code} value={p.enum}>{p.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{t('unmappedInbox.mapped')}</span>
          <span className="flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5 text-destructive" />{t('unmappedInbox.noMapping')}</span>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products" className="gap-1.5"><Package className="h-4 w-4" />{t('unmappedInbox.productsTab')}{!isLoading && <Badge variant="secondary" className="ml-1">{unmappedProducts.length}</Badge>}</TabsTrigger>
            <TabsTrigger value="modifiers" className="gap-1.5"><Puzzle className="h-4 w-4" />{t('unmappedInbox.modifiersTab')}{!isLoading && <Badge variant="secondary" className="ml-1">{unmappedModifiers.length}</Badge>}</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <StateBlock
              isLoading={isLoading}
              loadingCount={5}
              isEmpty={unmappedProducts.length === 0 && !isLoading}
              emptyIcon={<CheckCircle2 className="h-10 w-10 text-success" />}
              emptyTitle={t('unmappedInbox.allMapped')}
            >
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('unmappedInbox.product')}</TableHead>
                      <TableHead>{t('unmappedInbox.category')}</TableHead>
                      <TableHead>{t('unmappedInbox.price')}</TableHead>
                      {(providerColumns as any[]).map((p: any) => (
                        <TableHead key={p.code} className="text-center">{p.displayName}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product: any) => (
                      <TableRow key={product.id} className="cursor-pointer" onClick={() => setSelectedProduct(product)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.image_url ? <img src={product.image_url} alt="" className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>}
                            <div><div className="font-medium">{product.name}</div>{product.is_in_stop_list && <Badge variant="destructive" className="text-xs mt-0.5">{t('unmappedInbox.stopList')}</Badge>}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{product.category_id ? categoryMap.get(product.category_id) ?? '—' : '—'}</TableCell>
                        <TableCell>₴{Number(product.price).toFixed(2)}</TableCell>
                        {(providerColumns as any[]).map((p: any) => (
                          <TableCell key={p.code} className="text-center">
                            <MappingIcon mapped={getMappingStatus(product.id, p.enum).mapped} provider={p.displayName} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {productsTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t('unmappedInbox.showing')}: {paginatedProducts.length} / {unmappedProducts.length}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setProductsPage((p: any) => Math.max(1, p - 1))} className={productsPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                      {Array.from({ length: Math.min(productsTotalPages, 5) }, (_: any, i: any) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink isActive={page === productsPage} onClick={() => setProductsPage(page)} className="cursor-pointer">{page}</PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext onClick={() => setProductsPage((p: any) => Math.min(productsTotalPages, p + 1))} className={productsPage === productsTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </StateBlock>
          </TabsContent>

          <TabsContent value="modifiers">
            <StateBlock
              isLoading={isLoading}
              loadingCount={3}
              isEmpty={unmappedModifiers.length === 0 && !isLoading}
              emptyIcon={<CheckCircle2 className="h-10 w-10 text-success" />}
              emptyTitle={t('unmappedInbox.allModifiersMapped')}
            >
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('unmappedInbox.modifierGroup')}</TableHead>
                      {(modProviderColumns as any[]).map((p: any) => (
                        <TableHead key={p.code} className="text-center">{p.displayName}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedModifiers.map((mod: any) => (
                      <TableRow key={mod.id}>
                        <TableCell><div className="flex items-center gap-2"><Puzzle className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{mod.name}</span></div></TableCell>
                        {(modProviderColumns as any[]).map((p: any) => (
                          <TableCell key={p.code} className="text-center">
                            <MappingIcon mapped={getModMappingStatus(mod.id, p.enum).mapped} provider={p.displayName} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {modifiersTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t('unmappedInbox.showing')}: {paginatedModifiers.length} / {unmappedModifiers.length}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setModifiersPage((p: any) => Math.max(1, p - 1))} className={modifiersPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                      {Array.from({ length: Math.min(modifiersTotalPages, 5) }, (_: any, i: any) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink isActive={page === modifiersPage} onClick={() => setModifiersPage(page)} className="cursor-pointer">{page}</PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext onClick={() => setModifiersPage((p: any) => Math.min(modifiersTotalPages, p + 1))} className={modifiersPage === modifiersTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </StateBlock>
          </TabsContent>
        </Tabs>
      </div>
      <ProductDetailPanel product={selectedProduct} categories={(categories ?? []) as any} open={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </AppLayout>
  );
}
