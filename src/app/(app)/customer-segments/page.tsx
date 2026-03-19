"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { SegmentDashboard } from '@/components/customers/SegmentDashboard';

const t = (key: string) => key;

export default function CustomerSegments() {
  return (
    <AppLayout>
      <PageHeader
        title={t('customers.segments.title')}
        subtitle={t('customers.segments.subtitle')}
      />
      <SegmentDashboard />
    </AppLayout>
  );
}
