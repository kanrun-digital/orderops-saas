import { useLanguageContext } from "@/contexts/LanguageContext";

export function useLanguageSwitcher() {
  const context = useLanguageContext();

  return {
    currentLanguage: context.currentLanguage,
    changeLanguage: context.changeLanguage,
    languages: context.languages,
    copy: context.copy,
    t: (key: string) => key,
    isLoading: context.isLoading,
  };
}

export default useLanguageSwitcher;
