export const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: "text-green-700", bg: "bg-green-100", label: "Active" },
  inactive: { color: "text-gray-700", bg: "bg-gray-100", label: "Inactive" },
  pending: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Pending" },
  error: { color: "text-red-700", bg: "bg-red-100", label: "Error" },
  syncing: { color: "text-blue-700", bg: "bg-blue-100", label: "Syncing" },
};
export function getStatusStyle(status: string) { return statusStyles[status] || statusStyles.inactive; }
