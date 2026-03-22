"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { PROVIDER_CODES } from "@/lib/constants/integrations";
import { cn } from "@/lib/utils";

type FieldType = "api_login" | "token" | "login";

interface ConnectionWizardProps {
  connectionId?: string;
  providerCode: string;
  isPosConnected?: boolean;
  className?: string;
}

function getFormConfig(providerCode: string) {
  switch (providerCode) {
    case PROVIDER_CODES.SYRVE:
      return {
        route: "/api/integrations/syrve/connect",
        field: "api_login" as FieldType,
        label: "API login",
        placeholder: "Enter Syrve API login",
        description: "Use the API login tied to your Syrve account.",
      };
    case PROVIDER_CODES.SALESBOX:
      return {
        route: "/api/integrations/salesbox/connect",
        field: "token" as FieldType,
        label: "Access token",
        placeholder: "Enter Salesbox token",
        description: "Paste the access token issued by Salesbox.",
      };
    default:
      return {
        route: "/api/integrations/salesbox/connect",
        field: "login" as FieldType,
        label: "Login",
        placeholder: "Enter integration login",
        description: "This provider currently supports a basic login field only.",
      };
  }
}

export function ConnectionWizard({ connectionId, providerCode, isPosConnected, className }: ConnectionWizardProps) {
  const queryClient = useQueryClient();
  const accountId = useAuthStore((s) => s.accountId);
  const config = useMemo(() => getFormConfig(providerCode), [providerCode]);
  const [value, setValue] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!accountId) throw new Error("Account is not ready yet.");
      if (!value.trim()) throw new Error(`${config.label} is required.`);

      const payload: Record<string, string> = {
        account_id: accountId,
        connection_name: connectionName.trim() || providerCode,
      };
      payload[config.field] = value.trim();

      return apiPost(config.route, payload);
    },
    onSuccess: () => {
      setFeedback({ type: "success", message: "Connection was saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["connection-list"] });
      queryClient.invalidateQueries({ queryKey: ["syrve-credentials"] });
      queryClient.invalidateQueries({ queryKey: ["syrve-organizations"] });
    },
    onError: (error: Error) => {
      setFeedback({ type: "error", message: error.message || "Failed to connect integration." });
    },
  });

  const providerRequiresPos = providerCode !== PROVIDER_CODES.SYRVE;
  const connectDisabled = mutation.isPending || !accountId || (providerRequiresPos && !isPosConnected);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Connection name</span>
          <Input
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="Optional display name"
            disabled={mutation.isPending}
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">{config.label}</span>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.placeholder}
            disabled={mutation.isPending}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p>{config.description}</p>
          {connectionId ? <p>Connection ID: {connectionId}</p> : null}
          {providerRequiresPos && !isPosConnected ? (
            <p className="text-amber-700">Connect a POS provider first to enable downstream sync workflows.</p>
          ) : null}
        </div>

        <Button type="button" onClick={() => { setFeedback(null); mutation.mutate(); }} disabled={connectDisabled}>
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Connect
        </Button>
      </div>

      {feedback ? (
        <div
          className={cn(
            "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          )}
        >
          {feedback.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      ) : null}
    </div>
  );
}

export default ConnectionWizard;
