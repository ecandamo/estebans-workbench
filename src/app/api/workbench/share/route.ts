import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
import { sql } from "@/lib/db";
import type { NextRequest } from "next/server";

async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

/** POST — generate / rotate the share token and enable sharing. */
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate a cryptographically random base64url token (32 bytes → 43 chars).
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await sql`
    INSERT INTO workbench (owner_id, payload, share_token, share_enabled, updated_at)
    VALUES (${session.user.id}, '{}', ${token}, TRUE, NOW())
    ON CONFLICT (owner_id) DO UPDATE
      SET share_token = ${token},
          share_enabled = TRUE,
          updated_at = NOW()
  `;

  return NextResponse.json({ shareToken: token, shareEnabled: true });
}

/** DELETE — revoke the share token (disable sharing). */
export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await sql`
    UPDATE workbench
    SET share_token = NULL,
        share_enabled = FALSE,
        updated_at = NOW()
    WHERE owner_id = ${session.user.id}
  `;

  return NextResponse.json({ shareToken: null, shareEnabled: false });
}
