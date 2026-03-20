export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString();
}
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}
export function formatRelative(date: string | Date): string {
  return new Date(date).toLocaleString();
}
