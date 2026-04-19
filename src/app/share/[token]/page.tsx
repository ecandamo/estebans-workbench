"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceSidebar } from "@/components/shared/workspace-sidebar";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { TopBar } from "@/components/shared/top-bar";
import type { BoardState } from "@/types/kanban";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [board, setBoard] = useState<BoardState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/share/${token}`)
      .then((res) => {
        if (!res.ok) {
          setError("This share link is invalid or has been revoked.");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setBoard(data.board);
      });
  }, [token]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-sm font-medium text-foreground">Link unavailable</p>
        <p className="text-xs text-muted-foreground max-w-sm text-center">{error}</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  const activeWorkspace = board.activeWorkspaceId
    ? board.workspaces.find((w) => w.id === board.activeWorkspaceId)
    : undefined;

  return (
    <div className="flex h-full overflow-hidden">
      <WorkspaceSidebar
        workspaces={board.workspaces}
        activeId={board.activeWorkspaceId}
        onSelect={() => {}}
        readOnly
      />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopBar
          workspaceName={activeWorkspace?.name ?? ""}
          readOnly
          showTweaks={false}
          onToggleTweaks={() => {}}
          showActions={false}
        />

        {activeWorkspace ? (
          <KanbanBoard
            board={board}
            readOnly
            onBoardChange={() => {}}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
            <p className="text-sm font-medium text-foreground">No workspace</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              There are no workspaces to show.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
