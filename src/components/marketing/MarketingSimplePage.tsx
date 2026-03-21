"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingShell from "@/components/marketing/MarketingShell";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";

export function MarketingSimplePage({ pageKey }: { pageKey: "demo" | "contact" | "privacy" | "terms" }) {
  const { copy } = useLanguageSwitcher();
  const page = copy.pages[pageKey];

  return (
    <MarketingShell>
      <main className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">{page.eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{page.title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">{page.description}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {page.primaryCta ? (
            <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-slate-800">
              <Link href="/pilot">
                {page.primaryCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {copy.common.backHome}
            </Link>
          </Button>
        </div>

        {page.sections?.length ? (
          <div className="mt-12 grid gap-5">
            {page.sections.map((section) => (
              <section key={section.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>
        ) : null}
      </main>

      <MarketingFooter />
    </MarketingShell>
  );
}

export default MarketingSimplePage;
