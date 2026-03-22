import { apiGet, apiPost } from "./api-client";
import { API_ROUTES } from "@/constants/routes";
import type { AuthProvidersResponse } from "@/types/auth";
import type { NcbSession } from "@/types";

export async function signIn(email: string, password: string): Promise<any> {
  return apiPost(API_ROUTES.signIn, { email, password });
}

export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<any> {
  return apiPost(API_ROUTES.signUp, { email, password, name });
}

export async function sendEmailOtp(email: string): Promise<any> {
  return apiPost(API_ROUTES.sendEmailOtp, { email, type: "sign-in" });
}

export async function verifyEmailOtp(email: string, otp: string): Promise<any> {
  return apiPost(API_ROUTES.verifyEmailOtp, { email, otp });
}

export async function signOut(): Promise<void> {
  await apiPost(API_ROUTES.signOut);
}

export async function getSession(): Promise<NcbSession | null> {
  try {
    const session = await apiGet<any>(API_ROUTES.getSession);
    if (!session) return null;

    if (session.user && typeof session.user === "object") {
      return session.user as NcbSession;
    }

    if (session.email) {
      return session as NcbSession;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getAuthProviders(): Promise<AuthProvidersResponse> {
  return apiGet<AuthProvidersResponse>(API_ROUTES.authProviders);
}
