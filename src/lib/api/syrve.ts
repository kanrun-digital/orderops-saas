export async function fetchSyrveData(endpoint: string, params?: Record<string, unknown>) { return { data: null, error: null }; }
export async function syncSyrveMenu() { return { success: true }; }
export async function syncSyrveCustomers() { return { success: true }; }

type SyrveCreateOrderResponse = {
  orderInfo?: {
    errorInfo?: {
      description?: string;
      message?: string;
    };
    creationStatus?: string;
    order?: {
      id?: string;
    };
    id?: string;
  };
};

export const syrveApi = {
  getTerminalsAliveStatus: async (orgIds: string[], terminalIds: string[], accountId?: string) => ({ data: [] }),
  isShiftOpen: async (orgId: string, terminalId: string, id: string) => false,
  getOrganizations: async () => ({ data: [] }),
  createOrder: async (
    orderId: string,
    organizationId: string,
    terminalGroupId: string,
    options?: Record<string, unknown>,
  ): Promise<SyrveCreateOrderResponse> => ({
    orderInfo: {
      creationStatus: 'success',
      order: { id: orderId },
    },
  }),
};
