export interface User { id: string; email: string; name: string; role: string; }
export interface Account { id: string; name: string; slug: string; }
export interface Integration { id: string; provider: string; status: string; accountId: string; }
export interface SyncLog { id: string; type: string; status: string; startedAt: string; finishedAt?: string; error?: string; }
export interface Order { id: string; number: string; status: string; total: number; createdAt: string; }
export interface Customer { id: string; name: string; phone?: string; email?: string; }
export interface Product { id: string; name: string; price: number; categoryId?: string; }
export interface Category { id: string; name: string; parentId?: string; }
export type Locale = "en" | "ru" | "uk";
