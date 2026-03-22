import { NextResponse } from "next/server";

export async function GET() {
  const authApiUrl = process.env.NCB_AUTH_API_URL;
  const instance = process.env.NCB_INSTANCE;

  if (!authApiUrl || !instance) {
    return NextResponse.json(
      { error: "Missing auth provider configuration", providers: {} },
      { status: 500 }
    );
  }

  const url = `${authApiUrl}/providers?Instance=${encodeURIComponent(instance)}`;
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
