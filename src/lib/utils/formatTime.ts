export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString();
}
export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + "s";
  return Math.floor(s / 60) + "m " + (s % 60) + "s";
}
