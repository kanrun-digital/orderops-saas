"use client";

import { useRouter } from "next/navigation";

import NCBAuth from "@/components/NCBAuth";
import { ROUTES } from "@/constants/routes";

export default function RegisterPage() {
  const router = useRouter();

  return <NCBAuth mode="signup" onAuthSuccess={() => router.push(ROUTES.dashboard)} />;
}
