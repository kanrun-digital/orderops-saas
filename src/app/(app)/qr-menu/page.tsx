"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccount } from '@/contexts/AccountContext';
import { useToast } from '@/hooks/use-toast';
import {
  usePublicSites,
  useCreatePublicSite,
  useUpdatePublicSite,
  useDeletePublicSite,
  useDiningTables,
  useCreateDiningTable,
  useUpdateDiningTable,
  useDeleteDiningTable,
} from '@/hooks/usePublicSites';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { emptySiteForm, type SiteFormState } from './types';
import { QrPreviewDialog } from './QrPreviewDialog';
import { SitesTable } from './SitesTable';
import { TablesSection } from './TablesSection';
import { SiteFormDialog } from './SiteFormDialog';


const t = (key: string) => key;

function useSyrveOrganizations(accountId: string | undefined) {
  return useQuery({
    queryKey: ['syrve_organizations', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      const res = await fetch(`/api/data/syrve_organizations?account_id=eq.${accountId}&order=name.asc`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch syrve organizations');
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!accountId,
  });
}

export default function QRMenuSettingsPage() {
  const { currentAccount, locations } = useAccount();
  const accountId = currentAccount?.id;
  const { data: sites = [], isLoading: sitesLoading } = usePublicSites(accountId);
  const { data: syrveOrgs = [] } = useSyrveOrganizations(accountId);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [qrPreviewSite, setQrPreviewSite] = useState<(typeof sites)[number] | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const activeSite = sites.find((s: any) => s.id === selectedSiteId) ?? sites[0] ?? null;

  const { data: tables = [], isLoading: tablesLoading } = useDiningTables(activeSite?.location_id);
  const createSite = useCreatePublicSite();
  const updateSite = useUpdatePublicSite();
  const deleteSite = useDeletePublicSite();
  const createTable = useCreateDiningTable();
  const updateTable = useUpdateDiningTable();
  const deleteTable = useDeleteDiningTable();
  const { toast } = useToast();

  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [siteForm, setSiteForm] = useState<SiteFormState>(emptySiteForm);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [deleteSiteId, setDeleteSiteId] = useState<string | null>(null);

  const availableLocations = useMemo(() => {
    const usedLocationIds = new Set(sites.map((s: any) => s.location_id));
    return locations.filter((l: any) => !usedLocationIds.has(l.id) && l.account_id === accountId);
  }, [locations, sites, accountId]);

  // ── Site handlers ──

  const openCreateSite = () => {
    setSiteForm(emptySiteForm);
    setSiteDialogOpen(true);
  };

  const openEditSite = (site: (typeof sites)[number]) => {
    const siteAny = site as any;
    const theme = (siteAny.theme ?? {}) as Record<string, unknown>;
    const settings = (siteAny.settings ?? {}) as Record<string, unknown>;
    setSiteForm({
      id: siteAny.id,
      location_id: siteAny.location_id,
      public_slug: siteAny.public_slug,
      title: siteAny.title ?? '',
      status: siteAny.status as SiteFormState['status'],
      primary_color: (theme.primary_color as string) ?? '#27AE4F',
      logo_url: (theme.logo_url as string) ?? '',
      dine_in_enabled: (settings.dine_in_enabled as boolean) ?? true,
      pickup_enabled: (settings.pickup_enabled as boolean) ?? false,
      delivery_enabled: (settings.delivery_enabled as boolean) ?? false,
      currency: (siteAny.currency as string) ?? (settings.currency as string) ?? 'UAH',
      menu_scope: (siteAny.menu_scope as SiteFormState['menu_scope']) ?? 'account',
      menu_mode: (siteAny.menu_mode as SiteFormState['menu_mode']) ?? 'shared',
      organization_id: siteAny.organization_id ?? null,
      accent_color: (theme.accentColor as string) ?? '#27AE4F',
      locale: (settings.locale as SiteFormState['locale']) ?? 'uk',
      order_flow: (settings.orderFlow as SiteFormState['order_flow']) ?? 'review',
      require_customer_name: (settings.requireCustomerName as boolean) ?? false,
      require_phone: (settings.requirePhone as boolean) ?? false,
      min_order_total: (settings.minOrderTotal as number) ?? 0,
      listing_layout: (settings.listingLayout as SiteFormState['listing_layout']) ?? emptySiteForm.listing_layout,
      category_click_behavior: (settings.categoryClickBehavior as SiteFormState['category_click_behavior']) ?? emptySiteForm.category_click_behavior,
      category_style: (settings.categoryStyle as SiteFormState['category_style']) ?? emptySiteForm.category_style,
      gtm_container_id: (settings.gtmContainerId as string) ?? '',
      ga_measurement_id: (settings.gaMeasurementId as string) ?? '',
    });
    setSiteDialogOpen(true);
  };

  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    const theme: any = {
      primary_color: siteForm.primary_color,
      logo_url: siteForm.logo_url || null,
      accentColor: siteForm.accent_color,
    };
    const settings: any = {
      dine_in_enabled: siteForm.dine_in_enabled,
      pickup_enabled: siteForm.pickup_enabled,
      delivery_enabled: siteForm.delivery_enabled,
      locale: siteForm.locale,
      orderFlow: siteForm.order_flow,
      requireCustomerName: siteForm.require_customer_name,
      requirePhone: siteForm.require_phone,
      minOrderTotal: siteForm.min_order_total,
      listingLayout: siteForm.listing_layout,
      categoryClickBehavior: siteForm.category_click_behavior,
      categoryStyle: siteForm.category_style,
      gtmContainerId: siteForm.gtm_container_id || null,
      gaMeasurementId: siteForm.ga_measurement_id || null,
    };

    const commonPayload = {
      public_slug: siteForm.public_slug,
      title: siteForm.title,
      theme,
      settings,
      currency: siteForm.currency,
    };

    if (siteForm.id) {
      await updateSite.mutateAsync({ id: siteForm.id, account_id: accountId, status: siteForm.status, ...commonPayload });
    } else {
      await createSite.mutateAsync({ account_id: accountId, location_id: siteForm.location_id, ...commonPayload });
    }
    setSiteDialogOpen(false);
  };

  const handleDeleteSite = async () => {
    if (!deleteSiteId || !accountId) return;
    await deleteSite.mutateAsync({ id: deleteSiteId, account_id: accountId });
    setDeleteSiteId(null);
  };

  const togglePublish = async (site: (typeof sites)[number]) => {
    if (!accountId) return;
    const siteAny = site as any;
    const newStatus = siteAny.status === 'published' ? 'draft' as const : 'published' as const;
    await updateSite.mutateAsync({ id: siteAny.id, account_id: accountId, status: newStatus });
  };

  // ── Table handlers ──

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite || !accountId) return;
    await createTable.mutateAsync({ account_id: accountId, location_id: activeSite.location_id, name: tableName.trim() });
    setTableDialogOpen(false);
  };

  const handleToggleTable = async (table: (typeof tables)[number]) => {
    const tableAny = table as any;
    await updateTable.mutateAsync({ id: tableAny.id, location_id: tableAny.location_id, is_active: !tableAny.is_active });
  };

  const handleDeleteTable = async () => {
    if (!deleteTableId || !activeSite) return;
    await deleteTable.mutateAsync({ id: deleteTableId, location_id: activeSite.location_id });
    setDeleteTableId(null);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: t('qrMenu.linkCopied') });
  };

  // ── Render ──

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageHeader title={t('qrMenu.title')} subtitle={t('qrMenu.subtitle')} />
          <Button onClick={openCreateSite} disabled={availableLocations.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            {t('qrMenu.createSite')}
          </Button>
        </div>

        {sitesLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">{t('qrMenu.loading')}</CardContent>
          </Card>
        ) : sites.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('qrMenu.noSitesTitle')}</CardTitle>
              <CardDescription>{t('qrMenu.noSitesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={openCreateSite} disabled={availableLocations.length === 0}>
                {t('qrMenu.createSite')}
              </Button>
              {availableLocations.length === 0 && locations.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">{t('qrMenu.allLocationsUsed')}</p>
              )}
              {availableLocations.length === 0 && locations.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('qrMenu.addLocationFirst')}{' '}
                  <a href="/app/restaurants" className="underline text-primary hover:text-primary/80">
                    {t('qrMenu.restaurantsLink')}
                  </a>.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <SitesTable
              sites={sites}
              activeSiteId={activeSite?.id}
              onTogglePublish={togglePublish}
              onEditSite={openEditSite}
              onQrPreview={setQrPreviewSite}
              onDeleteSite={setDeleteSiteId}
            />

            <TablesSection
              sites={sites}
              activeSite={activeSite}
              selectedSiteId={selectedSiteId}
              setSelectedSiteId={setSelectedSiteId}
              tables={tables}
              tablesLoading={tablesLoading}
              onCreateTable={() => { setTableName(''); setTableDialogOpen(true); }}
              onToggleTable={handleToggleTable}
              onDeleteTable={setDeleteTableId}
              onCopyLink={copyLink}
            />
          </>
        )}
      </div>

      <QrPreviewDialog
        site={qrPreviewSite}
        qrDataUrl={qrDataUrl}
        setQrDataUrl={setQrDataUrl}
        onClose={() => { setQrPreviewSite(null); setQrDataUrl(null); }}
        onCopy={copyLink}
      />

      <SiteFormDialog
        open={siteDialogOpen}
        onOpenChange={setSiteDialogOpen}
        siteForm={siteForm}
        setSiteForm={setSiteForm}
        onSubmit={handleSiteSubmit}
        isPending={createSite.isPending || updateSite.isPending}
        locations={locations}
        availableLocations={availableLocations}
        syrveOrgs={syrveOrgs}
      />

      {/* Create table dialog */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('qrMenu.addTableTitle')}</DialogTitle>
            <DialogDescription>{t('qrMenu.addTableDesc')}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleTableSubmit}>
            <div className="space-y-2">
              <Label htmlFor="table-name">{t('qrMenu.tableNameLabel')}</Label>
              <Input id="table-name" value={tableName} onChange={(e: any) => setTableName(e.target.value)} placeholder={t('qrMenu.tableNamePlaceholder')} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createTable.isPending}>{t('qrMenu.add')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTableId}
        onOpenChange={(open: any) => { if (!open) setDeleteTableId(null); }}
        title={t('qrMenu.deleteTableTitle')}
        description={t('qrMenu.deleteTableDesc')}
        confirmLabel={t('qrMenu.deleteConfirm')}
        confirmVariant="destructive"
        onConfirm={handleDeleteTable}
        isPending={deleteTable.isPending}
      />

      <ConfirmDialog
        open={!!deleteSiteId}
        onOpenChange={(open: any) => { if (!open) setDeleteSiteId(null); }}
        title={t('qrMenu.deleteSiteTitle')}
        description={t('qrMenu.deleteSiteDesc')}
        confirmLabel={t('qrMenu.deleteConfirm')}
        confirmVariant="destructive"
        onConfirm={handleDeleteSite}
        isPending={deleteSite.isPending}
      />
    </AppLayout>
  );
}
