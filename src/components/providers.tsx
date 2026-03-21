"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { MarketingLocale } from "@/components/marketing/content";

export function Providers({ children, initialLocale }: { children: React.ReactNode; initialLocale: MarketingLocale }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider initialLocale={initialLocale}>
        {children}
        <Toaster position="top-right" richColors />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
