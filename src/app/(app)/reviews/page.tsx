"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewSettingsTab } from '@/components/reviews/ReviewSettingsTab';
import { ReviewReportsTab } from '@/components/reviews/ReviewReportsTab';
import { ReviewAnalyticsTab } from '@/components/reviews/ReviewAnalyticsTab';

const t = (key: string) => key;

export default function ReviewsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title={t('reviews.title')} subtitle={t('reviews.subtitle')} />
        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports">{t('reviews.tabs.reports')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('reviews.tabs.analytics')}</TabsTrigger>
            <TabsTrigger value="settings">{t('reviews.tabs.settings')}</TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="mt-4">
            <ReviewReportsTab />
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <ReviewAnalyticsTab />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <ReviewSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
