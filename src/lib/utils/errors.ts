export class AppError extends Error {
  code: string;
  constructor(message: string, code = "UNKNOWN") { super(message); this.code = code; this.name = "AppError"; }
}
export function getErrorMessage(error: unknown, fallback = "Unknown error"): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (error == null) return fallback;
  const message = String(error);
  return message === "[object Object]" ? fallback : message;
}
export function isNotFoundError(error: unknown): boolean { return error instanceof AppError && error.code === "NOT_FOUND"; }

export function toastError(message: string, error?: unknown): void {
  console.error(message, error);
}
