import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
import { sql } from "@/lib/db";
import { normalizeBoardState, DEFAULT_BOARD_STATE } from "@/lib/kanban-data";
import type { BoardState } from "@/types/kanban";
import type { NextRequest } from "next/server";

async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`
    SELECT payload, share_token, share_enabled
    FROM workbench
    WHERE owner_id = ${session.user.id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { board: DEFAULT_BOARD_STATE, shareToken: null, shareEnabled: false },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const row = rows[0];
  return NextResponse.json(
    {
      board: normalizeBoardState(row.payload as BoardState),
      shareToken: row.share_token as string | null,
      shareEnabled: row.share_enabled as boolean,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const normalized = normalizeBoardState(body as BoardState);

  await sql`
    INSERT INTO workbench (owner_id, payload, updated_at)
    VALUES (${session.user.id}, ${JSON.stringify(normalized)}, NOW())
    ON CONFLICT (owner_id) DO UPDATE
      SET payload = EXCLUDED.payload,
          updated_at = EXCLUDED.updated_at
  `;

  return NextResponse.json({ ok: true });
}
