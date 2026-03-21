"use client";

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAccount } from '@/contexts/AccountContext';
import { useCreateRestaurant, useUpdateLocation, useUpdateRestaurant } from '@/hooks/useAccountData';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils/errors';
import { Clock, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const t = (key: string) => key;

const TIMEZONES = [
  'Europe/Kyiv',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Warsaw',
  'Europe/Bucharest',
  'Europe/Istanbul',
  'Europe/Moscow',
  'Asia/Dubai',
  'America/New_York',
  'America/Chicago',
] as const;

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type DaySlot = { open: string; close: string } | null;
type WorkingHoursMap = Record<string, DaySlot>;

type RestaurantFormState = {
  id: string | null;
  name: string;
  description: string;
  logoUrl: string;
};

type LocationFormState = {
  id: string | null;
  restaurantId: string;
  name: string;
  address: string;
  city: string;
  syrveOrgId: string;
  syrveTerminalGroupId: string;
  salesboxCompanyId: string;
  timezone: string;
  workingHours: WorkingHoursMap;
  workingHoursEnabled: boolean;
  latitude: string;
  longitude: string;
  supportsDelivery: boolean;
  supportsPickup: boolean;
  isDefaultDelivery: boolean;
  phone: string;
  socialLinks: { instagram: string; facebook: string; telegram: string; website: string };
};

const emptyRestaurantForm: RestaurantFormState = {
  id: null,
  name: '',
  description: '',
  logoUrl: '',
};

const DEFAULT_WORKING_HOURS: WorkingHoursMap = {
  mon: { open: '09:00', close: '23:00' },
  tue: { open: '09:00', close: '23:00' },
  wed: { open: '09:00', close: '23:00' },
  thu: { open: '09:00', close: '23:00' },
  fri: { open: '09:00', close: '23:00' },
  sat: { open: '10:00', close: '23:00' },
  sun: { open: '10:00', close: '22:00' },
};

const emptyLocationForm: LocationFormState = {
  id: null,
  restaurantId: '',
  name: '',
  address: '',
  city: '',
  syrveOrgId: '',
  syrveTerminalGroupId: '',
  salesboxCompanyId: '',
  timezone: 'Europe/Kyiv',
  workingHours: { ...DEFAULT_WORKING_HOURS },
  workingHoursEnabled: false,
  latitude: '',
  longitude: '',
  supportsDelivery: true,
  supportsPickup: true,
  isDefaultDelivery: false,
  phone: '',
  socialLinks: { instagram: '', facebook: '', telegram: '', website: '' },
};

export default function RestaurantsPage() {
  const { currentAccount, restaurants, locations, refreshAccounts } = useAccount();
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const updateLocation = useUpdateLocation();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [restaurantDialogOpen, setRestaurantDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState<RestaurantFormState>(emptyRestaurantForm);
  const [locationForm, setLocationForm] = useState<LocationFormState>(emptyLocationForm);
  const [locationSource, setLocationSource] = useState<'syrve' | 'custom'>('syrve');
  const [selectedSyrveOrgId, setSelectedSyrveOrgId] = useState('');
  const [deleteLocationId, setDeleteLocationId] = useState<string | null>(null);

  // Fetch Syrve organizations via NCB API
  const { data: syrveOrganizations, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['syrve-organizations', currentAccount?.id],
    queryFn: async () => {
      const res = await fetch(
        `/api/data/syrve_organizations?account_id=eq.${currentAccount?.id}&is_selected=eq.true&select=id,syrve_org_id,name,is_selected&order=name.asc`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to fetch syrve organizations');
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
    enabled: !!currentAccount?.id && locationDialogOpen && locationSource === 'syrve',
  });

  // Fetch terminal groups for selected org via NCB API
  const { data: syrveTerminals, isLoading: isLoadingTerminals } = useQuery({
    queryKey: ['syrve-terminals', selectedSyrveOrgId],
    queryFn: async () => {
      const res = await fetch(
        `/api/data/syrve_terminal_groups?organization_id=eq.${selectedSyrveOrgId}&select=id,syrve_terminal_id,name,address,organization_id&order=name.asc`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to fetch syrve terminals');
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
    enabled: !!selectedSyrveOrgId && locationDialogOpen && locationSource === 'syrve',
  });

  // Build set of terminal IDs already used by existing locations
  const usedTerminalIds = useMemo(() => {
    const set = new Set<string>();
    locations.forEach((loc: any) => {
      if (loc.syrve_terminal_group_id) set.add(loc.syrve_terminal_group_id);
    });
    return set;
  }, [locations]);
  const accountRestaurants = useMemo(
    () => restaurants.filter((restaurant: any) => restaurant.account_id === currentAccount?.id),
    [restaurants, currentAccount?.id]
  );

  const locationsByRestaurant = useMemo(() => {
    const map = new Map<string, typeof locations>();
    locations.forEach((location: any) => {
      const list = map.get(location.restaurant_id) ?? [];
      list.push(location);
      map.set(location.restaurant_id, list);
    });
    return map;
  }, [locations]);

  // Deep-link: auto-open location edit from Operations page
  useEffect(() => {
    const editLocationId = searchParams?.get('editLocationId');
    if (!editLocationId || locations.length === 0) return;
    const loc = locations.find((l: any) => l.id === editLocationId);
    if (loc) {
      openEditLocation(loc);
    }
    // Note: Next.js useSearchParams is read-only; clearing params requires router.replace
  }, [searchParams, locations]);

  const createLocation = useMutation({
    mutationFn: async (payload: LocationFormState) => {
      const restaurant = accountRestaurants.find((r: any) => r.id === payload.restaurantId);
      if (!restaurant) throw new Error('Restaurant not found');

      const body = {
        restaurant_id: payload.restaurantId,
        account_id: (restaurant as any).account_id,
        name: payload.name.trim(),
        address: payload.address.trim() || null,
        city: payload.city.trim() || null,
        syrve_org_id: payload.syrveOrgId.trim() || null,
        syrve_terminal_group_id: payload.syrveTerminalGroupId.trim() || null,
        salesbox_company_id: payload.salesboxCompanyId.trim() || null,
        latitude: payload.latitude ? parseFloat(payload.latitude) : null,
        longitude: payload.longitude ? parseFloat(payload.longitude) : null,
        supports_delivery: payload.supportsDelivery,
        supports_pickup: payload.supportsPickup,
        is_default_delivery: payload.isDefaultDelivery,
      };

      const res = await fetch('/api/data/restaurant_locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create location');
      const json = await res.json();
      return json;
    },
    onSuccess: async () => {
      await refreshAccounts();
      toast({
        title: t('restaurants.locationCreated'),
        description: t('restaurants.locationCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('restaurants.locationCreateError'),
        description: getErrorMessage(error, t('restaurants.locationCreateError')),
        variant: 'destructive',
      });
    },
  });

  const deleteLocation = useMutation({
    mutationFn: async (locationId: string) => {
      const res = await fetch(`/api/data/restaurant_locations?id=eq.${locationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete location');
    },
    onSuccess: async () => {
      await refreshAccounts();
      setDeleteLocationId(null);
      toast({
        title: t('restaurants.locationDeleted'),
        description: t('restaurants.locationDeletedDesc'),
      });
    },
    onError: (error: any) => {
      setDeleteLocationId(null);
      toast({
        title: t('restaurants.locationDeleteError'),
        description: getErrorMessage(error, t('restaurants.locationDeleteError')),
        variant: 'destructive',
      });
    },
  });

  const openCreateRestaurant = () => {
    setRestaurantForm(emptyRestaurantForm);
    setRestaurantDialogOpen(true);
  };

  const openEditRestaurant = (restaurant: any) => {
    setRestaurantForm({
      id: restaurant.id,
      name: restaurant.name,
      description: '',
      logoUrl: '',
    });
    setRestaurantDialogOpen(true);
  };

  const openCreateLocation = (restaurantId: string) => {
    setLocationForm({
      ...emptyLocationForm,
      restaurantId,
    });
    setLocationSource('syrve');
    setSelectedSyrveOrgId('');
    setLocationDialogOpen(true);
  };

  const openEditLocation = (location: any) => {
    const wh = location.working_hours as WorkingHoursMap | null;
    const sl = location.social_links as Record<string, string> | null;
    setLocationForm({
      id: location.id,
      restaurantId: location.restaurant_id,
      name: location.name,
      address: location.address ?? '',
      city: location.city ?? '',
      syrveOrgId: location.syrve_org_id ?? '',
      syrveTerminalGroupId: location.syrve_terminal_group_id ?? '',
      salesboxCompanyId: location.salesbox_company_id ?? '',
      timezone: location.timezone ?? 'Europe/Kyiv',
      workingHours: wh ?? { ...DEFAULT_WORKING_HOURS },
      workingHoursEnabled: wh !== null && wh !== undefined,
      latitude: location.latitude != null ? String(location.latitude) : '',
      longitude: location.longitude != null ? String(location.longitude) : '',
      supportsDelivery: location.supports_delivery ?? true,
      supportsPickup: location.supports_pickup ?? true,
      isDefaultDelivery: location.is_default_delivery ?? false,
      phone: location.phone ?? '',
      socialLinks: {
        instagram: sl?.instagram ?? '',
        facebook: sl?.facebook ?? '',
        telegram: sl?.telegram ?? '',
        website: sl?.website ?? '',
      },
    });
    setLocationDialogOpen(true);
  };

  const handleRestaurantSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = restaurantForm.name.trim();
    if (!name) return;

    try {
      if (restaurantForm.id) {
        await updateRestaurant.mutateAsync({
          id: restaurantForm.id,
          name,
          description: restaurantForm.description.trim() || null,
          logoUrl: restaurantForm.logoUrl.trim() || null,
        });
      } else {
        await createRestaurant.mutateAsync({
          name,
          description: restaurantForm.description.trim() || undefined,
          logoUrl: restaurantForm.logoUrl.trim() || undefined,
        });
      }
      await refreshAccounts();
      setRestaurantDialogOpen(false);
    } catch (error) {
      // Errors handled by hooks.
    }
  };

  const handleLocationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!locationForm.name.trim()) return;

    try {
      if (locationForm.id) {
        await updateLocation.mutateAsync({
          id: locationForm.id,
          name: locationForm.name.trim(),
          address: locationForm.address.trim() || null,
          city: locationForm.city.trim() || null,
          syrveOrgId: locationForm.syrveOrgId.trim() || null,
          syrveTerminalGroupId: locationForm.syrveTerminalGroupId.trim() || null,
          salesboxCompanyId: locationForm.salesboxCompanyId.trim() || null,
          timezone: locationForm.timezone,
          workingHours: locationForm.workingHoursEnabled ? locationForm.workingHours : null,
          latitude: locationForm.latitude ? parseFloat(locationForm.latitude) : null,
          longitude: locationForm.longitude ? parseFloat(locationForm.longitude) : null,
          supportsDelivery: locationForm.supportsDelivery,
          supportsPickup: locationForm.supportsPickup,
          isDefaultDelivery: locationForm.isDefaultDelivery,
          phone: locationForm.phone.trim() || null,
          socialLinks: Object.values(locationForm.socialLinks).some((v: any) => v.trim())
            ? Object.fromEntries(Object.entries(locationForm.socialLinks).map(([k, v]) => [k, v.trim() || null]))
            : null,
        } as any);
        await refreshAccounts();
      } else {
        await createLocation.mutateAsync(locationForm);
      }
      setLocationDialogOpen(false);
    } catch (error) {
      // Errors handled by hooks.
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('restaurants.title')}
          subtitle={currentAccount?.name
            ? t('restaurants.subtitle')
            : t('restaurants.subtitleDefault')}
          actions={
            <Button onClick={openCreateRestaurant}>
              <Plus className="h-4 w-4 mr-2" />
              {t('restaurants.addRestaurant')}
            </Button>
          }
        />

        {accountRestaurants.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('restaurants.noRestaurantsTitle')}</CardTitle>
              <CardDescription>{t('restaurants.noRestaurantsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={openCreateRestaurant}>{t('restaurants.createRestaurant')}</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {accountRestaurants.map((restaurant: any) => {
              const restaurantLocations = locationsByRestaurant.get(restaurant.id) ?? [];

              return (
                <Card key={restaurant.id}>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{restaurant.name}</CardTitle>
                      <CardDescription>
                        {t('restaurants.noDescription')}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditRestaurant(restaurant)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        {t('restaurants.edit')}
                      </Button>
                      <Button size="sm" onClick={() => openCreateLocation(restaurant.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('restaurants.addLocation')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {restaurantLocations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('restaurants.noLocationsHint')}
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('restaurants.tableName')}</TableHead>
                            <TableHead>{t('restaurants.tableAddress')}</TableHead>
                            <TableHead>{t('restaurants.tableExternalIds')}</TableHead>
                            <TableHead className="text-right">{t('restaurants.tableActions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {restaurantLocations.map((location: any) => (
                            <TableRow key={location.id}>
                              <TableCell>
                                <div className="font-medium">{location.name}</div>
                                {location.city && (
                                  <div className="text-xs text-muted-foreground">{location.city}</div>
                                )}
                              </TableCell>
                              <TableCell>
                                {location.address ? (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{location.address}</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <div>{t('restaurants.syrveOrg')}: {location.syrve_org_id || '—'}</div>
                                  <div>{t('restaurants.terminalGroup')}: {location.syrve_terminal_group_id || '—'}</div>
                                  <div>{t('restaurants.salesbox')}: {location.salesbox_company_id || '—'}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openEditLocation(location)}>
                                    <Pencil className="h-3.5 w-3.5 mr-1" />
                                    {t('restaurants.edit')}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => setDeleteLocationId(location.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={restaurantDialogOpen} onOpenChange={setRestaurantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{restaurantForm.id ? t('restaurants.editRestaurantTitle') : t('restaurants.newRestaurantTitle')}</DialogTitle>
            <DialogDescription>
              {restaurantForm.id
                ? t('restaurants.editRestaurantDesc')
                : t('restaurants.newRestaurantDesc')}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleRestaurantSubmit}>
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">{t('restaurants.restaurantName')}</Label>
              <Input
                id="restaurant-name"
                value={restaurantForm.name}
                onChange={(event) =>
                  setRestaurantForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder={t('restaurants.restaurantNamePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-description">{t('restaurants.description')}</Label>
              <Textarea
                id="restaurant-description"
                value={restaurantForm.description}
                onChange={(event) =>
                  setRestaurantForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder={t('restaurants.descriptionPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-logo">{t('restaurants.logoUrl')}</Label>
              <Input
                id="restaurant-logo"
                value={restaurantForm.logoUrl}
                onChange={(event) =>
                  setRestaurantForm((prev) => ({ ...prev, logoUrl: event.target.value }))
                }
                placeholder={t('uiLiterals.placeholders.url')}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createRestaurant.isPending || updateRestaurant.isPending}>
                {restaurantForm.id ? t('restaurants.saveChanges') : t('restaurants.createRestaurant')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{locationForm.id ? t('restaurants.editLocationTitle') : t('restaurants.addLocationTitle')}</DialogTitle>
            <DialogDescription>
              {t('restaurants.locationDesc')}
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleLocationSubmit}>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">

            {/* Location source toggle — only for new locations */}
            {!locationForm.id && (
              <div className="space-y-2">
                <Label>{t('restaurants.locationSource')}</Label>
                <RadioGroup
                  value={locationSource}
                  onValueChange={(val: any) => {
                    setLocationSource(val);
                    setSelectedSyrveOrgId('');
                    if (val === 'custom') {
                      setLocationForm((prev) => ({
                        ...prev,
                        syrveOrgId: '',
                        syrveTerminalGroupId: '',
                      }));
                    }
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="syrve" id="source-syrve" />
                    <Label htmlFor="source-syrve" className="font-normal cursor-pointer">
                      {t('restaurants.fromSyrve')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="source-custom" />
                    <Label htmlFor="source-custom" className="font-normal cursor-pointer">
                      {t('restaurants.customLocation')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Syrve org + terminal selects — only for new + syrve mode */}
            {!locationForm.id && locationSource === 'syrve' && (
              <>
                <div className="space-y-2">
                  <Label>{t('restaurants.selectOrganization')}</Label>
                  {isLoadingOrgs ? (
                    <p className="text-sm text-muted-foreground">{t('restaurants.loadingOrganizations')}</p>
                  ) : !syrveOrganizations?.length ? (
                    <p className="text-sm text-muted-foreground">{t('restaurants.noOrganizations')}</p>
                  ) : (
                    <Select
                      value={selectedSyrveOrgId}
                      onValueChange={(val) => {
                        setSelectedSyrveOrgId(val);
                        setLocationForm((prev) => ({
                          ...prev,
                          name: '',
                          address: '',
                          syrveOrgId: '',
                          syrveTerminalGroupId: '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('restaurants.selectOrganization')} />
                      </SelectTrigger>
                      <SelectContent>
                        {syrveOrganizations.map((org: any) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedSyrveOrgId && (
                  <div className="space-y-2">
                    <Label>{t('restaurants.selectTerminal')}</Label>
                    {isLoadingTerminals ? (
                      <p className="text-sm text-muted-foreground">{t('restaurants.loadingTerminals')}</p>
                    ) : !syrveTerminals?.length ? (
                      <p className="text-sm text-muted-foreground">{t('restaurants.noTerminals')}</p>
                    ) : (
                      <Select
                        value={locationForm.syrveTerminalGroupId}
                        onValueChange={(terminalSyrveId) => {
                          const terminal = syrveTerminals.find((item: any) => item.syrve_terminal_id === terminalSyrveId);
                          if (terminal) {
                            const selectedOrg = syrveOrganizations?.find((o: any) => o.id === selectedSyrveOrgId);
                            setLocationForm((prev) => ({
                              ...prev,
                              name: terminal.name,
                              address: terminal.address ?? '',
                              syrveOrgId: selectedOrg?.syrve_org_id ?? '',
                              syrveTerminalGroupId: terminal.syrve_terminal_id,
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('restaurants.selectTerminal')} />
                        </SelectTrigger>
                        <SelectContent>
                          {syrveTerminals.map((terminal: any) => {
                            const isUsed = usedTerminalIds.has(terminal.syrve_terminal_id);
                            return (
                              <SelectItem key={terminal.id} value={terminal.syrve_terminal_id}>
                                {terminal.name}
                                {terminal.address ? ` — ${terminal.address}` : ''}
                                {isUsed ? ` (${t('restaurants.alreadyUsed')})` : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="location-name">{t('restaurants.locationName')}</Label>
              <Input
                id="location-name"
                value={locationForm.name}
                onChange={(event) =>
                  setLocationForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder={t('restaurants.locationNamePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-address">{t('restaurants.address')}</Label>
              <Input
                id="location-address"
                value={locationForm.address}
                onChange={(event) =>
                  setLocationForm((prev) => ({ ...prev, address: event.target.value }))
                }
                placeholder={t('restaurants.addressPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-city">{t('restaurants.city')}</Label>
              <Input
                id="location-city"
                value={locationForm.city}
                onChange={(event) =>
                  setLocationForm((prev) => ({ ...prev, city: event.target.value }))
                }
                placeholder={t('restaurants.cityPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location-phone">{t('restaurants.phone')}</Label>
              <Input
                id="location-phone"
                value={locationForm.phone}
                onChange={(e) => setLocationForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder={t('uiLiterals.placeholders.phoneUaSpaced')}
              />
            </div>

            {/* Syrve IDs — show as manual inputs only in custom mode or edit mode */}
            {(locationForm.id || locationSource === 'custom') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="syrve-org-id">{t('restaurants.syrveOrgId')}</Label>
                  <Input
                    id="syrve-org-id"
                    value={locationForm.syrveOrgId}
                    onChange={(event) =>
                      setLocationForm((prev) => ({ ...prev, syrveOrgId: event.target.value }))
                    }
                    placeholder={t('restaurants.syrveOrgIdPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="syrve-terminal-group-id">{t('restaurants.syrveTerminalGroupId')}</Label>
                  <Input
                    id="syrve-terminal-group-id"
                    value={locationForm.syrveTerminalGroupId}
                    onChange={(event) =>
                      setLocationForm((prev) => ({ ...prev, syrveTerminalGroupId: event.target.value }))
                    }
                    placeholder={t('restaurants.syrveTerminalGroupIdPlaceholder')}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="salesbox-company-id">{t('restaurants.salesboxCompanyId')}</Label>
              <Input
                id="salesbox-company-id"
                value={locationForm.salesboxCompanyId}
                onChange={(event) =>
                  setLocationForm((prev) => ({ ...prev, salesboxCompanyId: event.target.value }))
                }
                placeholder={t('restaurants.salesboxCompanyIdPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="location-lat">{t('restaurants.latitude')}</Label>
                <Input
                  id="location-lat"
                  type="number"
                  step="any"
                  value={locationForm.latitude}
                  onChange={(e) => setLocationForm((prev) => ({ ...prev, latitude: e.target.value }))}
                  placeholder={t('uiLiterals.placeholders.latitude')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-lon">{t('restaurants.longitude')}</Label>
                <Input
                  id="location-lon"
                  type="number"
                  step="any"
                  value={locationForm.longitude}
                  onChange={(e) => setLocationForm((prev) => ({ ...prev, longitude: e.target.value }))}
                  placeholder={t('uiLiterals.placeholders.longitude')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>{t('restaurants.capabilities')}</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={locationForm.supportsDelivery}
                    onChange={(e) => setLocationForm((prev) => ({ ...prev, supportsDelivery: e.target.checked }))}
                    className="rounded"
                  />
                  {t('restaurants.supportsDelivery')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={locationForm.supportsPickup}
                    onChange={(e) => setLocationForm((prev) => ({ ...prev, supportsPickup: e.target.checked }))}
                    className="rounded"
                  />
                  {t('restaurants.supportsPickup')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={locationForm.isDefaultDelivery}
                    onChange={(e) => setLocationForm((prev) => ({ ...prev, isDefaultDelivery: e.target.checked }))}
                    className="rounded"
                  />
                  {t('restaurants.defaultDeliveryLocation')}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('restaurants.timezone')}</Label>
              <Select
                value={locationForm.timezone}
                onValueChange={(value) =>
                  setLocationForm((prev) => ({ ...prev, timezone: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('restaurants.selectTimezone')} />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label>{t('restaurants.workingHours')}</Label>
                <label className="ml-auto flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={locationForm.workingHoursEnabled}
                    onChange={(e) =>
                      setLocationForm((prev) => ({ ...prev, workingHoursEnabled: e.target.checked }))
                    }
                    className="rounded"
                  />
                  {t('restaurants.setSchedule')}
                </label>
              </div>
              {!locationForm.workingHoursEnabled && (
                <p className="text-xs text-muted-foreground">{t('restaurants.alwaysOpen')}</p>
              )}
              {locationForm.workingHoursEnabled && (
                <div className="grid gap-2">
                  {DAY_KEYS.map((day) => {
                    const slot = locationForm.workingHours[day];
                    const isClosed = slot === null;
                    return (
                      <div key={day} className="flex items-center gap-2 text-sm">
                        <span className="w-10 font-medium">{t(`restaurants.days.${day}`)}</span>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!isClosed}
                            onChange={(e) => {
                              setLocationForm((prev) => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day]: e.target.checked ? { open: '09:00', close: '23:00' } : null,
                                },
                              }));
                            }}
                            className="rounded"
                          />
                        </label>
                        {!isClosed && slot && (
                          <>
                            <Input
                              type="time"
                              value={slot.open}
                              onChange={(e) =>
                                setLocationForm((prev) => ({
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [day]: { ...slot, open: e.target.value },
                                  },
                                }))
                              }
                              className="h-8 w-28"
                            />
                            <span>–</span>
                            <Input
                              type="time"
                              value={slot.close}
                              onChange={(e) =>
                                setLocationForm((prev) => ({
                                  ...prev,
                                  workingHours: {
                                    ...prev.workingHours,
                                    [day]: { ...slot, close: e.target.value },
                                  },
                                }))
                              }
                              className="h-8 w-28"
                            />
                          </>
                        )}
                        {isClosed && <span className="text-muted-foreground">{t('restaurants.closed')}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>{t('restaurants.socialLinks')}</Label>
              <div className="grid gap-2">
                {(['instagram', 'facebook', 'telegram', 'website'] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-20 text-sm capitalize text-muted-foreground">{key}</span>
                    <Input
                      value={locationForm.socialLinks[key]}
                      onChange={(e) =>
                        setLocationForm((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, [key]: e.target.value },
                        }))
                      }
                      placeholder={`https://${key === 'website' ? 'example.com' : key + '.com/...'}`}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </div>

            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={createLocation.isPending || updateLocation.isPending}
              >
                {locationForm.id ? t('restaurants.saveChanges') : t('restaurants.createLocation')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteLocationId}
        onOpenChange={(open: any) => { if (!open) setDeleteLocationId(null); }}
        title={t('restaurants.deleteLocationConfirm')}
        description={t('restaurants.deleteLocationDesc')}
        confirmLabel={t('restaurants.deleteLocation')}
        confirmVariant="destructive"
        onConfirm={() => { if (deleteLocationId) deleteLocation.mutate(deleteLocationId); }}
        isPending={deleteLocation.isPending}
        cancelLabel={t('common.close')}
      />
    </AppLayout>
  );
}
