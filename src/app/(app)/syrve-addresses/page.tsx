"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Search, MapPin, Building2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { toastError } from '@/lib/utils/errors';
import {
  useSyrveAddresses,
  useSyrveAddressCount,
  useSyrveSyncRegions,
  useSyrveSyncCities,
  useSyrveAddressLookup,
  useSyrveOrganizations,
} from '@/hooks/useSyrve';
import { useAccount } from '@/contexts/AccountContext';
import CityStreetsAccordion from '@/components/addresses/CityStreetsAccordion';

const t = (key: string) => key;

const SYRVE_DIAGNOSTICS_ENABLED = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_SYRVE_DIAGNOSTICS === 'true';

function AddressTable({ data, isLoading, emptyText }: {
  data: Array<{ id: string; syrve_id: string; name: string; parent_id: string | null; entity_type: string; is_deleted: boolean }>;
  isLoading: boolean;
  emptyText: string;
}) {
  if (isLoading) return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!data.length) return <p className="text-sm text-muted-foreground text-center py-8">{emptyText}</p>;
  return (
    <Table>
      <TableHeader><TableRow><TableHead>{t('syrveAddresses.name')}</TableHead><TableHead>{t('syrveAddresses.syrveId')}</TableHead></TableRow></TableHeader>
      <TableBody>
        {data.map((item: any) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{item.syrve_id}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function SyrveAddresses() {
  const queryClient = useQueryClient();
  const { currentAccount } = useAccount();
  const accountId = (currentAccount as any)?.id;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrganizationId, setActiveOrganizationId] = useState('');

  const { data: organizations = [] } = useSyrveOrganizations();
  const { data: regions = [], isLoading: regionsLoading } = useSyrveAddresses('region');
  const { data: cities = [], isLoading: citiesLoading } = useSyrveAddresses('city');
  const { data: streets = [] } = useSyrveAddresses('street');
  const { data: regionCount = 0 } = useSyrveAddressCount('region');
  const { data: cityCount = 0 } = useSyrveAddressCount('city');
  const {
    data: streetCount = 0,
    dataUpdatedAt: streetCountUpdatedAt,
    isFetching: isStreetCountFetching,
  } = useSyrveAddressCount('street');
  const syncRegions = useSyrveSyncRegions();
  const syncCities = useSyrveSyncCities();
  const lookupMutation = useSyrveAddressLookup();

  const selectedOrganizations = useMemo(
    () => (organizations as any[]).filter((organization: any) => organization.is_selected),
    [organizations],
  );

  const hasSelectedOrganization = selectedOrganizations.length > 0;
  const hasMultipleSelectedOrganizations = selectedOrganizations.length > 1;

  useEffect(() => {
    if (!selectedOrganizations.length) {
      setActiveOrganizationId('');
      return;
    }

    if (!selectedOrganizations.some((organization: any) => organization.organization_id === activeOrganizationId)) {
      setActiveOrganizationId(selectedOrganizations[0].organization_id);
    }
  }, [selectedOrganizations, activeOrganizationId]);

  const handleSyncRegions = async () => {
    if (!activeOrganizationId) return;
    try {
      const result = await syncRegions.mutateAsync(activeOrganizationId);
      toast.success(t('syrveAddresses.syncedCount') + ': ' + ((result as any).count ?? 0));
    }
    catch (e: any) {
      toastError(t('syrveAddresses.regionSyncFailed'), e);
    }
  };

  const handleSyncCities = async () => {
    if (!activeOrganizationId) return;
    try {
      const result = await syncCities.mutateAsync(activeOrganizationId);
      toast.success(t('syrveAddresses.syncedCount') + ': ' + ((result as any).count ?? 0));
    }
    catch (e: any) {
      toastError(t('syrveAddresses.citySyncFailed'), e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !activeOrganizationId) return;
    try {
      const result = await lookupMutation.mutateAsync({ cityName: searchQuery, organizationId: activeOrganizationId });
      toast.info(t('syrveAddresses.foundCities') + ': ' + ((result as any).cities?.length ?? 0));
    }
    catch (e: any) {
      toastError(t('syrveAddresses.lookupFailed'), e);
    }
  };

  const filteredRegions = searchQuery.trim() ? (regions as any[]).filter((r: any) => r.name.toLowerCase().includes(searchQuery.toLowerCase())) : (regions as any[]);
  const filteredCities = searchQuery.trim() ? (cities as any[]).filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : (cities as any[]);
  const streetListCount = (streets as any[]).length;
  const hasStreetCountMismatch = streetListCount !== streetCount;

  const handleRefreshStreetCount = async () => {
    if (!accountId) return;
    await queryClient.invalidateQueries({ queryKey: ['syrve-address-count', accountId, 'street'] });
  };

  const streetCountLastUpdated = streetCountUpdatedAt
    ? new Date(streetCountUpdatedAt).toLocaleTimeString()
    : t('syrveAddresses.notAvailable');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader title={t('syrveAddresses.title')} subtitle={t('syrveAddresses.subtitle')} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t('syrveAddresses.regions')}</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{regionCount as any}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {t('syrveAddresses.cities')}</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{cityCount as any}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardDescription className="flex items-center gap-1"><Navigation className="h-3.5 w-3.5" /> {t('syrveAddresses.streets')}</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{streetCount as any}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('syrveAddresses.syncTargetOrganizationTitle')}</CardTitle>
            {hasMultipleSelectedOrganizations && (
              <CardDescription>
                {t('syrveAddresses.syncTargetOrganizationMultipleDescription')}
              </CardDescription>
            )}
            {!hasSelectedOrganization && (
              <CardDescription>
                {t('syrveAddresses.syncTargetOrganizationEmptyDescription')}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Select
              value={activeOrganizationId}
              onValueChange={setActiveOrganizationId}
              disabled={!hasSelectedOrganization}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder={t('syrveAddresses.selectOrganizationPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {selectedOrganizations.map((organization: any) => (
                  <SelectItem key={organization.id} value={organization.organization_id}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Input placeholder={t('syrveAddresses.searchPlaceholder')} value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} className="max-w-sm" />
          <Button variant="outline" size="icon" onClick={handleSearch} disabled={!activeOrganizationId || lookupMutation.isPending}>
            {lookupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <Tabs defaultValue="streets">
          <TabsList>
            <TabsTrigger value="regions">{t('syrveAddresses.regions')} <Badge variant="secondary" className="ml-1.5 text-xs">{regionCount as any}</Badge></TabsTrigger>
            <TabsTrigger value="cities">{t('syrveAddresses.cities')} <Badge variant="secondary" className="ml-1.5 text-xs">{cityCount as any}</Badge></TabsTrigger>
            <TabsTrigger value="streets">{t('syrveAddresses.streets')} <Badge variant="secondary" className="ml-1.5 text-xs">{streetCount as any}</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="regions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t('syrveAddresses.regions')}</CardTitle>
                <Button size="sm" onClick={handleSyncRegions} disabled={!activeOrganizationId || syncRegions.isPending}>
                  {syncRegions.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}{t('syrveAddresses.syncRegions')}
                </Button>
              </CardHeader>
              <CardContent><AddressTable data={filteredRegions} isLoading={regionsLoading} emptyText={t('syrveAddresses.noRecords')} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cities">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{t('syrveAddresses.cities')}</CardTitle>
                <Button size="sm" onClick={handleSyncCities} disabled={!activeOrganizationId || syncCities.isPending}>
                  {syncCities.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}{t('syrveAddresses.syncCities')}
                </Button>
              </CardHeader>
              <CardContent><AddressTable data={filteredCities} isLoading={citiesLoading} emptyText={t('syrveAddresses.noRecords')} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="streets">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{t('syrveAddresses.streetsByCity')}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{t('syrveAddresses.lastUpdated')}: {streetCountLastUpdated}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRefreshStreetCount}
                      disabled={!accountId || isStreetCountFetching}
                      className="h-7 px-2"
                    >
                      {isStreetCountFetching ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}
                      {t('syrveAddresses.refresh')}
                    </Button>
                  </div>
                </div>
                <CardDescription>{t('syrveAddresses.expandCity')}</CardDescription>
                {SYRVE_DIAGNOSTICS_ENABLED && hasStreetCountMismatch && (
                  <Badge variant="destructive" className="mt-2 w-fit">
                    {t('syrveAddresses.streetDiagnosticsMismatch')}: list={streetListCount}, count={streetCount as any}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <CityStreetsAccordion
                  cities={cities as any}
                  citiesLoading={citiesLoading}
                  organizationId={activeOrganizationId || undefined}
                  syncDisabled={!activeOrganizationId}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
