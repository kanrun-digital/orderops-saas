"use client";

import Link from "next/link";
import { getSupportContactEmail, contactConfig } from "@/lib/config/contactConfig";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";

export function MarketingFooter() {
  const supportEmail = getSupportContactEmail();
  const { copy } = useLanguageSwitcher();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-950">{copy.common.brandMark}</div>
            <div>
              <div className="font-semibold">{copy.common.brand}</div>
              <div className="text-sm text-slate-400">{copy.common.footerDescription}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.common.explore}</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a href="/#solution" className="text-slate-200 transition-colors hover:text-white">{copy.common.solution}</a>
            <a href="/#integrations" className="text-slate-200 transition-colors hover:text-white">{copy.common.integrations}</a>
            <a href="/#pricing" className="text-slate-200 transition-colors hover:text-white">{copy.common.pricing}</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.common.publicPages}</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/demo" className="text-slate-200 transition-colors hover:text-white">{copy.common.demo}</Link>
            <Link href="/pilot" className="text-slate-200 transition-colors hover:text-white">{copy.common.pilot}</Link>
            <Link href="/contact" className="text-slate-200 transition-colors hover:text-white">{copy.common.contact}</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.common.legal}</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link href="/privacy" className="text-slate-200 transition-colors hover:text-white">{copy.common.privacy}</Link>
            <Link href="/terms" className="text-slate-200 transition-colors hover:text-white">{copy.common.terms}</Link>
            <a href={`mailto:${supportEmail}`} className="text-slate-200 transition-colors hover:text-white">{supportEmail}</a>
            {contactConfig.supportPhone ? <a href={`tel:${contactConfig.supportPhone}`} className="text-slate-200 transition-colors hover:text-white">{contactConfig.supportPhone}</a> : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 {copy.common.brand}. {copy.common.rights}</p>
          <p>{copy.common.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;
