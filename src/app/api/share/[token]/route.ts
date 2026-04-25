import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { normalizeBoardState } from "@/lib/kanban-data";
import type { BoardState } from "@/types/kanban";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await sql`
    SELECT w.payload, u.name AS owner_name
    FROM workbench w
    JOIN "user" u ON u.id = w.owner_id
    WHERE w.share_token = ${token}
      AND w.share_enabled = TRUE
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const board = normalizeBoardState(rows[0].payload as BoardState);
  const ownerName = (rows[0].owner_name as string | null) ?? null;
  return NextResponse.json(
    { board, ownerName },
    { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } }
  );
}
