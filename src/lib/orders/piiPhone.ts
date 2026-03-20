export function maskPhone(phone: string): string { return phone.replace(/(.{3}).*(.{4})/, "$1****$2"); }
export function formatPhone(phone: string): string { return phone; }
export function isValidPhone(phone: string): boolean { return phone.length >= 10; }

export function getPhoneByPiiPolicy(canView: boolean, phone?: string | null, maskedPhone?: string | null): string {
  if (canView) return phone || "—";
  return maskedPhone || maskPhoneForDisplay(phone);
}

export function maskPhoneForDisplay(phone?: string | null): string {
  if (!phone) return "—";
  if (phone.length <= 4) return "****";
  return phone.slice(0, 2) + "****" + phone.slice(-2);
}
