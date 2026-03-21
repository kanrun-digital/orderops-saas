import { Circle, CircleCheckBig, CookingPot, PackageCheck, Truck, XCircle } from 'lucide-react';

export const orderConfig = {
  statuses: ["new", "confirmed", "preparing", "delivering", "completed", "cancelled"] as const,
  defaultPageSize: 20,
  maxExportSize: 5000,
};
export type OrderStatus = (typeof orderConfig.statuses)[number];

type StatusMeta = {
  label: string;
  badgeClass: string;
  icon: typeof Circle;
  iconClass: string;
  isCancellable: boolean;
};

export const statusMeta: Record<string, StatusMeta> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Circle,
    iconClass: "h-3.5 w-3.5",
    isCancellable: true,
  },
  new: {
    label: "New",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Circle,
    iconClass: "h-3.5 w-3.5",
    isCancellable: true,
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: CircleCheckBig,
    iconClass: "h-3.5 w-3.5",
    isCancellable: true,
  },
  preparing: {
    label: "Preparing",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: CookingPot,
    iconClass: "h-3.5 w-3.5",
    isCancellable: true,
  },
  delivering: {
    label: "Delivering",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Truck,
    iconClass: "h-3.5 w-3.5",
    isCancellable: false,
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    icon: PackageCheck,
    iconClass: "h-3.5 w-3.5",
    isCancellable: false,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    iconClass: "h-3.5 w-3.5",
    isCancellable: false,
  },
};

export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    syrve: "Syrve", salesbox: "SalesBox", bolt: "Bolt", glovo: "Glovo",
    wolt: "Wolt", manual: "Manual", website: "Website", qr: "QR Menu",
  };
  return labels[source] || source;
}
type SourceBadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function getSourceBadgeVariant(source: string): SourceBadgeVariant {
  const variants: Record<string, SourceBadgeVariant> = {
    syrve: "default", salesbox: "secondary", bolt: "outline",
    glovo: "outline", wolt: "outline", manual: "secondary",
  };
  return variants[source] || "default";
}
export const statusOptions = orderConfig.statuses.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
