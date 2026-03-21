export function isBulkEligible(order: { status: string }): boolean { return false; }
export function getBulkActions(orders: unknown[]): string[] { return []; }

export function getBulkEligibility(
  orders: any[],
  selectedIds: Set<string>,
): { eligibleForPOS: string[]; eligibleForCancel: string[] } {
  const selectedOrderIds = Array.from(selectedIds);

  return {
    eligibleForPOS: selectedOrderIds,
    eligibleForCancel: selectedOrderIds,
  };
}
