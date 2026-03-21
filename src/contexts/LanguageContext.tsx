"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MARKETING_LOCALES, marketingCopy, type MarketingLocale } from "@/components/marketing/content";

const STORAGE_KEY = "orderops_locale";
const COOKIE_NAME = "orderops_locale";

function isMarketingLocale(value: string | undefined | null): value is MarketingLocale {
  return value === "en" || value === "uk";
}

type LanguageContextValue = {
  currentLanguage: MarketingLocale;
  changeLanguage: (lang: MarketingLocale) => void;
  languages: readonly MarketingLocale[];
  copy: (typeof marketingCopy)[MarketingLocale];
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: MarketingLocale;
}) {
  const [currentLanguage, setCurrentLanguage] = useState<MarketingLocale>(initialLocale);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (isMarketingLocale(stored) && stored !== currentLanguage) {
      setCurrentLanguage(stored);
      return;
    }

    if (!stored && typeof navigator !== "undefined") {
      const preferred = navigator.language?.toLowerCase().startsWith("uk") ? "uk" : currentLanguage;
      if (isMarketingLocale(preferred) && preferred !== currentLanguage) {
        setCurrentLanguage(preferred);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, currentLanguage);
      document.cookie = `${COOKIE_NAME}=${currentLanguage}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      currentLanguage,
      changeLanguage: setCurrentLanguage,
      languages: MARKETING_LOCALES,
      copy: marketingCopy[currentLanguage],
      isLoading: false,
    }),
    [currentLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider");
  }
  return context;
}

export default LanguageContext;
