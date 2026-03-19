"use client";

import { IntegrationPanel } from "@/components/integrations/IntegrationPanel";
import { ConnectionWizard } from "@/components/integrations/ConnectionWizard";
import { AddConnectionDialog } from "@/components/integrations/AddConnectionDialog";
import { SyncSettingsPanel } from "@/components/integrations/SyncSettingsPanel";
import { SyncSchedulePanel } from "@/components/integrations/SyncSchedulePanel";
import { CollapsibleSection } from "@/components/integrations/CollapsibleSection";
import { useConnectionList, type ConnectionListItem } from "@/hooks/useConnectionList";
import {
  useSyrveCredentials,
  useSyrveOrganizations,
  useSyrveTerminalGroups,
} from "@/hooks/useSyrve";
import { PROVIDER_CODES, type MenuCapableProvider } from "@/lib/constants/integrations";
import { useAccountSettings } from "@/hooks/useAccountSettings";
import { useIntegrationMenuStats } from "@/hooks/useIntegrationMenuStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/app/PageHeader";
import { Database, Store, Globe, Truck, type LucideIcon } from "lucide-react";
import { formatRelativeShort } from "@/lib/utils/formatTime";

const t = (key: string) => key;

/* ───────────────── Icon mapping ───────────────── */

const PROVIDER_ICONS: Record<string, LucideIcon> = {
  [PROVIDER_CODES.SYRVE]: Database,
  [PROVIDER_CODES.SALESBOX]: Store,
  [PROVIDER_CODES.BITRIX_SITE]: Globe,
  [PROVIDER_CODES.BOLT_FOOD]: Truck,
  [PROVIDER_CODES.GLOVO]: Truck,
};

function getProviderIcon(code: string): LucideIcon {
  return PROVIDER_ICONS[code] ?? Globe;
}

/* ───────────────── Per-connection panel with summary ───────────────── */

function ConnectionPanel({
  conn,
  mapStatus,
  isPosConnected,
}: {
  conn: ConnectionListItem;
  mapStatus: (c: ConnectionListItem) => any;
  isPosConnected: boolean;
}) {
  const isSalesboxOrBitrix =
    conn.providerCode === PROVIDER_CODES.SALESBOX ||
    conn.providerCode === PROVIDER_CODES.BITRIX_SITE;
  const statsProvider = isSalesboxOrBitrix
    ? (conn.providerCode as MenuCapableProvider)
    : undefined;
  const { data: menuStats } = useIntegrationMenuStats(
    statsProvider ?? PROVIDER_CODES.SALESBOX,
    !!statsProvider
  );
  const { data: orgs = [] } = useSyrveOrganizations();
  const selectedOrgIds = orgs.filter((o: any) => o.is_selected).map((o: any) => o.id);
  const { data: terminalGroups = [] } = useSyrveTerminalGroups(
    selectedOrgIds.length > 0 ? selectedOrgIds : undefined
  );
  const { data: accountSettings } = useAccountSettings();

  const isSyrve = conn.providerCode === PROVIDER_CODES.SYRVE;
  const typeBadge = isSyrve ? "POS" : isSalesboxOrBitrix ? "Channel" : null;

  let summary: string | null = null;

  if (statsProvider && menuStats) {
    const parts: string[] = [];
    if ((menuStats as any).totalProducts > 0)
      parts.push(`${(menuStats as any).totalProducts} products`);
    if ((menuStats as any).totalCategories > 0)
      parts.push(`${(menuStats as any).totalCategories} categories`);
    if (conn.lastSyncAt) parts.push(`Last sync: ${formatRelativeShort(conn.lastSyncAt)}`);
    summary = parts.join(" · ") || null;
  } else if (isSyrve) {
    const parts: string[] = [];
    const selectedCount = selectedOrgIds.length;
    if (selectedCount > 0)
      parts.push(`${selectedCount} org${selectedCount > 1 ? "s" : ""}`);
    if ((terminalGroups as any[]).length > 0)
      parts.push(
        `${(terminalGroups as any[]).length} terminal${(terminalGroups as any[]).length > 1 ? "s" : ""}`
      );
    const syrveSettings = (accountSettings as any)?.syrve as
      | Record<string, unknown>
      | undefined;
    const menuMode = syrveSettings?.menu_mode;
    if (menuMode === "shared") parts.push("Shared menu");
    else if (menuMode === "per_organization") parts.push("Per-org menu");
    if (conn.lastSyncAt) parts.push(`Last sync: ${formatRelativeShort(conn.lastSyncAt)}`);
    summary = parts.join(" · ") || null;
  }

  if (conn.status === "error" || conn.lastAuthError) {
    summary = `Needs attention${conn.lastAuthError ? ` · ${conn.lastAuthError}` : ""}`;
  }

  return (
    <IntegrationPanel
      key={conn.connectionId}
      provider={`${conn.providerCode}-${conn.connectionId}`}
      icon={getProviderIcon(conn.providerCode)}
      name={conn.connectionName}
      status={mapStatus(conn)}
      lastSyncAt={conn.lastSyncAt}
      metric={summary}
      typeBadge={typeBadge}
    >
      <ConnectionWizard
        connectionId={conn.connectionId}
        providerCode={conn.providerCode}
        isPosConnected={isPosConnected}
      />
      {isSyrve && <SyrveExtras />}
    </IntegrationPanel>
  );
}

