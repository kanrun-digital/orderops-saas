"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductMappingPanel } from '@/components/menu/ProductMappingPanel';
import { CategoryMappingPanel } from '@/components/menu/CategoryMappingPanel';
import { ExternalOnlyItemsPanel } from '@/components/menu/ExternalOnlyItemsPanel';
import { CrossProviderMappingTable } from '@/components/menu/CrossProviderMappingTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/app/PageHeader';
import { useMenuScope } from '@/hooks/useMenuScope';
import { useAccount } from '@/contexts/AccountContext';
import { useMenuSyncProviders } from '@/hooks/useMenuSyncProviders';
import { ArrowRight, Package, FolderTree, AlertCircle, ShoppingBag, MapPin, LayoutGrid } from 'lucide-react';
import type { MappingProvider } from '@/lib/types/mappingProvider';

const t = (key: string, params?: Record<string, string | number>) => key;

const VALID_STATUS_FILTERS = new Set(['all', 'linked', 'suggested', 'not_linked']);

function normalizeStatusFilter(value: string | null): string {
  if (!value) return 'all';
  return VALID_STATUS_FILTERS.has(value) ? value : 'all';
}

export default function MenuMappingPage() {
  const searchParams = useSearchParams();
  const { catalogProviders, posProvider } = useMenuSyncProviders();
  const { scope, setScope } = useMenuScope();
  const { locations, currentRestaurant, currentLocation } = useAccount();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const queryProvider = searchParams.get('provider');
  const queryStatusFilter = useMemo(() => normalizeStatusFilter(searchParams.get('status')), [searchParams]);
  const [selectedProviderCode, setSelectedProviderCode] = useState<string | null>(queryProvider);

  const restaurantLocations = locations.filter((l: any) => l.restaurant_id === currentRestaurant?.id);
  const locationOptions = restaurantLocations.length > 0 ? restaurantLocations : locations;

  // Auto-select first catalog (non-POS) provider
  useEffect(() => {
    if (selectedProviderCode === '__all__') return;
    const hasSelectedProvider = catalogProviders.some((provider: any) => provider.providerCode === selectedProviderCode);
    if (catalogProviders.length > 0 && !hasSelectedProvider) {
      setSelectedProviderCode((catalogProviders[0] as any).providerCode);
    }
  }, [catalogProviders, selectedProviderCode]);

  useEffect(() => {
    if (!queryProvider) return;
    const matchedProvider = catalogProviders.find(
      (provider: any) => provider.providerCode === queryProvider || provider.providerEnum === queryProvider,
    );
    if (matchedProvider) {
      setSelectedProviderCode((matchedProvider as any).providerCode);
    }
  }, [queryProvider, catalogProviders]);

  // Auto-select location
  useEffect(() => {
    if (scope !== 'location') return;
    if (selectedLocationId) return;
    if (locationOptions.length === 0) return;
    const fallbackLocation = currentLocation?.id ?? (locationOptions[0] as any)?.id ?? null;
    if (fallbackLocation) {
      setSelectedLocationId(fallbackLocation);
    }
  }, [scope, selectedLocationId, locationOptions, currentLocation]);

  const selectedProvider = catalogProviders.find((p: any) => p.providerCode === selectedProviderCode);

  const mappingProvider: MappingProvider | null = selectedProvider
    ? {
        code: (selectedProvider as any).providerCode,
        enum: (selectedProvider as any).providerEnum,
        displayName: (selectedProvider as any).displayName,
        connectionId: (selectedProvider as any).connectionId,
        exportFunction: (selectedProvider as any).exportFunction,
        exportAction: (selectedProvider as any).exportAction,
        supportsExternalCategories: (selectedProvider as any).supportsExternalCategories,
        categoryCreateAction: (selectedProvider as any).categoryCreateAction,
        categoryDeleteAction: (selectedProvider as any).categoryDeleteAction,
        mappingCreateAction: (selectedProvider as any).mappingCreateAction,
        mappingDeleteAction: (selectedProvider as any).mappingDeleteAction,
      }
    : null;

  if (catalogProviders.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader title={t('menuMapping.title')} subtitle={t('menuMapping.subtitle')} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                {t('menuMapping.noPlatforms')}
              </CardTitle>
              <CardDescription>{t('menuMapping.noPlatformsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/app/integrations">
                  {t('menuMapping.goToIntegrations')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <PageHeader title={t('menuMapping.title')} subtitle={t('menuMapping.subtitleFull')} />

        {/* Platform Tabs + Scope switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedProviderCode === '__all__' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedProviderCode('__all__')}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            {t('menuMapping.allProviders')}
          </Button>
          {catalogProviders.map((p: any) => (
            <Button
              key={p.providerCode}
              variant={selectedProviderCode === p.providerCode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProviderCode(p.providerCode)}
            >
              {p.displayName}
              {p.unmappedCount > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({p.unmappedCount})</span>
              )}
            </Button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <Button variant={scope === 'account' ? 'secondary' : 'outline'} size="sm" onClick={() => setScope('account')}>
              {t('menuMapping.accountMenu')}
            </Button>
            <Button variant={scope === 'location' ? 'secondary' : 'outline'} size="sm" onClick={() => setScope('location')}>
              {t('menuMapping.locationMenu')}
            </Button>
            {scope === 'location' && locationOptions.length > 0 && (
              <Select value={selectedLocationId ?? ''} onValueChange={(v: any) => setSelectedLocationId(v)}>
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t('menuMapping.location')} />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((location: any) => (
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Mapping Direction Visual */}
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-info/10 rounded-lg border border-info/20">
                <div className="h-8 w-8 rounded-full bg-info/15 flex items-center justify-center">
                  <Package className="h-4 w-4 text-info" />
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">{(posProvider as any)?.displayName ?? 'POS'}</div>
                  <div className="text-xs text-info">{t('menuMapping.source')}</div>
                </div>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-lg border border-success/20">
                <div className="h-8 w-8 rounded-full bg-success/15 flex items-center justify-center">
                  <FolderTree className="h-4 w-4 text-success" />
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">{t('menuMapping.canonicalMenu')}</div>
                  <div className="text-xs text-success">{t('menuMapping.yourMenu')}</div>
                </div>
              </div>

              <ArrowRight className="h-5 w-5 text-muted-foreground" />

              <div className="flex gap-2">
                {catalogProviders.map((p: any) => (
                  <div
                    key={p.providerCode}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      selectedProviderCode === p.providerCode
                        ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20'
                        : 'bg-accent/10 border-accent/20'
                    }`}
                  >
                    <div className="h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-foreground">{p.displayName.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-foreground text-sm">{p.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedProviderCode === '__all__' && (
          <CrossProviderMappingTable scope={scope} locationId={selectedLocationId} />
        )}

        {selectedProviderCode !== '__all__' && mappingProvider && (
          <Tabs defaultValue="products" className="space-y-4">
            <TabsList>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('menuMapping.products')}
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                {t('menuMapping.categories')}
              </TabsTrigger>
              <TabsTrigger value="external-only" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {t('menuMapping.externalOnly', { provider: mappingProvider.displayName })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductMappingPanel
                scope={scope}
                locationId={selectedLocationId}
                provider={mappingProvider}
                initialStatusFilter={queryStatusFilter}
              />
            </TabsContent>

            <TabsContent value="categories">
              <CategoryMappingPanel scope={scope} locationId={selectedLocationId} provider={mappingProvider} />
            </TabsContent>

            <TabsContent value="external-only">
              <ExternalOnlyItemsPanel scope={scope} locationId={selectedLocationId} provider={mappingProvider} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
