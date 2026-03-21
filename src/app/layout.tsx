import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";
import type { MarketingLocale } from "@/components/marketing/content";

export const metadata: Metadata = {
  title: "OrderOps",
  description: "Restaurant & delivery operations platform",
};

function resolveInitialLocale(cookieLocale?: string | null, acceptLanguage?: string | null): MarketingLocale {
  if (cookieLocale === "uk" || cookieLocale === "en") {
    return cookieLocale;
  }

  const normalized = (acceptLanguage || "").toLowerCase();
  return normalized.includes("uk") ? "uk" : "en";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const initialLocale = resolveInitialLocale(
    cookieStore.get("orderops_locale")?.value,
    headerStore.get("accept-language")
  );

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
