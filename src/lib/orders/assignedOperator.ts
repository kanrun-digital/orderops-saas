export interface AssignedOperator { id: string; name: string; role: string; }
export function getAssignedOperator(orderId: string): AssignedOperator | null { return null; }
export function formatOperatorName(op: AssignedOperator): string { return op.name; }

export function resolveAssignedOperator(params: { assignedUserId?: string | null; operators?: any[] }): any | null {
  if (!params.assignedUserId || !params.operators) return null;
  return params.operators.find((op: any) => op.id === params.assignedUserId) || null;
}
