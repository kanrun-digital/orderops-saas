export function formatWeight(
  value: number | string | null | undefined,
  unit?: string | null,
): string {
  if (value === null || value === undefined || value === "") return "";

  const numericValue =
    typeof value === "number" ? value : Number(String(value).replace(",", "."));

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  if (!unit || unit === "g") {
    if (numericValue >= 1000) return `${(numericValue / 1000).toFixed(1)} kg`;
    return `${numericValue} g`;
  }

  if (unit === "kg") {
    return `${numericValue} kg`;
  }

  if (unit === "ml") {
    if (numericValue >= 1000) return `${(numericValue / 1000).toFixed(1)} l`;
    return `${numericValue} ml`;
  }

  if (unit === "l") {
    return `${numericValue} l`;
  }

  return `${numericValue} ${unit}`;
}
