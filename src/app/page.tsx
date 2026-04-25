"use client";

import {
  useEffect,
  useRef,
  useState,
  Suspense,
  useCallback,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createEmptyWorkspace, saveBoard } from "@/lib/kanban-data";
import { useSession, signOut } from "@/lib/auth-client";
import { WorkspaceSidebar } from "@/components/shared/workspace-sidebar";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { TopBar } from "@/components/shared/top-bar";
import { WorkbenchWordmark } from "@/components/shared/workbench-wordmark";
import { AppChromeHeader } from "@/components/shared/app-chrome-header";
import type { SyncStatus } from "@/components/shared/top-bar";
import { TweaksPanel } from "@/components/shared/tweaks-panel";
import type { BoardState } from "@/types/kanban";
import { isAdminEmail } from "@/lib/admin";
import { cn } from "@/lib/utils";

/** Chrome skeleton shown while the session or board is resolving. Matches TopBar visually. */
function LoadingShell({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col">
      <AppChromeHeader />
      <div
        role="status"
        aria-live="polite"
        aria-busy
        className="flex flex-1 items-center justify-center bg-board"
      >
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {message}
        </span>
      </div>
    </div>
  );
}

const SAVE_DEBOUNCE_MS = 800;
const SAVE_SAVED_RESET_MS = 2500;

/** Minimal, direct copy — internal workbench (.impeccable.md) */
const COPY = {
  loadingSession: "Loading…",
  loadingWorkbench: "Loading your board…",
  loadFailedHttp: (status: number) =>
    `Your board couldn't be loaded (${status}). Try again.`,
  loadFailedNetwork:
    "Can't reach the server. Check your connection and try again.",
  loadFailedFallback: "Your board didn't load. Try again.",
  saveFailedDefault: "Your changes couldn't be saved. Try again.",
  saveFailedNetwork:
    "Can't reach the server. Check your connection, then try again.",
  shareCreateFailed: (status: number) =>
    `Couldn't create a public link (${status}). Try again.`,
  shareRevokeFailed: (status: number) =>
    `Couldn't stop sharing (${status}). Try again.`,
  shareNetwork:
    "Can't reach the server. Check your connection and try again.",
} as const;

function isAbortError(e: unknown): boolean {
  return (
    e instanceof DOMException && e.name === "AbortError"
  ) || (typeof e === "object" &&
    e !== null &&
    "name" in e &&
    (e as { name: string }).name === "AbortError");
}

