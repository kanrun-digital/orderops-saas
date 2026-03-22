"use client";

import { useRouter } from "next/navigation";

import NCBAuth from "@/components/NCBAuth";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();

  return <NCBAuth mode="signin" onAuthSuccess={() => router.push(ROUTES.dashboard)} />;
}
