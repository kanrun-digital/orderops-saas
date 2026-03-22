"use client";

import { useState } from "react";

export function useMenuScope() {
  const [scope, setScope] = useState<string>("all");
  const [provider, setProvider] = useState<string | null>(null);

  return {
    scope,
    setScope,
    provider,
    setProvider,
  };
}

export default useMenuScope;
