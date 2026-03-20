export function maskPhone(phone: string): string { return phone.replace(/(.{3}).*(.{4})/, "$1****$2"); }
export function formatPhone(phone: string): string { return phone; }
export function isValidPhone(phone: string): boolean { return phone.length >= 10; }
