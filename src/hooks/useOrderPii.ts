"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useOrderPii(orderId: string) {
  const accountId = useAuthStore((s) => s.accountId);
  const [isRevealed, setIsRevealed] = useState(false);

  const query = useQuery({
    queryKey: ["order-pii", accountId, orderId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/order_customer_pii?account_id=${accountId}&order_id=${orderId}&_limit=1`
      ).then((r) => r.data?.[0] ?? null),
    enabled: !!accountId && !!orderId && isRevealed,
  });

  const pii = query.data;

  return {
    phone: isRevealed ? (pii?.customer_phone_encrypted ?? null) : null,
    email: isRevealed ? (pii?.customer_email_encrypted ?? null) : null,
    address: null as string | null,
    isLoading: query.isLoading,
    isRevealed,
    reveal: () => setIsRevealed(true),
  };
}

export default useOrderPii;

export function useCanViewPii() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return {
    canView: isAdmin,
    isAdmin,
  };
}
