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

  function handleAddWorkspace(name: string) {
    if (!board) return;
    const ws = createEmptyWorkspace(name);
    handleBoardChange({
      ...board,
      workspaces: [...board.workspaces, ws],
      activeWorkspaceId: ws.id,
    });
  }

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  const activeWorkspace = board.workspaces.find((w) => w.id === board.activeWorkspaceId)!;

  return (
    <div className="flex h-full overflow-hidden">
      <WorkspaceSidebar
        workspaces={board.workspaces}
        activeId={board.activeWorkspaceId}
        onSelect={handleWorkspaceSelect}
        onAddWorkspace={readOnly ? undefined : handleAddWorkspace}
        readOnly={readOnly}
      />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopBar
          workspaceName={activeWorkspace.name}
          readOnly={readOnly}
          showTweaks={showTweaks}
          onToggleTweaks={() => setShowTweaks((s) => !s)}
        />

        {showTweaks && (
          <TweaksPanel onClose={() => setShowTweaks(false)} />
        )}

        <KanbanBoard
          board={board}
          readOnly={readOnly}
          onBoardChange={handleBoardChange}
        />
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
