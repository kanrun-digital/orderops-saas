"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataToolbar } from '@/components/app/DataToolbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useStopListProducts, useAllMenuProducts } from '@/hooks/useMenu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelectedSyrveOrganization, useSyrveTerminalGroups } from '@/hooks/useSyrve';
import {
  Ban, Plus, Trash2, RefreshCw, Loader2, ImageOff,
} from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { updateByFilters } from '@/lib/data-client';

const t = (key: string) => key;

export default function StopList() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [listSearch, setListSearch] = useState('');

  const { data: stopListProducts = [], isLoading } = useStopListProducts();
  const { data: allProducts = [] } = useAllMenuProducts();
  const { data: selectedOrg } = useSelectedSyrveOrganization();
  const { data: terminalGroups = [] } = useSyrveTerminalGroups(selectedOrg?.id);

  const queryClient = useQueryClient();

  const selectedTerminal = (terminalGroups as any[]).find((tg: any) => tg.is_selected);

  const availableProducts = (allProducts as any[]).filter(
    (p: any) => !(stopListProducts as any[]).some((sp: any) => sp.id === p.id)
  );

  const addToStopListMutation = useMutation({
    mutationFn: async (productId: string) => {
      await updateByFilters({
        table: 'menu_products',
        filters: { id: productId },
        data: { is_in_stop_list: true },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop-list-products'] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
      toast.success(t('stopList.productAdded'));
    },
    onError: (error: any) => {
      toast.error(t('stopList.addFailed') + ': ' + (error?.message || ''));
    },
  });

  const removeFromStopListMutation = useMutation({
    mutationFn: async (productId: string) => {
      await updateByFilters({
        table: 'menu_products',
        filters: { id: productId },
        data: { is_in_stop_list: false, stop_list_balance: null },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop-list-products'] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
      toast.success(t('stopList.productRemoved'));
    },
    onError: (error: any) => {
      toast.error(t('stopList.removeFailed') + ': ' + (error?.message || ''));
    },
  });

  const clearStopListMutation = useMutation({
    mutationFn: async () => {
      await updateByFilters({
        table: 'menu_products',
        filters: { is_in_stop_list: true },
        data: { is_in_stop_list: false, stop_list_balance: null },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop-list-products'] });
      queryClient.invalidateQueries({ queryKey: ['menu-products'] });
      toast.success(t('stopList.cleared'));
    },
    onError: (error: any) => {
      toast.error(t('stopList.clearFailed') + ': ' + (error?.message || ''));
    },
  });

  const syncToSyrveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrg || !selectedTerminal) {
        throw new Error('No organization or terminal selected');
      }
      const res = await fetch('/api/syrve/stop-list', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syrve_org_id: (selectedOrg as any).syrve_org_id,
          syrve_terminal_id: selectedTerminal.syrve_terminal_id,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Sync failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stop-list-products'] });
      toast.success(t('stopList.synced'));
    },
    onError: (error: any) => {
      toast.error(t('stopList.syncFailed') + ': ' + (error?.message || ''));
    },
  });

  const handleAddProduct = (product: any) => {
    addToStopListMutation.mutate(product.id);
    setSearchOpen(false);
    setSearchValue('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('stopList.title')}
          subtitle={t('stopList.subtitle')}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => syncToSyrveMutation.mutate()}
                disabled={syncToSyrveMutation.isPending || !selectedOrg || !selectedTerminal}
              >
                {syncToSyrveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {t('stopList.syncWithSyrve')}
              </Button>
              {(stopListProducts as any[]).length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => clearStopListMutation.mutate()}
                  disabled={clearStopListMutation.isPending}
                >
                  {clearStopListMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {t('stopList.clearAll')}
                </Button>
              )}
            </div>
          }
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  {t('stopList.productsInStopList')}
                  <Badge variant="secondary">{(stopListProducts as any[]).length}</Badge>
                </CardTitle>
                <CardDescription>{t('stopList.productsDescription')}</CardDescription>
              </div>

              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('stopList.addProduct')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <Command>
                    <CommandInput
                      placeholder={t('stopList.searchProducts')}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <CommandList>
                      <CommandEmpty>{t('stopList.noProductsFound')}</CommandEmpty>
                      <CommandGroup>
                        {availableProducts
                          .filter((p: any) =>
                            p.name.toLowerCase().includes(searchValue.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((product: any) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => handleAddProduct(product)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                    <ImageOff className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-xs text-muted-foreground">{product.price} ₴</div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>

          <CardContent>
            {(stopListProducts as any[]).length > 3 && (
              <div className="mb-4">
                <DataToolbar
                  searchValue={listSearch}
                  onSearchChange={setListSearch}
                  searchPlaceholder={t('stopList.searchInList')}
                />
              </div>
            )}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (stopListProducts as any[]).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Ban className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t('stopList.emptyTitle')}</h3>
                <p className="text-muted-foreground">{t('stopList.emptyDesc')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('stopList.tableProduct')}</TableHead>
                    <TableHead>{t('stopList.tablePrice')}</TableHead>
                    <TableHead>{t('stopList.tableBalance')}</TableHead>
                    <TableHead className="w-[100px]">{t('stopList.tableActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stopListProducts as any[])
                    .filter((p: any) => !listSearch || p.name.toLowerCase().includes(listSearch.toLowerCase()))
                    .map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <ImageOff className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.price} ₴</TableCell>
                      <TableCell>
                        {p.stop_list_balance !== null && p.stop_list_balance !== undefined ? (
                          <Badge variant="outline">{p.stop_list_balance}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromStopListMutation.mutate(p.id)}
                          disabled={removeFromStopListMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
