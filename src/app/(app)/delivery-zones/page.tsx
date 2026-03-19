"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Map, Search, Globe } from 'lucide-react';
import { ImportTab } from '@/components/delivery-zones/ImportTab';
import { MappingTab } from '@/components/delivery-zones/MappingTab';
import { TestRoutingTab } from '@/components/delivery-zones/TestRoutingTab';
import { PublishTab } from '@/components/delivery-zones/PublishTab';

const t = (key: string) => key;

export default function DeliveryZonesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('deliveryZones.title')}
          subtitle={t('deliveryZones.subtitle')}
        />

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{t('deliveryZones.tabs.import')}</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">{t('deliveryZones.tabs.mapping')}</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">{t('deliveryZones.tabs.testRouting')}</span>
            </TabsTrigger>
            <TabsTrigger value="publish" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{t('deliveryZones.tabs.publish')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <ImportTab />
          </TabsContent>
          <TabsContent value="mapping">
            <MappingTab />
          </TabsContent>
          <TabsContent value="test">
            <TestRoutingTab />
          </TabsContent>
          <TabsContent value="publish">
            <PublishTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
