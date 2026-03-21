"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, QrCode, Trash2, Plus, Globe } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

const t = (key: string) => key;

async function fetchSites(accountId: string) {
  const res = await fetch(
    `/api/data/public_sites?account_id=eq.${accountId}&order=created_at.desc`,
    { credentials: "include" }
  );
  if (!res.ok) throw new Error("Failed to fetch sites");
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

async function deleteSite(siteId: string) {
  const res = await fetch(`/api/data/public_sites?id=eq.${siteId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete site");
}

async function togglePublishSite(site: any) {
  const newStatus = site.status === "published" ? "draft" : "published";
  const res = await fetch(`/api/data/public_sites?id=eq.${site.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) throw new Error("Failed to update site status");
}

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  published: "default",
  draft: "secondary",
  disabled: "destructive",
};

export default function SitesPage() {
  const session = useAuthStore((s: any) => s.session);
  const accountId = session?.account?.id;

  const {
    data: sites = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["public_sites", accountId],
    queryFn: () => fetchSites(accountId),
    enabled: !!accountId,
  });

  const handleDelete = async (siteId: string) => {
    try {
      await deleteSite(siteId);
      toast.success(t("sites.deleted"));
      refetch();
    } catch {
      toast.error(t("sites.deleteFailed"));
    }
  };

  const handleTogglePublish = async (site: any) => {
    try {
      await togglePublishSite(site);
      toast.success(t("sites.statusUpdated"));
      refetch();
    } catch {
      toast.error(t("sites.updateFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("sites.title")}
        subtitle={t("sites.subtitle")}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("sites.addSite")}
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (sites as any[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t("sites.noSites")}</h3>
          <p className="text-muted-foreground mt-1">{t("sites.noSitesHint")}</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("sites.publicSites")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("sites.location")}</TableHead>
                  <TableHead>{t("sites.slug")}</TableHead>
                  <TableHead>{t("sites.status")}</TableHead>
                  <TableHead className="text-right">{t("sites.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sites as any[]).map((site: any) => {
                  const locName = site.restaurant_locations?.name ?? "—";
                  return (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{locName}</TableCell>
                      <TableCell className="font-mono text-sm">
                        /m/{site.public_slug}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[site.status] ?? "secondary"}>
                          {site.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(site)}
                        >
                          {site.status === "published"
                            ? t("sites.unpublish")
                            : t("sites.publish")}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={`/m/${site.public_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" title={t("sites.qrCode")}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(site.id)}
                          title={t("sites.delete")}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
