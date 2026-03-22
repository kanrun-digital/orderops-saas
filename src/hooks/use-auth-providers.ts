"use client";

import { useEffect, useState } from "react";
import type { AuthProviders, AuthProvidersResponse } from "@/types/auth";

const DEFAULT_PROVIDERS: AuthProviders = {};

export function useAuthProviders() {
  const [providers, setProviders] = useState<AuthProviders | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProviders() {
      try {
        const response = await fetch("/api/auth-providers", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load auth providers (${response.status})`);
        }

        const data = (await response.json()) as AuthProvidersResponse;
        if (!active) return;

        setProviders(data.providers || DEFAULT_PROVIDERS);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load auth providers");
        setProviders(DEFAULT_PROVIDERS);
      }
    }

    loadProviders();

    return () => {
      active = false;
    };
  }, []);

  return {
    providers,
    isLoading: providers === null,
    error,
  };
}
