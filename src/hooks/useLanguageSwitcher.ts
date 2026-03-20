export function useLanguageSwitcher() {
  return {
    locale: "en" as string,
    setLocale: (locale: string) => {},
    locales: ["en", "ru", "uk"] as string[],
    t: (key: string) => key,
  };
}
export default useLanguageSwitcher;
