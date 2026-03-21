import { NextRequest, NextResponse } from "next/server";
import * as ncb from "@/lib/ncb";

function buildAccountName(email: string): string {
  return email.split("@")[0] || "account";
}

function buildAccountSlug(email: string): string {
  const base = buildAccountName(email)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const suffix = crypto.randomUUID().slice(0, 8);
  return `${base || "account"}-${suffix}`;
}

function normalizeProfile(profile: Record<string, unknown> | null, email: string) {
  if (!profile) return null;

  const fullName =
    typeof profile.full_name === "string" && profile.full_name.trim().length > 0
      ? profile.full_name
      : buildAccountName(email);

  return {
    ...profile,
    full_name: fullName,
    display_name:
      typeof profile.display_name === "string" && profile.display_name.trim().length > 0
        ? profile.display_name
        : fullName,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await ncb.requireAuth(req);
    const now = new Date().toISOString();
    const accountName = buildAccountName(session.email);

    // Check if account already exists for this user.
    const existingUsers = await ncb.read("account_users", {
      filters: { user_id: session.id },
      limit: 1,
    });

    if (existingUsers.length > 0) {
      const accountId = (existingUsers[0] as any).account_id;
      const account = await ncb.findByUuid("accounts", accountId);
      if (!account) {
        return NextResponse.json(
          { error: `Account ${accountId} not found for user ${session.id}` },
          { status: 500 }
        );
      }

      let profile = await ncb.findByUuid("profiles", session.id);
      if (!profile) {
        profile = await ncb.create("profiles", {
          id: session.id,
          email: session.email,
          full_name: accountName,
          created_at: now,
          updated_at: now,
        });
      }

      return NextResponse.json(
        { account, profile: normalizeProfile(profile as Record<string, unknown>, session.email), existing: true }
      );
    }

    // Create new account
    const accountUuid = crypto.randomUUID();
    const account = await ncb.create("accounts", {
      id: accountUuid,
      name: accountName,
      slug: buildAccountSlug(session.email),
      activation_status: "active",
      is_active: 1,
      contact_email: session.email,
      created_at: now,
      updated_at: now,
    });

    // Create account_users link
    await ncb.create("account_users", {
      id: crypto.randomUUID(),
      account_id: accountUuid,
      user_id: session.id,
      role: "owner",
      is_active: 1,
      created_at: now,
      updated_at: now,
    });

    // Create profile
    const profile = await ncb.create("profiles", {
      id: session.id,
      email: session.email,
      full_name: accountName,
      created_at: now,
      updated_at: now,
    });

    return NextResponse.json(
      {
        account,
        profile: normalizeProfile(profile as Record<string, unknown>, session.email),
        existing: false,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Provision error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
