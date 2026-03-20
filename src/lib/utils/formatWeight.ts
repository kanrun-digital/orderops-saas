export function formatWeight(grams: number): string {
  if (grams >= 1000) return (grams / 1000).toFixed(1) + " kg";
  return grams + " g";
}
