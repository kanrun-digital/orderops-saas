export function useLanguageSwitcher() {
  return {
    currentLanguage: "en" as string,
    changeLanguage: (lang: string) => {},
    languages: ["en", "ru", "uk"] as string[],
    t: (key: string) => key,
    isLoading: false,
  };
}
export default useLanguageSwitcher;
