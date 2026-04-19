"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createEmptyWorkspace, loadBoard, saveBoard } from "@/lib/kanban-data";
import { WorkspaceSidebar } from "@/components/shared/workspace-sidebar";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { TopBar } from "@/components/shared/top-bar";
import { TweaksPanel } from "@/components/shared/tweaks-panel";
import type { BoardState } from "@/types/kanban";

function BoardApp() {
  const params = useSearchParams();
  const readOnly = params.get("view") === "1";

  const [board, setBoard] = useState<BoardState | null>(null);
  const [showTweaks, setShowTweaks] = useState(false);

  useEffect(() => {
    setBoard(loadBoard());
  }, []);

  function handleBoardChange(next: BoardState) {
    setBoard(next);
    saveBoard(next);
  }

  function handleWorkspaceSelect(id: string) {
    if (!board) return;
    const next = { ...board, activeWorkspaceId: id };
    handleBoardChange(next);
  }

  function handleAddWorkspace(name: string, stageNames: string[]) {
    if (!board) return;
    const ws = createEmptyWorkspace(name, stageNames);
    handleBoardChange({
      ...board,
      workspaces: [...board.workspaces, ws],
      activeWorkspaceId: ws.id,
    });
  }

  function handleDeleteWorkspace(id: string) {
    if (!board) return;
    const remaining = board.workspaces.filter((w) => w.id !== id);
    const nextCards = { ...board.cards };
    for (const cid of Object.keys(nextCards)) {
      if (nextCards[cid].workspaceId === id) {
        delete nextCards[cid];
      }
    }
    let activeWorkspaceId = board.activeWorkspaceId;
    if (activeWorkspaceId === id) {
      activeWorkspaceId = remaining.length > 0 ? remaining[0].id : null;
    }
    setShowTweaks(false);
    handleBoardChange({
      ...board,
      workspaces: remaining,
      cards: nextCards,
      activeWorkspaceId,
    });
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
        onSelect={handleWorkspaceSelect}
        onAddWorkspace={readOnly ? undefined : handleAddWorkspace}
        onDeleteWorkspace={readOnly ? undefined : handleDeleteWorkspace}
        readOnly={readOnly}
      />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopBar
          workspaceName={activeWorkspace?.name ?? ""}
          readOnly={readOnly}
          showTweaks={showTweaks}
          onToggleTweaks={() => setShowTweaks((s) => !s)}
          showActions={!!activeWorkspace}
        />

        {showTweaks && activeWorkspace && (
          <TweaksPanel onClose={() => setShowTweaks(false)} />
        )}

        {activeWorkspace ? (
          <KanbanBoard
            board={board}
            readOnly={readOnly}
            onBoardChange={handleBoardChange}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
            <p className="text-sm font-medium text-foreground">No workspace</p>
            {readOnly ? (
              <p className="text-xs text-muted-foreground max-w-sm">
                There are no workspaces to show.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground max-w-sm">
                Create one with{" "}
                <span className="font-medium text-foreground">+ New workspace</span> in the sidebar.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    }>
      <BoardApp />
    </Suspense>
  );
}
