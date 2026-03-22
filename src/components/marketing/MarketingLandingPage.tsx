"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  DatabaseZap,
  Globe,
  Lock,
  Orbit,
  QrCode,
  RefreshCcw,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingShell from "@/components/marketing/MarketingShell";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";
import { ROUTES } from "@/constants/routes";

const capabilityIcons = [Orbit, RefreshCcw, BarChart3, BadgeCheck, Users, Route, ShieldCheck, QrCode];
const securityIcons = [Lock, ShieldCheck, DatabaseZap, Globe];

function formatPrice(value: number | null, locale: "en" | "uk", customLabel: string, suffix: string) {
  if (value == null) return customLabel;

  return (
    new Intl.NumberFormat(locale === "uk" ? "uk-UA" : "en-US", {
      style: "currency",
      currency: "UAH",
      maximumFractionDigits: 0,
    }).format(value) + suffix
  );
}

export function MarketingLandingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const { copy, currentLanguage } = useLanguageSwitcher();
  const landing = copy.landing;

  const displayedPlans = useMemo(
    () =>
      landing.pricing.plans.map((plan) => ({
        ...plan,
        computedPrice:
          "priceCustom" in plan ? null : billing === "monthly" ? plan.priceMonthly : plan.priceAnnual,
      })),
    [billing, landing.pricing.plans]
  );

  return (
    <MarketingShell accent="strong">
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-24">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm shadow-sky-100">
                <Sparkles className="h-4 w-4 text-sky-600" />
                {landing.badge}
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">{landing.title}</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">{landing.subtitle}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-slate-950 px-7 text-white hover:bg-slate-800">
                  <Link href={ROUTES.pilot}>
                    {landing.primaryCta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-slate-300 bg-white/80 px-7">
                  <Link href={ROUTES.demo}>{landing.secondaryCta}</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {landing.highlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm shadow-slate-200/70">
                    <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950 p-5 text-white">
                    <p className="text-sm text-slate-300">{landing.heroStats.stateLabel}</p>
                    <p className="mt-3 text-3xl font-semibold">{landing.heroStats.stateValue}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{landing.heroStats.stateText}</p>
                  </div>
                  <div className="rounded-3xl bg-amber-100 p-5 text-slate-900">
                    <p className="text-sm text-slate-700">{landing.heroStats.channelsLabel}</p>
                    <p className="mt-3 text-3xl font-semibold">{landing.heroStats.channelsValue}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{landing.heroStats.channelsText}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{landing.heroStats.activityLabel}</p>
                        <p className="mt-1 text-xl font-semibold text-slate-950">{landing.heroStats.activityTitle}</p>
                      </div>
                      <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {landing.heroStats.activitySync}
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {landing.reliability.events.map((event) => (
                        <div key={event} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                          <span className="text-sm text-slate-700">{event}</span>
                          <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{landing.heroStats.eventLabel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="solution" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">{landing.solution.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{landing.solution.title}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">{landing.solution.subtitle}</p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {landing.solution.cards.map((item) => (
              <Card key={item.pain} className="rounded-[1.75rem] border-slate-200 bg-white/85 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">{landing.solution.painLabel}</div>
                  <CardTitle className="text-xl leading-8 text-slate-950">{item.pain}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-900">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">{landing.solution.reliefLabel}</div>
                    {item.relief}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/80">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">{landing.capabilities.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{landing.capabilities.title}</h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {landing.capabilities.items.map((item, index) => {
                const Icon = capabilityIcons[index] || Orbit;
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">{landing.how.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{landing.how.title}</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">{landing.how.subtitle}</p>
            </div>
            <div className="grid gap-4">
              {landing.how.steps.map((step) => (
                <div key={step.number} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-900">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">{landing.security.eyebrow}</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{landing.security.title}</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {landing.security.items.map((item, index) => {
                  const Icon = securityIcons[index] || ShieldCheck;
                  return (
                    <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="integrations" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="rounded-[1.75rem] border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-950">{landing.integrations.availableNow}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {landing.integrations.now.map((item) => (
                  <span key={item} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{item}</span>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-slate-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-950">{landing.integrations.nextRoadmap}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {landing.integrations.next.map((item) => (
                  <span key={item} className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">{item}</span>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="reliability" className="border-y border-slate-200 bg-slate-50/90">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">{landing.reliability.eyebrow}</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{landing.reliability.title}</h2>
                <div className="mt-6 space-y-4">
                  {landing.reliability.bullets.map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                      <p className="text-sm leading-7 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  {landing.reliability.statuses.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">{item.label}</div>
                      <div className="mt-2 text-xl font-semibold text-slate-950">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{landing.reliability.statusLabel}</p>
                    <div className="mt-4 space-y-3">
                      {landing.reliability.events.map((event) => (
                        <div key={event} className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">{event}</div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{landing.reliability.alertsLabel}</p>
                    <div className="mt-4 space-y-3">
                      {landing.reliability.alerts.map((alert) => (
                        <div key={alert} className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">{alert}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {landing.socialProof.map((item) => (
              <div key={item.name} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-lg leading-8 text-slate-700">"{item.quote}"</p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{item.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">{landing.pricing.eyebrow}</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{landing.pricing.title}</h2>
                <p className="mt-4 text-lg leading-8 text-slate-300">{landing.pricing.subtitle}</p>
              </div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                <button type="button" onClick={() => setBilling("monthly")} className={`rounded-full px-4 py-2 text-sm ${billing === "monthly" ? "bg-white text-slate-950" : "text-slate-300"}`}>
                  {landing.pricing.monthly}
                </button>
                <button type="button" onClick={() => setBilling("annual")} className={`rounded-full px-4 py-2 text-sm ${billing === "annual" ? "bg-white text-slate-950" : "text-slate-300"}`}>
                  {landing.pricing.annual}
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {displayedPlans.map((plan) => (
                <div key={plan.code} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <h3 className="text-2xl font-semibold">{plan.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{plan.description}</p>
                  <div className="mt-8 text-3xl font-semibold">
                    {formatPrice(
                      plan.computedPrice,
                      currentLanguage,
                      landing.pricing.custom,
                      billing === "annual" ? landing.pricing.perYear : landing.pricing.perMonth
                    )}
                  </div>
                  <div className="mt-6 space-y-3">
                    {plan.highlights.map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <Button asChild className="mt-8 w-full rounded-full bg-white text-slate-950 hover:bg-slate-200">
                    <Link href={ROUTES.pilot}>{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">{landing.faq.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{landing.faq.title}</h2>
          </div>

          <div className="mt-10 space-y-4">
            {landing.faq.items.map((item) => (
              <details key={item.question} className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950">{item.question}</summary>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#0f766e_100%)] px-8 py-10 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.65)] lg:px-12 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">{landing.finalCta.eyebrow}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">{landing.finalCta.title}</h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{landing.finalCta.subtitle}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-slate-200">
                  <Link href={ROUTES.pilot}>{landing.finalCta.primary}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10">
                  <Link href={ROUTES.contact}>{landing.finalCta.secondary}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </MarketingShell>
  );
}

export default MarketingLandingPage;
