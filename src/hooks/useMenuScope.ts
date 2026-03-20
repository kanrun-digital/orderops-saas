export function useMenuScope() {
  return {
    scope: "all" as string,
    setScope: (scope: string) => {},
    provider: null as string | null,
    setProvider: (provider: string | null) => {},
  };
}
export default useMenuScope;
