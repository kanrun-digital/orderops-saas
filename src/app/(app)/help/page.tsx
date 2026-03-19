"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/app/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { ContactSupportDialog } from '@/components/support/ContactSupportDialog';

const t = (key: string) => key;

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="space-y-10">
        <header>
          <PageHeader
            title={t('help.title')}
            subtitle={t('help.intro')}
            actions={
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{t('help.audience.user')}</Badge>
                <Badge variant="secondary">{t('help.audience.developer')}</Badge>
                <Badge variant="secondary">{t('help.audience.admin')}</Badge>
              </div>
            }
          />
        </header>

        <section className="space-y-4" id="help-hub">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t('help.hub.title')}</h2>
            <p className="text-muted-foreground">{t('help.hub.subtitle')}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle>{t('help.hub.userTitle')}</CardTitle><CardDescription>{t('help.hub.userDesc')}</CardDescription></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>{t('help.hub.userHint')}</p><Badge variant="outline">{t('help.audience.user')}</Badge></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.hub.devTitle')}</CardTitle><CardDescription>{t('help.hub.devDesc')}</CardDescription></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>{t('help.hub.devHint')}</p><Badge variant="outline">{t('help.audience.developer')}</Badge></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.hub.adminTitle')}</CardTitle><CardDescription>{t('help.hub.adminDesc')}</CardDescription></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>{t('help.hub.adminHint')}</p><Badge variant="outline">{t('help.audience.admin')}</Badge></CardContent></Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>{t('help.faq.title')}</CardTitle><CardDescription>{t('help.faq.subtitle')}</CardDescription></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-4">
                  <li>{t('help.faq.q1')}</li><li>{t('help.faq.q2')}</li><li>{t('help.faq.q3')}</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t('help.support.title')}</CardTitle><CardDescription>{t('help.support.subtitle')}</CardDescription></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{t('help.support.email')}</p>
                <p>{t('help.support.hours')}</p>
                <p>{t('help.support.sla')}</p>
                <div className="pt-2"><ContactSupportDialog /></div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section className="space-y-6" id="integrations">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t('help.integrations.title')}</h2>
            <p className="text-muted-foreground">{t('help.integrations.subtitle')}</p>
          </div>

          <Card>
            <CardHeader><CardTitle>{t('help.integrations.catalogTitle')}</CardTitle><CardDescription>{t('help.integrations.catalogDesc')}</CardDescription></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="platforms"><AccordionTrigger>{t('help.integrations.deliveryPlatforms')}</AccordionTrigger><AccordionContent className="space-y-2 text-sm text-muted-foreground"><p>{t('help.integrations.deliveryPurpose')}</p><p>{t('help.integrations.deliveryAccess')}</p><p>{t('help.integrations.deliveryFields')}</p><p>{t('help.integrations.deliveryFeatures')}</p></AccordionContent></AccordionItem>
                <AccordionItem value="bolt"><AccordionTrigger>{t('help.integrations.boltTitle')}</AccordionTrigger><AccordionContent className="space-y-2 text-sm text-muted-foreground"><p>{t('help.integrations.boltPurpose')}</p><p>{t('help.integrations.boltAccess')}</p><p>{t('help.integrations.boltFields')}</p><p>{t('help.integrations.boltFeatures')}</p></AccordionContent></AccordionItem>
                <AccordionItem value="salesbox"><AccordionTrigger>{t('help.integrations.salesboxTitle')}</AccordionTrigger><AccordionContent className="space-y-2 text-sm text-muted-foreground"><p>{t('help.integrations.salesboxPurpose')}</p><p>{t('help.integrations.salesboxAccess')}</p><p>{t('help.integrations.salesboxFields')}</p><p>{t('help.integrations.salesboxFeatures')}</p></AccordionContent></AccordionItem>
                <AccordionItem value="syrve"><AccordionTrigger>{t('help.integrations.syrveTitle')}</AccordionTrigger><AccordionContent className="space-y-2 text-sm text-muted-foreground"><p>{t('help.integrations.syrvePurpose')}</p><p>{t('help.integrations.syrveAccess')}</p><p>{t('help.integrations.syrveFields')}</p><p>{t('help.integrations.syrveFeatures')}</p></AccordionContent></AccordionItem>
                <AccordionItem value="bitrix"><AccordionTrigger>{t('help.integrations.bitrixTitle')}</AccordionTrigger><AccordionContent className="space-y-2 text-sm text-muted-foreground"><p>{t('help.integrations.bitrixPurpose')}</p><p>{t('help.integrations.bitrixAccess')}</p><p>{t('help.integrations.bitrixFields')}</p><p>{t('help.integrations.bitrixFeatures')}</p></AccordionContent></AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="space-y-6" id="user-guide">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t('help.userGuide.title')}</h2>
            <p className="text-muted-foreground">{t('help.userGuide.subtitle')}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>{t('help.userGuide.quickStart')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.userGuide.qs1')}</li><li>{t('help.userGuide.qs2')}</li><li>{t('help.userGuide.qs3')}</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.userGuide.menuManagement')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.userGuide.mm1')}</li><li>{t('help.userGuide.mm2')}</li><li>{t('help.userGuide.mm3')}</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.userGuide.orderManagement')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.userGuide.om1')}</li><li>{t('help.userGuide.om2')}</li><li>{t('help.userGuide.om3')}</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.userGuide.integrationManagement')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.userGuide.im1')}</li><li>{t('help.userGuide.im2')}</li><li>{t('help.userGuide.im3')}</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.userGuide.errorsAndSupport')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.userGuide.es1')}</li><li>{t('help.userGuide.es2')}</li></ul></CardContent></Card>
          </div>
        </section>

        <Separator />

        <section className="space-y-6" id="best-practices">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t('help.bestPractices.title')}</h2>
            <p className="text-muted-foreground">{t('help.bestPractices.subtitle')}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>{t('help.bestPractices.commonErrors')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.bestPractices.ce1')}</li><li>{t('help.bestPractices.ce2')}</li><li>{t('help.bestPractices.ce3')}</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.bestPractices.stableSync')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.bestPractices.ss1')}</li><li>{t('help.bestPractices.ss2')}</li><li>{t('help.bestPractices.ss3')}</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.bestPractices.performance')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.bestPractices.pf1')}</li><li>{t('help.bestPractices.pf2')}</li><li>{t('help.bestPractices.pf3')}</li></ul></CardContent></Card>
            <Card><CardHeader><CardTitle>{t('help.bestPractices.dataMapping')}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.bestPractices.dm1')}</li><li>{t('help.bestPractices.dm2')}</li></ul></CardContent></Card>
          </div>
        </section>

        <Separator />

        <section className="space-y-4" id="extras">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{t('help.extras.title')}</h2>
            <p className="text-muted-foreground">{t('help.extras.subtitle')}</p>
          </div>
          <Card><CardHeader><CardTitle>{t('help.extras.faqGlossary')}</CardTitle><CardDescription>{t('help.extras.faqGlossaryDesc')}</CardDescription></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.extras.fg1')}</li><li>{t('help.extras.fg2')}</li><li>{t('help.extras.fg3')}</li></ul></CardContent></Card>
          <Card><CardHeader><CardTitle>{t('help.extras.navigation')}</CardTitle><CardDescription>{t('help.extras.navigationDesc')}</CardDescription></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><ul className="list-disc space-y-1 pl-4"><li>{t('help.extras.nav1')}</li><li>{t('help.extras.nav2')}</li><li>{t('help.extras.nav3')}</li><li>{t('help.extras.nav4')}</li><li>{t('help.extras.nav5')}</li></ul></CardContent></Card>
        </section>
      </div>
    </AppLayout>
  );
}
