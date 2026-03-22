import { NextResponse } from "next/server";

const NCB_CONFIG = {
  instance: process.env.NCB_INSTANCE ?? "",
  apiUrl: process.env.NCB_API_URL ?? "",
  secretKey: process.env.NCB_SECRET_KEY ?? "",
};

export async function GET() {
  if (!NCB_CONFIG.instance || !NCB_CONFIG.apiUrl || !NCB_CONFIG.secretKey) {
    return NextResponse.json(
      { error: "Missing auth provider configuration", providers: {} },
      { status: 500 }
    );
  }

  const response = await fetch(`${NCB_CONFIG.apiUrl}/providers?instance=${NCB_CONFIG.instance}`, {
    cache: "no-store",
    headers: {
      "X-Database-Instance": NCB_CONFIG.instance,
      Authorization: `Bearer ${NCB_CONFIG.secretKey}`,
    },
  });

  const data = await response.json().catch(() => ({ providers: {} }));
  return NextResponse.json(data, { status: response.status });
}
