import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

/** DELETE — revoke an unused invite (admin only). */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { token } = await params;

  const result = await sql`
    DELETE FROM invite
    WHERE token = ${token}
      AND used_at IS NULL
    RETURNING token
  `;

  if (result.length === 0) {
    return NextResponse.json(
      { error: "Invite not found or already used" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
