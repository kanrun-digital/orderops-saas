import { apiGet, apiPost } from "./api-client";
import { API_ROUTES } from "@/constants/routes";
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

export async function signOut(): Promise<void> {
  await apiPost(API_ROUTES.signOut);
}

export async function getSession(): Promise<NcbSession | null> {
  try {
    return await apiGet<NcbSession>(API_ROUTES.getSession);
  } catch {
    return null;
  }
}
