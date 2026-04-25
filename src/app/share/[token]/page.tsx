"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceSidebar } from "@/components/shared/workspace-sidebar";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { TopBar } from "@/components/shared/top-bar";
import { WorkbenchWordmark } from "@/components/shared/workbench-wordmark";
import type { BoardState } from "@/types/kanban";

const MSG_NETWORK =
  "Can't reach the server. Check your connection and try again.";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [board, setBoard] = useState<BoardState | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/share/${token}`)
      .then((res) => {
        if (!res.ok) {
          setError(
            "This link isn't valid, or the owner stopped sharing it."
          );
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setBoard(data.board);
          setOwnerName(data.ownerName ?? null);
          setActiveWorkspaceId(data.board.activeWorkspaceId);
        }
      })
      .catch(() => {
        setError(MSG_NETWORK);
      });
  }, [token]);

  if (error) {
    return (
      <main className="flex h-full flex-col items-center justify-center gap-2 px-4">
        <div role="alert" className="flex flex-col items-center gap-2 text-center">
          <p className="font-serif text-base font-semibold text-foreground">
            Cannot open shared board
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        </div>
      </main>
    );
  }

  if (!board) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy
        className="flex h-full items-center justify-center"
      >
        <span className="text-sm text-muted-foreground">Loading shared board…</span>
      </div>
    );
  }

  const activeWorkspace = activeWorkspaceId
    ? board.workspaces.find((w) => w.id === activeWorkspaceId)
    : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TopBar
        leading={<WorkbenchWordmark ownerName={ownerName} />}
        readOnly
        showTweaks={false}
        onToggleTweaks={() => {}}
        showActions={false}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <WorkspaceSidebar
          workspaces={board.workspaces}
          activeId={activeWorkspaceId}
          onSelect={setActiveWorkspaceId}
          readOnly
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          {activeWorkspace ? (
            <KanbanBoard
              board={{ ...board, activeWorkspaceId }}
              readOnly
              onBoardChange={() => {}}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="font-serif text-base font-semibold text-foreground">
                Nothing here yet
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                This shared board doesn&apos;t include a workspace.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
