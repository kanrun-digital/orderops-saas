export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString();
}
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}
export function formatRelative(date: string | Date): string {
  return new Date(date).toLocaleString();
}
export function formatDateFns(date: string | Date, formatStr?: string, locale?: string): string {
  return new Date(date).toLocaleDateString();
}


export function formatDistanceToNowLocalized(date: string | Date, locale?: string): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return diff + "s";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  return Math.floor(diff / 86400) + "d";
}
