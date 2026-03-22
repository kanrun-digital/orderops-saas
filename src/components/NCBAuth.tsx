"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import type { NcbSession } from "@/types";
import type { AuthProviders } from "@/types/auth";

type AuthMode = "signin" | "signup";

type AuthSuccessPayload = {
  user?: NcbSession & { name?: string | null };
  [key: string]: unknown;
};

type NCBAuthProps = {
  mode?: AuthMode;
  onAuthSuccess?: (data: AuthSuccessPayload) => void;
  onAuthError?: (error: Error) => void;
};

const NCB_CONFIG = {
  instance: "",
  baseUrl: "/api/auth",
  secretKey: "",
} as const;

const DEFAULT_PROVIDERS: AuthProviders = {};

export default function NCBAuth({
  mode = "signin",
  onAuthSuccess,
  onAuthError,
}: NCBAuthProps) {
  const [providers, setProviders] = useState<AuthProviders | null>(null);
  const [currentView, setCurrentView] = useState<AuthMode | "otp">(mode);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSuccessPayload | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setCurrentView(mode);
  }, [mode]);

  useEffect(() => {
    let active = true;

    fetch(`/api/auth-providers?t=${Date.now()}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({ providers: DEFAULT_PROVIDERS }))) as {
          providers?: AuthProviders;
        };
        if (!active) return;
        setProviders(data.providers ?? DEFAULT_PROVIDERS);
      })
      .catch((err) => {
        console.error("Failed to fetch providers:", err);
        if (!active) return;
        setProviders(DEFAULT_PROVIDERS);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const res = await fetch(`${NCB_CONFIG.baseUrl}/get-session`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = (await res.json()) as AuthSuccessPayload | { user?: AuthSuccessPayload["user"] };
        const user = "user" in data ? data.user : undefined;
        if (!active || !user) return;

        const normalized = { ...data, user };
        setSession(normalized);
        onAuthSuccess?.(normalized);
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [onAuthSuccess]);

  const canShowDivider = useMemo(
    () => !!(providers?.email && (providers.google || providers.emailOTP)),
    [providers]
  );

  async function submitJson(path: string, payload: Record<string, unknown>) {
    const res = await fetch(`${NCB_CONFIG.baseUrl}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { message?: string; error?: string }).message || (data as { error?: string }).error || "Authentication failed");
    }

    return data as AuthSuccessPayload;
  }

  async function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      const data = await submitJson("sign-in/email", { email, password });
      setSession({ user: data.user });
      onAuthSuccess?.(data);
    } catch (err) {
      const authError = err instanceof Error ? err : new Error("Sign in failed");
      setError(authError.message);
      onAuthError?.(authError);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEmailSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      const data = await submitJson("sign-up/email", { name, email, password });
      setSession({ user: data.user });
      onAuthSuccess?.(data);
    } catch (err) {
      const authError = err instanceof Error ? err : new Error("Sign up failed");
      setError(authError.message);
      onAuthError?.(authError);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setFormLoading(true);
    setError("");

    try {
      const data = await submitJson("sign-in/social", {
        provider: "google",
        callbackURL: `${window.location.origin}/auth/callback`,
      });

      if ((data as { url?: string }).url) {
        window.location.href = (data as { url: string }).url;
        return;
      }

      throw new Error("Google authentication URL was not returned");
    } catch (err) {
      const authError = err instanceof Error ? err : new Error("Google sign in failed");
      setError(authError.message);
      onAuthError?.(authError);
      setFormLoading(false);
    }
  }

  async function handleSendOtp() {
    setFormLoading(true);
    setError("");

    try {
      await submitJson("email-otp/send-verification-otp", { email, type: "sign-in" });
      setOtpSent(true);
    } catch (err) {
      const authError = err instanceof Error ? err : new Error("Failed to send OTP");
      setError(authError.message);
      onAuthError?.(authError);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setFormLoading(true);
    setError("");

    try {
      const data = await submitJson("sign-in/email-otp", { email, otp });
      setSession({ user: data.user });
      onAuthSuccess?.(data);
    } catch (err) {
      const authError = err instanceof Error ? err : new Error("Invalid OTP");
      setError(authError.message);
      onAuthError?.(authError);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await submitJson("sign-out", {});
      setSession(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p>Loading authentication options…</p>
      </div>
    );
  }

  if (session?.user) {
    const initial = session.user.name?.charAt(0) || session.user.email?.charAt(0)?.toUpperCase() || "U";

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold">{session.user.name || "User"}</h2>
            <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {currentView === "signin"
            ? "Sign In"
            : currentView === "signup"
              ? "Create Account"
              : "Sign In with OTP"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Authentication is proxied through your local Next.js API route.
        </p>
      </div>

      {error ? <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      {currentView === "otp" ? (
        <div className="space-y-4">
          {!otpSent ? (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={handleSendOtp}
                disabled={formLoading}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {formLoading ? "Sending…" : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Code sent to {email}</p>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                maxLength={6}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-[0.35rem]"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={formLoading}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {formLoading ? "Verifying…" : "Verify & Sign In"}
              </button>
            </>
          )}

          <button
            onClick={() => {
              setOtpSent(false);
              setCurrentView("signin");
              setError("");
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Sign In
          </button>
        </div>
      ) : (
        <>
          {providers?.google ? (
            <button
              onClick={handleGoogleAuth}
              disabled={formLoading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          ) : null}

          {providers?.emailOTP ? (
            <button
              onClick={() => setCurrentView("otp")}
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              🔑 Sign in with Email OTP
            </button>
          ) : null}

          {canShowDivider ? (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
          ) : null}

          {providers?.email ? (
            <form onSubmit={currentView === "signin" ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
              {currentView === "signup" ? (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {formLoading ? "Loading…" : currentView === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No sign-in methods are currently enabled. Please contact support.
            </p>
          )}

          {providers?.email ? (
            <p className="text-center text-sm text-muted-foreground">
              {currentView === "signin" ? "Don’t have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setCurrentView(currentView === "signin" ? "signup" : "signin")}
                className="font-medium text-primary hover:underline"
              >
                {currentView === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
