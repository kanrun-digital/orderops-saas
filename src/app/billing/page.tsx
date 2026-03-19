"use client";

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccount } from '@/contexts/AccountContext';
import { useAccountSubscription } from '@/hooks/useAccountSubscription';
import { useIsSystemAdmin } from '@/hooks/useSystemAdmin';
import { AdminSubscriptionControls } from '@/components/billing/AdminSubscriptionControls';
import { PlanCardsSection } from '@/components/billing/PlanCardsSection';
import { CreditCard, Calendar, Mail, HelpCircle, ExternalLink } from 'lucide-react';

import { SUBSCRIPTION_STATUS_STYLES } from '@/lib/constants/statusStyles';
import { formatDateFns } from '@/lib/utils/formatDateTime';
import { getSupportContactEmail } from '@/lib/config/contactConfig';

const t = (key: string) => key;

export default function BillingPage() {
  const { currentAccount } = useAccount();
  const { data: subscription, isLoading } = useAccountSubscription(currentAccount?.id);
  const { data: isAdmin } = useIsSystemAdmin();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const isManualAdmin = isAdmin && subscription?.provider === 'manual';
  const supportEmail = getSupportContactEmail();

  const isStripeProvider = subscription?.provider === 'stripe';
  const hasStripeCustomer = !!subscription?.provider_customer_id;

  const handleManageBilling = async () => {
    if (!currentAccount?.id) return;
    setLoadingAction('portal');
    try {
      const res = await fetch('/api/functions/stripe-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          account_id: currentAccount.id,
          return_url: `${window.location.origin}/billing`,
        }),
      });
      if (!res.ok) throw new Error('Portal request failed');
      const json = await res.json();
      const url = json.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      console.error('Portal error:', err);
      toast.error(t('billing.portalError'));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSubscribe = async (planCode?: string) => {
    if (!currentAccount?.id) return;
    setLoadingAction('checkout');
    try {
      const res = await fetch('/api/functions/stripe-create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          account_id: currentAccount.id,
          plan: planCode ?? 'starter',
          billing_cycle: 'monthly',
          success_url: `${window.location.origin}/billing?success=true`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
        }),
      });
      if (!res.ok) throw new Error('Checkout request failed');
      const json = await res.json();
      const url = json.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(t('billing.checkoutError'));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title={t('billing.title')} subtitle={t('billing.subtitle')} />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !subscription ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{t('billing.noSubscription')}</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {t('billing.subscribeHint')}
              </p>
              <Button onClick={() => handleSubscribe()} disabled={loadingAction === 'checkout'}>
                {loadingAction === 'checkout' ? t('billing.redirecting') : t('billing.subscribe')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('billing.subscription')}
                </CardTitle>
                <CardDescription>{t('billing.currentPlan')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('billing.status')}</span>
                  <Badge variant="outline" className={SUBSCRIPTION_STATUS_STYLES[subscription.status] ?? ''}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('billing.plan')}</span>
                  <span className="font-medium capitalize">{subscription.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('billing.billingCycle')}</span>
                  <span className="font-medium capitalize">{subscription.billing_cycle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('billing.provider')}</span>
                  <span className="font-medium capitalize">{subscription.provider}</span>
                </div>

                <div className="pt-2">
                  {isStripeProvider && hasStripeCustomer ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManageBilling}
                      disabled={loadingAction === 'portal'}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {loadingAction === 'portal' ? t('billing.redirecting') : t('billing.manageBilling')}
                    </Button>
                  ) : subscription.provider === 'manual' ? null : (
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe()}
                      disabled={loadingAction === 'checkout'}
                    >
                      {loadingAction === 'checkout' ? t('billing.redirecting') : t('billing.upgradeToPaid')}
                    </Button>
                  )}
                </div>

                {isManualAdmin && (
                  <AdminSubscriptionControls subscription={subscription} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('billing.dates')}
                </CardTitle>
                <CardDescription>{t('billing.datesDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.paid_until && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('billing.paidUntil')}</span>
                    <span className="font-medium">
                      {formatDateFns(subscription.paid_until, 'd MMM yyyy', 'en')}
                    </span>
                  </div>
                )}
                {subscription.trial_ends_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('billing.trialEnds')}</span>
                    <span className="font-medium">
                      {formatDateFns(subscription.trial_ends_at, 'd MMM yyyy', 'en')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('billing.since')}</span>
                  <span className="font-medium">
                    {formatDateFns(subscription.created_at, 'd MMM yyyy', 'en')}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  {t('billing.needHelp')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {subscription.provider === 'manual'
                    ? t('billing.manualHelpText')
                    : t('billing.stripeHelpText')}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <a className="text-primary" href={`mailto:${supportEmail}`}>{supportEmail}</a>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/help">{t('billing.contactSupport')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <PlanCardsSection
            subscription={subscription}
            onStripeCheckout={handleSubscribe}
            checkoutLoading={loadingAction === 'checkout'}
          />
          </>
        )}
      </div>
    </AppLayout>
  );
}