/* ───────────────── Syrve-specific extras ───────────────── */

function SyrveExtras() {
  const { data: creds } = useSyrveCredentials();
  const { data: orgs = [] } = useSyrveOrganizations();
  const isSyrveConnected = !!(creds as any)?.is_active;
  const firstSelectedOrgId = (orgs as any[]).find((o: any) => o.is_selected)?.id;

  if (!isSyrveConnected) return null;

  return (
    <>
      <Separator />
      <CollapsibleSection title={t("integrationsPage.syncSchedule")}>
        <SyncSchedulePanel
          provider={PROVIDER_CODES.SYRVE}
          selectedOrganizationId={firstSelectedOrgId}
        />
      </CollapsibleSection>
      <Separator />
      <CollapsibleSection title={t("integrationsPage.syncSettings")}>
        <SyncSettingsPanel
          provider={PROVIDER_CODES.SYRVE}
          title={t("integrationsPage.syncSettings")}
          description={t("integrationsPage.syncSettingsDesc")}
        />
      </CollapsibleSection>
    </>
  );
}

/* ───────────────── Section renderer ───────────────── */

interface SectionProps {
  title: string;
  connections: ConnectionListItem[];
  mapStatus: (item: ConnectionListItem) => any;
  isPosConnected: boolean;
}

function IntegrationSection({
  title,
  connections,
  mapStatus,
  isPosConnected,
}: SectionProps) {
  if (connections.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-muted-foreground">
        {title}
      </h2>
      {connections.map((conn) => (
        <ConnectionPanel
          key={conn.connectionId}
          conn={conn}
          mapStatus={mapStatus}
          isPosConnected={isPosConnected}
        />
      ))}
    </section>
  );
}

/* ───────────────── Main page ───────────────── */

export default function IntegrationsPage() {
  const {
    posSections,
    catalogSections,
    deliverySections,
    isLoading,
    mapToIntegrationStatus,
  } = useConnectionList();

  const isPosConnected = posSections.some((c: any) => {
    const status = mapToIntegrationStatus(c);
    return status === "connected" || status === "syncing";
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("integrationsPage.title")}
        subtitle={t("integrationsPage.subtitle")}
        actions={<AddConnectionDialog />}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <IntegrationSection
            title={t("integrationsPage.posSystem")}
            connections={posSections}
            mapStatus={mapToIntegrationStatus}
            isPosConnected={isPosConnected}
          />

          <IntegrationSection
            title={t("integrationsPage.catalogPlatforms")}
            connections={catalogSections}
            mapStatus={mapToIntegrationStatus}
            isPosConnected={isPosConnected}
          />

          <IntegrationSection
            title={t("integrationsPage.deliveryPlatforms")}
            connections={deliverySections}
            mapStatus={mapToIntegrationStatus}
            isPosConnected={isPosConnected}
          />

          {posSections.length === 0 &&
            catalogSections.length === 0 &&
            deliverySections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  {t("integrationsPage.noIntegrations")}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {t("integrationsPage.noIntegrationsHint")}
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}