function BoardApp() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [board, setBoard] = useState<BoardState | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [showTweaks, setShowTweaks] = useState(false);
  const [loadNonce, setLoadNonce] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workbenchLoading, setWorkbenchLoading] = useState(true);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [shareErrorMessage, setShareErrorMessage] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardPendingSaveRef = useRef<BoardState | null>(null);
  const putAbortRef = useRef<AbortController | null>(null);

  function clearSavedResetTimer() {
    if (savedResetTimerRef.current) {
      clearTimeout(savedResetTimerRef.current);
      savedResetTimerRef.current = null;
    }
  }

  // Redirect to login when auth is resolved and there's no session.
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace("/login");
    }
  }, [session, sessionLoading, router]);

  // Load workbench from server once authenticated.
  useEffect(() => {
    if (!session) return;
    const ac = new AbortController();
    let cancelled = false;
    startTransition(() => {
      setWorkbenchLoading(true);
      setLoadError(null);
    });

    (async () => {
      try {
        const res = await fetch("/api/workbench", { signal: ac.signal });
        if (cancelled) return;
        if (res.status === 401) {
          router.replace("/login");
          setWorkbenchLoading(false);
          return;
        }
        if (!res.ok) {
          setLoadError(COPY.loadFailedHttp(res.status));
          setWorkbenchLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setBoard(data.board);
        setShareToken(data.shareToken ?? null);
        setShareEnabled(data.shareEnabled ?? false);
        saveBoard(data.board);
        setLoadError(null);
        setWorkbenchLoading(false);
      } catch (e) {
        if (isAbortError(e) || cancelled) return;
        setLoadError(
          e instanceof Error ? e.message : COPY.loadFailedNetwork
        );
        setWorkbenchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [session, router, loadNonce]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      clearSavedResetTimer();
      putAbortRef.current?.abort();
    };
  }, []);

  const flushSaveNow = useCallback(
    async (payload: BoardState) => {
      putAbortRef.current?.abort();
      const ac = new AbortController();
      putAbortRef.current = ac;

      clearSavedResetTimer();
      setSyncStatus("saving");
      setSyncErrorMessage(null);

      try {
        const res = await fetch("/api/workbench", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ac.signal,
        });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          let detail: string = COPY.saveFailedDefault;
          try {
            const j = (await res.json()) as { error?: string };
            if (j.error) detail = j.error;
          } catch {
            /* ignore non-JSON body */
          }
          setSyncStatus("error");
          setSyncErrorMessage(detail);
          return;
        }
        setSyncStatus("saved");
        setSyncErrorMessage(null);
        savedResetTimerRef.current = setTimeout(() => {
          savedResetTimerRef.current = null;
          setSyncStatus("idle");
        }, SAVE_SAVED_RESET_MS);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        setSyncStatus("error");
        setSyncErrorMessage(
          e instanceof Error ? e.message : COPY.saveFailedNetwork
        );
      }
    },
    [router]
  );

  const persistBoard = useCallback(
    (next: BoardState) => {
      boardPendingSaveRef.current = next;
      clearSavedResetTimer();
      setSyncStatus((prev) => (prev === "saved" ? "idle" : prev));
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        const payload = boardPendingSaveRef.current;
        if (!payload) return;
        void flushSaveNow(payload);
      }, SAVE_DEBOUNCE_MS);
    },
    [flushSaveNow]
  );

  const retrySave = useCallback(() => {
    if (!board) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    void flushSaveNow(board);
  }, [board, flushSaveNow]);

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
    setShareErrorMessage(null);
    try {
      const res = await fetch("/api/workbench/share", { method: "POST" });
      if (!res.ok) {
        setShareErrorMessage(COPY.shareCreateFailed(res.status));
        return;
      }
      const data = await res.json();
      setShareToken(data.shareToken);
      setShareEnabled(data.shareEnabled);
    } catch (e) {
      setShareErrorMessage(
        e instanceof Error ? e.message : COPY.shareNetwork
      );
    }
  }

  async function handleRevokeShare() {
    setShareErrorMessage(null);
    try {
      const res = await fetch("/api/workbench/share", { method: "DELETE" });
      if (!res.ok) {
        setShareErrorMessage(COPY.shareRevokeFailed(res.status));
        return;
      }
      setShareToken(null);
      setShareEnabled(false);
    } catch (e) {
      setShareErrorMessage(
        e instanceof Error ? e.message : COPY.shareNetwork
      );
    }
  }

  if (sessionLoading || !session) {
    return <LoadingShell message={COPY.loadingSession} />;
  }

  if (workbenchLoading) {
    return <LoadingShell message={COPY.loadingWorkbench} />;
  }

  if (loadError || !board) {
    return (
      <div className="flex h-full flex-col">
        <header
          className={cn(
            "flex h-11 shrink-0 items-stretch border-b border-border",
            "bg-sidebar/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sidebar/90",
            "dark:bg-sidebar dark:backdrop-blur-none dark:supports-[backdrop-filter]:bg-sidebar",
          )}
        >
          <div className="flex w-60 shrink-0 items-center px-4 sm:px-6">
            <WorkbenchWordmark />
          </div>
          <div className="flex flex-1 items-center px-4 sm:px-6" />
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-board px-6 text-center">
          <p className="text-sm text-destructive max-w-md" role="alert">
            {loadError ?? COPY.loadFailedFallback}
          </p>
          <button
            type="button"
            onClick={() => {
              setLoadNonce((n) => n + 1);
            }}
            className="min-h-11 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        </main>
      </div>
    );
  }

  const activeWorkspace = board.activeWorkspaceId
    ? board.workspaces.find((w) => w.id === board.activeWorkspaceId)
    : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative z-20 shrink-0">
        <TopBar
          leading={<WorkbenchWordmark ownerName={session.user.name} />}
          readOnly={false}
          showTweaks={showTweaks}
          onToggleTweaks={() => setShowTweaks((s) => !s)}
          showActions={!!activeWorkspace}
          syncStatus={syncStatus}
          syncErrorMessage={syncErrorMessage}
          onRetrySave={retrySave}
          shareErrorMessage={shareErrorMessage}
          onDismissShareError={() => setShareErrorMessage(null)}
          shareToken={shareToken}
          shareEnabled={shareEnabled}
          onGenerateShare={handleGenerateShare}
          onRevokeShare={handleRevokeShare}
          account={{
            name: session.user.name,
            email: session.user.email,
            isAdmin: isAdminEmail(session.user.email),
          }}
          onSignOut={async () => {
            await signOut();
            router.replace("/login");
          }}
        />

        {showTweaks && activeWorkspace && (
          <TweaksPanel onClose={() => setShowTweaks(false)} />
        )}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <WorkspaceSidebar
          workspaces={board.workspaces}
          activeId={board.activeWorkspaceId}
          onSelect={handleWorkspaceSelect}
          onAddWorkspace={handleAddWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          readOnly={false}
        />

        <main className="relative flex flex-1 flex-col overflow-hidden">
          {activeWorkspace ? (
            <KanbanBoard
              board={board}
              readOnly={false}
              onBoardChange={handleBoardChange}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="font-wordmark text-base font-semibold text-foreground">
                No workspace yet
              </p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Add one with{" "}
                <span className="font-medium text-foreground">+ New workspace</span> in the
                sidebar.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <LoadingShell message={COPY.loadingSession} />
      }
    >
      <BoardApp />
    </Suspense>
  );
}
