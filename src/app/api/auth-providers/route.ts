import { NextRequest, NextResponse } from "next/server";
import { getNcbAuthConfig } from "@/lib/ncb-auth-config";

export async function GET(req: NextRequest) {
  const config = getNcbAuthConfig();

  if (!config.instance || !config.apiUrl || !config.secretKey) {
    return NextResponse.json(
      { error: "Missing auth provider configuration", providers: {} },
      { status: 500 }
    );
  }

  const response = await fetch(`${config.apiUrl}/providers?instance=${config.instance}`, {
    cache: "no-store",
    headers: {
      "X-Database-Instance": config.instance,
      Authorization: `Bearer ${config.secretKey}`,
      Origin: req.headers.get("origin") || req.nextUrl.origin,
    },
  });

  const data = await response.json().catch(() => ({ providers: {} }));
  return NextResponse.json(data, { status: response.status });
}
