import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

interface RedeemBody {
  email: string;
  password: string;
  name: string;
}

/**
 * POST /api/invites/[token]/redeem
 *
 * Atomically:
 * 1. Validates the invite token (exists, unused, not expired, optional email match).
 * 2. Creates the user via Better Auth.
 * 3. Marks the invite used_by + used_at.
 *
 * Returns the Better Auth session cookie so the client can navigate straight to /.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // --- validate body ---
  let body: RedeemBody;
  try {
    body = (await req.json()) as RedeemBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password, name } = body;
  if (!email || !password || !name) {
    return NextResponse.json({ error: "email, password, and name are required" }, { status: 400 });
  }

  // --- validate invite ---
  const rows = await sql`
    SELECT token, email AS bound_email, expires_at, used_at
    FROM invite
    WHERE token = ${token}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const invite = rows[0];

  if (invite.used_at) {
    return NextResponse.json({ error: "This invite has already been used" }, { status: 409 });
  }

  if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
  }

  const boundEmail = invite.bound_email as string | null;
  if (boundEmail && boundEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "This invite is for a different email address" },
      { status: 403 }
    );
  }

  // --- create user via Better Auth ---
  let signUpResult: Awaited<ReturnType<typeof auth.api.signUpEmail>>;
  try {
    signUpResult = await auth.api.signUpEmail({
      body: { email: email.trim(), password, name: name.trim() },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create account";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  if (!signUpResult.user?.id) {
    return NextResponse.json({ error: "Account creation failed" }, { status: 500 });
  }

  // --- mark invite used ---
  await sql`
    UPDATE invite
    SET used_by = ${signUpResult.user.id},
        used_at = NOW()
    WHERE token = ${token}
      AND used_at IS NULL
  `;

  // Proxy the Better Auth response (it sets the session cookie for us)
  return NextResponse.json(
    { ok: true, user: { id: signUpResult.user.id, email: signUpResult.user.email, name: signUpResult.user.name } },
    { status: 200 }
  );
}
