import { NextRequest, NextResponse } from "next/server";
import * as ncb from "@/lib/ncb";

export async function POST(req: NextRequest) {
  try {
    const session = await ncb.requireAuth(req);

    // Check if account already exists for this user
    const existingUsers = await ncb.read("account_users", {
      filters: { email: session.email },
      limit: 1,
    });

    if (existingUsers.length > 0) {
      const accountId = (existingUsers[0] as any).account_id;
      const account = await ncb.findByUuid("accounts", accountId);
      const profile = await ncb.findByUuid("profiles", session.id);
      return NextResponse.json({ account, profile, existing: true });
    }

    // Create new account
    const accountUuid = crypto.randomUUID();
    const account = await ncb.create("accounts", {
      id: accountUuid,
      name: session.email.split("@")[0],
      status: "active",
      plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Create account_users link
    await ncb.create("account_users", {
      id: crypto.randomUUID(),
      account_id: accountUuid,
      user_id: session.id,
      email: session.email,
      role: "owner",
      created_at: new Date().toISOString(),
    });

    // Create profile
    const profile = await ncb.create("profiles", {
      id: session.id,
      account_id: accountUuid,
      email: session.email,
      display_name: session.email.split("@")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ account, profile, existing: false }, { status: 201 });
  } catch (err: any) {
    console.error("Provision error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
