export interface AssignedOperator { id: string; name: string; role: string; }
export function getAssignedOperator(orderId: string): AssignedOperator | null { return null; }
export function formatOperatorName(op: AssignedOperator): string { return op.name; }
