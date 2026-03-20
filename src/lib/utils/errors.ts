export class AppError extends Error {
  code: string;
  constructor(message: string, code = "UNKNOWN") { super(message); this.code = code; this.name = "AppError"; }
}
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
export function isNotFoundError(error: unknown): boolean { return error instanceof AppError && error.code === "NOT_FOUND"; }
