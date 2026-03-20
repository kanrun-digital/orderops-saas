export const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "text-green-700", bg: "bg-green-100", label: "Active" },
  inactive: { color: "text-gray-700", bg: "bg-gray-100", label: "Inactive" },
  pending: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Pending" },
  error: { color: "text-red-700", bg: "bg-red-100", label: "Error" },
  syncing: { color: "text-blue-700", bg: "bg-blue-100", label: "Syncing" },
};
export function getStatusStyle(status: string) { return statusStyles[status] || statusStyles.inactive; }

export const SUBSCRIPTION_STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  trialing: "bg-blue-100 text-blue-800",
  past_due: "bg-yellow-100 text-yellow-800",
  canceled: "bg-red-100 text-red-800",
  unpaid: "bg-red-100 text-red-800",
  incomplete: "bg-gray-100 text-gray-800",
};

