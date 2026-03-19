"use client";

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductDetailPanel } from '@/components/menu/ProductDetailPanel';
import { useMenuCategories, useAllMenuProducts } from '@/hooks/useMenu';
import { useMenuScope } from '@/hooks/useMenuScope';
import { useAccount } from '@/contexts/AccountContext';
import { Search, FolderOpen, Package, Ban, ImageOff, ChevronRight, ChevronDown, MapPin, Upload, Loader2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { useMenuSyncProviders } from '@/hooks/useMenuSyncProviders';
import { useMenuExport } from '@/hooks/useMenuExport';
import { useMenuReset } from '@/hooks/useMenuReset';
import { formatWeight } from '@/lib/utils/formatWeight';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from 'sonner';
import type { MenuProduct, MenuCategory, MenuProductExtended } from '@/lib/types';

const t = (key: string, params?: Record<string, any>) => key;

export default function MenuPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'stopped' | 'no-category'>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { scope, setScope } = useMenuScope();
  const { locations, currentRestaurant, currentLocation, currentAccount } = useAccount();
  const { exportProviders, providers: syncProviders, posProvider } = useMenuSyncProviders();
  const menuExport = useMenuExport();
  const menuReset = useMenuReset();
  const [exportingProvider, setExportingProvider] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { data: categories = [], isLoading: categoriesLoading } = useMenuCategories({ scope, locationId: scope === 'location' ? selectedLocationId : null });
  const { data: allProducts = [], isLoading: productsLoading } = useAllMenuProducts({ scope, locationId: scope === 'location' ? selectedLocationId : null });

  const restaurantLocations = locations.filter((l: any) => l.restaurant_id === currentRestaurant?.id);
  const locationOptions = restaurantLocations.length > 0 ? restaurantLocations : locations;

  useEffect(() => {
    if (scope !== 'location') return;
    if (selectedLocationId) return;
    if (locationOptions.length === 0) return;
    const fallbackLocation = currentLocation?.id ?? locationOptions[0]?.id ?? null;
    if (fallbackLocation) setSelectedLocationId(fallbackLocation);
  }, [scope, selectedLocationId, locationOptions, currentLocation]);

  const getDescendantCategoryIds = (parentId: string): string[] => {
    const children = categories.filter((c: any) => c.parent_id === parentId);
    const ids: string[] = [];
    for (const child of children) { ids.push(child.id); ids.push(...getDescendantCategoryIds(child.id)); }
    return ids;
  };

  const filteredProducts = allProducts.filter((product: any) => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategoryId) {
      const validIds = new Set([selectedCategoryId, ...getDescendantCategoryIds(selectedCategoryId)]);
      if (!validIds.has(product.category_id || '')) return false;
    }
    if (scope === 'location' && selectedLocationId && product.location_id !== selectedLocationId) return false;
    if (filter === 'active' && product.is_in_stop_list) return false;
    if (filter === 'stopped' && !product.is_in_stop_list) return false;
    if (filter === 'no-category' && product.category_id) return false;
    return true;
  });

  const getCategoryById = (id: string | null): MenuCategory | undefined => categories.find((c: any) => c.id === id);
  const rootCategories = categories.filter((c: any) => !c.parent_id);
  const getChildCategories = (parentId: string) => categories.filter((c: any) => c.parent_id === parentId);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => { const next = new Set(prev); if (next.has(categoryId)) next.delete(categoryId); else next.add(categoryId); return next; });
  };

  const getProductCountForCategory = (categoryId: string): number => {
    const directCount = allProducts.filter((p: any) => p.category_id === categoryId).length;
    return directCount + getChildCategories(categoryId).reduce((acc: any, child: any) => acc + getProductCountForCategory(child.id), 0);
  };

  const renderCategoryNode = (category: MenuCategory, depth: number) => {
    const children = getChildCategories(category.id);
    const productCount = getProductCountForCategory(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = children.length > 0;

    if (productCount === 0 && !hasChildren) return null;

    return (
      <div key={category.id}>
        <div className="flex items-center" style={{ paddingLeft: depth > 0 ? `${depth * 12}px` : undefined }}>
          {hasChildren ? (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0" onClick={() => toggleCategory(category.id)}>
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </Button>
          ) : <span className="w-7 flex-shrink-0" />}
          <Button variant={selectedCategoryId === category.id ? 'secondary' : 'ghost'} size="sm" className="flex-1 justify-start h-8" onClick={() => setSelectedCategoryId(category.id)}>
            <span className="truncate">{category.name}</span>
            <Badge variant="outline" className="ml-auto text-xs">{productCount}</Badge>
          </Button>
        </div>
        {hasChildren && isExpanded && (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 border-l-2 border-muted-foreground/20" style={{ marginLeft: `${(depth + 1) * 12 + 10}px` }} />
            <div className="space-y-0.5 mt-0.5">{children.map((child: any) => renderCategoryNode(child, depth + 1))}</div>
          </div>
        )}
      </div>
    );
  };

  const locationLabel = scope === 'account' ? t('menuPage.accountMenu') : t('menuPage.locationMenu');

  return (
    <AppLayout>
      <div className="space-y-4 h-full">
        <PageHeader
          title={t('menuPage.title')}
          subtitle={posProvider ? t('menuPage.syncedWith', { name: posProvider.displayName }) : syncProviders.length > 0 ? t('menuPage.fromSources') : t('menuPage.manageMenu')}
        />

        <Card className="overflow-hidden flex-1">
          <div className="flex min-h-[600px]">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/30 flex-shrink-0">
              <div className="p-4">
                <h3 className="font-semibold mb-4">{t('menuPage.categories')}</h3>
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="space-y-1">
                    <Button variant={selectedCategoryId === null ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedCategoryId(null)}>
                      <FolderOpen className="mr-2 h-4 w-4" />{t('menuPage.allProducts')}<Badge variant="outline" className="ml-auto">{allProducts.length}</Badge>
                    </Button>
                    {categoriesLoading ? (
                      <div className="space-y-2 p-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
                    ) : (
                      <div className="space-y-0.5">{rootCategories.map((category: any) => renderCategoryNode(category, 0))}</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 p-6 overflow-auto">
              {/* Row 1: Search + filter + product count */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder={t('menuPage.searchProducts')} value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                  <SelectTrigger className="w-44"><SelectValue placeholder={t('menuPage.filter')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('menuPage.allProducts')}</SelectItem>
                    <SelectItem value="active">{t('menuPage.activeProducts')}</SelectItem>
                    <SelectItem value="stopped">{t('menuPage.inStopList')}</SelectItem>
                    <SelectItem value="no-category">{t('menuPage.noCategory')}</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-sm">{filteredProducts.length} {t('menuPage.productsCount')} · {locationLabel}</Badge>
              </div>

              {/* Row 2: Scope toggle + location + export */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <div className="flex items-center gap-1 rounded-lg border p-0.5">
                  <Button variant={scope === 'account' ? 'secondary' : 'ghost'} size="sm" onClick={() => setScope('account')}>{t('menuPage.accountMenu')}</Button>
                  <Button variant={scope === 'location' ? 'secondary' : 'ghost'} size="sm" onClick={() => setScope('location')}>{t('menuPage.locationMenu')}</Button>
                </div>
                {scope === 'location' && locationOptions.length > 0 && (
                  <Select value={selectedLocationId ?? ''} onValueChange={(v: any) => setSelectedLocationId(v)}>
                    <SelectTrigger className="w-44"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue placeholder={t('menuPage.location')} /></SelectTrigger>
                    <SelectContent>{locationOptions.map((location: any) => <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {exportProviders.length > 0 && exportProviders.map((provider: any) => (
                    <Button key={provider.providerCode} variant="outline" size="sm" disabled={menuExport.isPending} onClick={() => {
                      if (menuExport.isPending) return;
                      setExportingProvider(provider.providerCode);
                      menuExport.mutate(provider, { onSettled: () => setExportingProvider(null) });
                    }}>
                      {menuExport.isPending && exportingProvider === provider.providerCode ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                      {t('menuPage.exportTo', { name: provider.displayName })}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowResetDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('menuPage.clearMenu')}
                  </Button>
                </div>
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Card key={i}><Skeleton className="h-32 w-full rounded-t-lg" /><CardContent className="p-4"><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-1/4" /></CardContent></Card>)}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">{t('menuPage.noProductsFound')}</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? t('menuPage.tryDifferentSearch') : posProvider ? t('menuPage.importFrom', { name: posProvider.displayName }) : t('menuPage.connectPOS')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                  {filteredProducts.map((product: any) => {
                    const ext = product as MenuProductExtended;
                    return (
                      <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow group" onClick={() => setSelectedProduct(product)}>
                        <div className="relative aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground"><ImageOff className="h-8 w-8" /><span className="text-xs">{t('menuPage.noPhoto')}</span></div>
                          )}
                          {product.is_in_stop_list && <div className="absolute top-2 right-2"><Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" />{t('menuPage.stop')}</Badge></div>}
                          {!product.is_active && <div className="absolute top-2 left-2"><Badge variant="secondary">{t('menuPage.hidden')}</Badge></div>}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs truncate max-w-[120px]">
                              {product.category_id ? (getCategoryById(product.category_id)?.name || t('menuPage.noCategory')) : t('menuPage.noCategory')}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-lg font-bold">{product.price} ₴</span>
                            {(ext.weight || ext.sku) && (
                              <span className="text-xs text-muted-foreground">
                                {ext.weight && (formatWeight(ext.weight, ext.unit) ?? '')}
                                {ext.weight && ext.sku && ' · '}
                                {ext.sku && `ID: ${ext.sku}`}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <ProductDetailPanel product={selectedProduct} categories={categories} open={!!selectedProduct} onClose={() => setSelectedProduct(null)} />

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title={t('menuPage.clearMenuTitle')}
        description={t('menuPage.clearMenuDescription')}
        confirmLabel={t('menuPage.clearMenuConfirm')}
        confirmVariant="destructive"
        isPending={menuReset.isPending}
        onConfirm={() => {
          if (!currentAccount) return;
          menuReset.mutate(
            { accountId: currentAccount.id, confirmSlug: currentAccount.slug },
            {
              onSuccess: (result: any) => {
                setShowResetDialog(false);
                toast.success(t('menuPage.clearMenuSuccess'), {
                  description: t('menuPage.clearMenuResultDescription', { products: result.products, categories: result.categories, modifiers: result.modifiers, mappings: result.mappings }),
                });
              },
              onError: (err: any) => {
                toast.error(err?.message || t('common.error'));
              },
            },
          );
        }}
      />
    </AppLayout>
  );
}
