export function getSetting<T>(key: string, fallback: T): T { return fallback; }
export function setSetting(key: string, value: unknown): void {}
export function getSettings(): Record<string, unknown> { return {}; }
