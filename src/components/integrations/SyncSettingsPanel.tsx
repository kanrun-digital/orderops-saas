"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountSettings } from "@/hooks/useAccountSettings";
import { apiGet, apiPut, apiPost } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface SyncSettingsPanelProps {
  provider: string;
  title?: string;
  description?: string;
  className?: string;
}

type ProviderSettings = {
  autoSync: boolean;
  intervalMinutes: number;
  syncMenu: boolean;
  syncOrders: boolean;
  syncCatalog: boolean;
};

const defaultSettings: ProviderSettings = {
  autoSync: true,
  intervalMinutes: 15,
  syncMenu: true,
  syncOrders: true,
  syncCatalog: true,
};

export function SyncSettingsPanel({ provider, title, description, className }: SyncSettingsPanelProps) {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();
  const { data: account, settings, isLoading } = useAccountSettings();
  const providerSettingsFromAccount = useMemo(() => {
    const raw = settings?.[provider as keyof typeof settings] as Record<string, unknown> | undefined;
    return raw ?? {};
  }, [provider, settings]);

  const [form, setForm] = useState<ProviderSettings>(defaultSettings);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setForm({
      autoSync: Boolean(providerSettingsFromAccount.auto_sync ?? defaultSettings.autoSync),
      intervalMinutes: Number(providerSettingsFromAccount.sync_interval_minutes ?? defaultSettings.intervalMinutes),
      syncMenu: Boolean(providerSettingsFromAccount.sync_menu ?? defaultSettings.syncMenu),
      syncOrders: Boolean(providerSettingsFromAccount.sync_orders ?? defaultSettings.syncOrders),
      syncCatalog: Boolean(providerSettingsFromAccount.sync_catalog ?? defaultSettings.syncCatalog),
    });
  }, [providerSettingsFromAccount]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!accountId) throw new Error("Account is not ready yet.");
      const nextProviderSettings = {
        ...providerSettingsFromAccount,
        auto_sync: form.autoSync,
        sync_interval_minutes: form.intervalMinutes,
        sync_menu: form.syncMenu,
        sync_orders: form.syncOrders,
        sync_catalog: form.syncCatalog,
        updated_at: new Date().toISOString(),
      };

      const mergedSettings = {
        ...(settings ?? {}),
        [provider]: nextProviderSettings,
      };

      const accountRow = account as Record<string, unknown>;
      const accountPk = accountRow?.pk_id;
      if (!accountPk) throw new Error("Account record was not found.");

      await apiPut(`/api/data/accounts/${accountPk}`, {
        settings: JSON.stringify(mergedSettings),
      });

      const existing = await apiGet<{ data: any[] }>(`/api/data/integration_settings?account_id=${accountId}&provider=${provider}&_limit=1`);
      const payload = {
        id: existing.data?.[0]?.id ?? crypto.randomUUID(),
        account_id: accountId,
        provider,
        settings: JSON.stringify(nextProviderSettings),
      };

      if (existing.data?.[0]?.pk_id) {
        await apiPut(`/api/data/integration_settings/${existing.data[0].pk_id}`, payload);
      } else {
        await apiPost(`/api/data/integration_settings`, payload);
      }
    },
    onSuccess: () => {
      setStatus({ type: "success", message: "Sync settings saved." });
      queryClient.invalidateQueries({ queryKey: ["account-settings"] });
      queryClient.invalidateQueries({ queryKey: ["connection-list"] });
    },
    onError: (error: Error) => {
      setStatus({ type: "error", message: error.message || "Failed to save sync settings." });
    },
  });

  const setField = <K extends keyof ProviderSettings>(key: K, value: ProviderSettings[K]) => {
    setStatus(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Auto-sync</p>
            <p className="text-sm text-muted-foreground">Run synchronization automatically for this provider.</p>
          </div>
          <Switch checked={form.autoSync} onCheckedChange={(checked) => setField("autoSync", checked)} disabled={isLoading || mutation.isPending} />
        </div>

        <label className="grid gap-2 text-sm md:max-w-xs">
          <span className="font-medium">Sync interval, minutes</span>
          <Input
            type="number"
            min={5}
            step={5}
            value={form.intervalMinutes}
            onChange={(e) => setField("intervalMinutes", Number(e.target.value) || 5)}
            disabled={isLoading || mutation.isPending || !form.autoSync}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["syncMenu", "Menu sync", "Keep menu data aligned with provider."],
            ["syncOrders", "Order sync", "Pull operational order updates."],
            ["syncCatalog", "Catalog sync", "Refresh catalog entities and mappings."],
          ].map(([key, label, copy]) => (
            <div key={key} className="rounded-md border bg-muted/20 p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{copy}</p>
                </div>
                <Switch
                  checked={form[key as keyof ProviderSettings] as boolean}
                  onCheckedChange={(checked) => setField(key as keyof ProviderSettings, checked as never)}
                  disabled={isLoading || mutation.isPending}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Settings are loaded from account and provider configuration, then saved back through a mutation.</p>
        <Button type="button" onClick={() => mutation.mutate()} disabled={isLoading || mutation.isPending || !accountId}>
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save settings
        </Button>
      </div>

      {status ? (
        <div className={cn(
          "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
          status.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
        )}>
          {status.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{status.message}</span>
        </div>
      ) : null}
    </div>
  );
}

export default SyncSettingsPanel;
