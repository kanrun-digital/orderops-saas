export function isBulkEligible(order: { status: string }): boolean { return false; }
export function getBulkActions(orders: unknown[]): string[] { return []; }

export function getBulkEligibility(orders: any[], selectedIds: Set<string>): { canCancel: boolean; canConfirm: boolean; canAssign: boolean } {
  return { canCancel: selectedIds.size > 0, canConfirm: selectedIds.size > 0, canAssign: selectedIds.size > 0 };
}
