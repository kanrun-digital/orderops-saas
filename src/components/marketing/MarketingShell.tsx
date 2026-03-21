"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketingNavHrefs } from "@/components/marketing/content";
import { cn } from "@/lib/utils";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";

function HeaderLink({ href, label, isHome, onClick }: { href: string; label: string; isHome: boolean; onClick?: () => void }) {
  if (isHome) {
    return <a href={href} onClick={onClick} className="text-sm text-slate-600 transition-colors hover:text-slate-950">{label}</a>;
  }

  return <Link href={`/${href}`} onClick={onClick} className="text-sm text-slate-600 transition-colors hover:text-slate-950">{label}</Link>;
}

export function MarketingShell({ children, accent = "light" }: { children: React.ReactNode; accent?: "light" | "strong" }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentLanguage, changeLanguage, copy } = useLanguageSwitcher();
  const navLabels = [
    copy.common.solution,
    copy.common.howItWorks,
    copy.common.integrations,
    copy.common.reliability,
    copy.common.pricing,
    copy.common.faq,
  ];

  return (
    <div className={cn("min-h-screen", accent === "strong"
      ? "bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(180deg,#fffdf8_0%,#f8fafc_52%,#ffffff_100%)]"
      : "bg-[linear-gradient(180deg,#fffdf8_0%,#f8fafc_40%,#ffffff_100%)]")}>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15">{copy.common.brandMark}</div>
            <div>
              <div className="font-semibold tracking-tight text-slate-950">{copy.common.brand}</div>
              <div className="text-xs text-slate-500">{copy.common.tagline}</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {marketingNavHrefs.map((href, index) => (
              <HeaderLink key={href} href={href} label={navLabels[index]} isHome={isHome} />
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm">
              <button type="button" onClick={() => changeLanguage("en")} className={`rounded-full px-3 py-1 ${currentLanguage === "en" ? "bg-slate-950 text-white" : "text-slate-600"}`}>{copy.common.english}</button>
              <button type="button" onClick={() => changeLanguage("uk")} className={`rounded-full px-3 py-1 ${currentLanguage === "uk" ? "bg-slate-950 text-white" : "text-slate-600"}`}>{copy.common.ukrainian}</button>
            </div>
            <Button asChild variant="ghost" className="rounded-full"><Link href="/login">{copy.common.login}</Link></Button>
            <Button asChild className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800"><Link href="/pilot">{copy.common.requestPilot}</Link></Button>
          </div>

          <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden" aria-label="Toggle navigation" aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5">
              <div className="inline-flex w-fit rounded-full border border-slate-200 bg-white p-1 text-sm">
                <button type="button" onClick={() => changeLanguage("en")} className={`rounded-full px-3 py-1 ${currentLanguage === "en" ? "bg-slate-950 text-white" : "text-slate-600"}`}>{copy.common.english}</button>
                <button type="button" onClick={() => changeLanguage("uk")} className={`rounded-full px-3 py-1 ${currentLanguage === "uk" ? "bg-slate-950 text-white" : "text-slate-600"}`}>{copy.common.ukrainian}</button>
              </div>
              {marketingNavHrefs.map((href, index) => (
                <HeaderLink key={href} href={href} label={navLabels[index]} isHome={isHome} onClick={() => setMenuOpen(false)} />
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <Button asChild variant="outline" className="rounded-full"><Link href="/login" onClick={() => setMenuOpen(false)}>{copy.common.login}</Link></Button>
                <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-slate-800"><Link href="/pilot" onClick={() => setMenuOpen(false)}>{copy.common.requestPilot}</Link></Button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {children}
    </div>
  );
}

export default MarketingShell;
