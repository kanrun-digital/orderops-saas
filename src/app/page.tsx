import LandingPage from "@/components/landing/LandingPage";
import { ROUTES } from "@/constants/routes";
import { getSession } from "@/lib/ncb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookie = (await headers()).get("cookie") || "";
  const session = cookie ? await getSession(cookie) : null;

  if (session) {
    redirect(ROUTES.dashboard);
  }

  return <LandingPage />;
}
