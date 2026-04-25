import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAdmin(session)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null };
}

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** POST — mint a new invite link. Body: { email?: string; expiresInDays?: number } */
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin(req);
  if (error) return error;

  let body: { email?: string; expiresInDays?: number } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body is fine */
  }

  const token = generateToken();
  const email = body.email?.trim().toLowerCase() || null;
  const expiresAt = body.expiresInDays
    ? new Date(Date.now() + body.expiresInDays * 86_400_000).toISOString()
    : null;

  await sql`
    INSERT INTO invite (token, email, created_by, expires_at)
    VALUES (${token}, ${email}, ${session!.user.id}, ${expiresAt})
  `;

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  return NextResponse.json({
    token,
    email,
    expiresAt,
    url: `${origin}/login?invite=${token}`,
  });
}

/** GET — list all invites (admin only). */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const rows = await sql`
    SELECT
      i.token,
      i.email,
      i.created_at,
      i.expires_at,
      i.used_at,
      u.name  AS used_by_name,
      u.email AS used_by_email
    FROM invite i
    LEFT JOIN "user" u ON u.id = i.used_by
    ORDER BY i.created_at DESC
  `;

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const invites = rows.map((r) => ({
    token: r.token as string,
    email: r.email as string | null,
    createdAt: r.created_at as string,
    expiresAt: r.expires_at as string | null,
    usedAt: r.used_at as string | null,
    usedByName: r.used_by_name as string | null,
    usedByEmail: r.used_by_email as string | null,
    url: `${origin}/login?invite=${r.token}`,
  }));

  return NextResponse.json({ invites });
}
