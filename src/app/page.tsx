"use client";

import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createEmptyWorkspace, saveBoard } from "@/lib/kanban-data";
import { useSession } from "@/lib/auth-client";
import { WorkspaceSidebar } from "@/components/shared/workspace-sidebar";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { TopBar } from "@/components/shared/top-bar";
import { TweaksPanel } from "@/components/shared/tweaks-panel";
import type { BoardState } from "@/types/kanban";

const SAVE_DEBOUNCE_MS = 800;

function BoardApp() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [board, setBoard] = useState<BoardState | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [showTweaks, setShowTweaks] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Redirect to login when auth is resolved and there's no session.
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace("/login");
    }
  }, [session, sessionLoading, router]);

  // Load workbench from server once authenticated.
  useEffect(() => {
    if (!session) return;
    fetch("/api/workbench")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setBoard(data.board);
        setShareToken(data.shareToken ?? null);
        setShareEnabled(data.shareEnabled ?? false);
        // Mirror to localStorage so the board is available offline / fast on reload.
        saveBoard(data.board);
      });
  }, [session, router]);

  const persistBoard = useCallback((next: BoardState) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch("/api/workbench", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    }, SAVE_DEBOUNCE_MS);
  }, []);

  function handleBoardChange(next: BoardState) {
    setBoard(next);
    saveBoard(next);
    persistBoard(next);
  }

  function handleWorkspaceSelect(id: string) {
    if (!board) return;
    handleBoardChange({ ...board, activeWorkspaceId: id });
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
    handleBoardChange({ ...board, workspaces: remaining, cards: nextCards, activeWorkspaceId });
  }

  async function handleGenerateShare() {
    const res = await fetch("/api/workbench/share", { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setShareToken(data.shareToken);
    setShareEnabled(data.shareEnabled);
  }

  async function handleRevokeShare() {
    const res = await fetch("/api/workbench/share", { method: "DELETE" });
    if (!res.ok) return;
    setShareToken(null);
    setShareEnabled(false);
  }

  if (sessionLoading || !session || !board) {
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
        onAddWorkspace={handleAddWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        readOnly={false}
      />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopBar
          workspaceName={activeWorkspace?.name ?? ""}
          readOnly={false}
          showTweaks={showTweaks}
          onToggleTweaks={() => setShowTweaks((s) => !s)}
          showActions={!!activeWorkspace}
          shareToken={shareToken}
          shareEnabled={shareEnabled}
          onGenerateShare={handleGenerateShare}
          onRevokeShare={handleRevokeShare}
        />

        {showTweaks && activeWorkspace && (
          <TweaksPanel onClose={() => setShowTweaks(false)} />
        )}

        {activeWorkspace ? (
          <KanbanBoard
            board={board}
            readOnly={false}
            onBoardChange={handleBoardChange}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
            <p className="text-sm font-medium text-foreground">No workspace</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Create one with{" "}
              <span className="font-medium text-foreground">+ New workspace</span> in the sidebar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      }
    >
      <BoardApp />
    </Suspense>
  );
}
