export type JsonSettingsValue = Record<string, unknown>;

export function parseJsonSettings(value: string | JsonSettingsValue | null | undefined): JsonSettingsValue {
  if (!value) return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as JsonSettingsValue)
      : {};
  } catch {
    return {};
  }
}

export function serializeJsonSettings(value: JsonSettingsValue | null | undefined): string {
  return JSON.stringify(value ?? {});
}
