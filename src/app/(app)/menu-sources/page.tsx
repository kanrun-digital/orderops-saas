"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BitrixProductsDiffPanel } from '@/components/bitrix/BitrixProductsDiffPanel';
import { SourceProductEditPanel } from '@/components/menu/SourceProductEditPanel';
import { MenuSourceTab } from '@/components/menu/MenuSourceTab';
import { useProviderConnections } from '@/hooks/useCustomerDataOps';
import { useMenuProducts } from '@/hooks/useMenu';
import type { SourceProduct } from '@/components/menu/SourceProductsTable';
import { Database, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MENU_CAPABLE_PROVIDERS, PROVIDER_CODES, type MenuCapableProvider } from '@/lib/constants/integrations';
import { ROUTES } from '@/constants/routes';

const t = (key: string) => key;

const MENU_CAPABLE_PROVIDERS_SET = new Set<string>(MENU_CAPABLE_PROVIDERS);

export default function MenuSourcesPage() {
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SourceProduct | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const router = useRouter();

  const { data: connections = [], isLoading: connectionsLoading } = useProviderConnections();
  const { data: menuProducts = [] } = useMenuProducts();

  const menuConnections = useMemo(
    () => (connections as any[]).filter((c: any) => c.status === 'active' && MENU_CAPABLE_PROVIDERS_SET.has(c.provider_code)),
    [connections],
  );
  const [activeTab, setActiveTab] = useState<string>('');
  const effectiveTab = activeTab || (menuConnections[0] as any)?.id || '';
  const activeConnection = menuConnections.find((c: any) => c.id === effectiveTab);

  const canonicalProductLookup = useMemo(() => {
    const lookup = new Map<string, { id: string; name: string; image_url: string | null; description?: string; price: number }>();
    (menuProducts as any[]).forEach((p: any) => lookup.set(p.id, p));
    return lookup;
  }, [menuProducts]);

  const handleProductClick = (product: SourceProduct) => { setSelectedProduct(product); setShowEditPanel(true); };
  const getSelectedCanonicalProduct = () => {
    if (!selectedProduct?.canonicalProductId) return null;
    return canonicalProductLookup.get(selectedProduct.canonicalProductId) || null;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title={t('menuSources.title')} subtitle={t('menuSources.subtitle')} />

        {connectionsLoading ? (
          <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-48 w-full" /></div>
        ) : menuConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('menuSources.noSources')}</h2>
            <p className="text-muted-foreground mb-4 max-w-md">{t('menuSources.connectHint')}</p>
            <Button onClick={() => router.push(ROUTES.integrations)}>{t('menuSources.goToConnections')}</Button>
          </div>
        ) : (
          <Tabs value={effectiveTab} onValueChange={setActiveTab}>
            <TabsList>
              {menuConnections.map((conn: any) => (
                <TabsTrigger key={conn.id} value={conn.id} className="gap-2"><Database className="h-4 w-4" />{conn.name}</TabsTrigger>
              ))}
            </TabsList>
            {menuConnections.map((conn: any) => (
              <TabsContent key={conn.id} value={conn.id} className="space-y-4 mt-4">
                <MenuSourceTab connection={conn} onProductClick={handleProductClick} />
              </TabsContent>
            ))}
          </Tabs>
        )}

        <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('menuSources.compareTitle')}</DialogTitle>
              <DialogDescription>{t('menuSources.compareDesc')}</DialogDescription>
            </DialogHeader>
            <BitrixProductsDiffPanel />
          </DialogContent>
        </Dialog>

        <SourceProductEditPanel
          source={((activeConnection as any)?.provider_code ?? MENU_CAPABLE_PROVIDERS[0]) as MenuCapableProvider}
          sourceName={(activeConnection as any)?.name || ''}
          externalProduct={selectedProduct}
          canonicalProduct={getSelectedCanonicalProduct()}
          isOpen={showEditPanel}
          onClose={() => setShowEditPanel(false)}
          canPush={(activeConnection as any)?.provider_code !== PROVIDER_CODES.SYRVE}
          canPull={true}
        />
      </div>
    </AppLayout>
  );
}
