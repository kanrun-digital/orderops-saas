export interface AssignedOperator {
  id: string;
  name: string;
  role: string;
}

export type ResolvedAssignedOperatorSource = 'internal' | 'crm' | 'none';

export type ResolvedAssignedOperator = {
  id: string | null;
  label: string;
  phone: string | null;
  source: ResolvedAssignedOperatorSource;
};

type CrmOperatorInfo = {
  id?: string;
  name?: string;
  phone?: string;
};

type ResolveAssignedOperatorParams = {
  processingOperatorId?: string | null;
  processingOperatorName?: string | null;
  crmOperatorInfo?: CrmOperatorInfo | null;
};

export function getAssignedOperator(orderId: string): AssignedOperator | null { return null; }
export function formatOperatorName(op: AssignedOperator): string { return op.name; }

export function resolveAssignedOperator(
  params: ResolveAssignedOperatorParams,
): ResolvedAssignedOperator {
  const processingOperatorName = params.processingOperatorName?.trim();
  if (params.processingOperatorId || processingOperatorName) {
    return {
      id: params.processingOperatorId ?? null,
      label: processingOperatorName || params.processingOperatorId || '—',
      phone: null,
      source: 'internal',
    };
  }

  const crmOperatorName = params.crmOperatorInfo?.name?.trim();
  if (params.crmOperatorInfo?.id || crmOperatorName || params.crmOperatorInfo?.phone) {
    return {
      id: params.crmOperatorInfo?.id ?? null,
      label: crmOperatorName || params.crmOperatorInfo?.phone || '—',
      phone: params.crmOperatorInfo?.phone ?? null,
      source: 'crm',
    };
  }

  return {
    id: null,
    label: '—',
    phone: null,
    source: 'none',
  };
}
