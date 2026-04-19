"use client";

import {
  Check,
  Link2,
  Link2Off,
  Loader2,
  Share2,
  Sliders,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";

export type SyncStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  workspaceName: string;
  readOnly: boolean;
  showTweaks: boolean;
  onToggleTweaks: () => void;
  showActions?: boolean;
  /** Persisted workbench sync (owner view). */
  syncStatus?: SyncStatus;
  syncErrorMessage?: string | null;
  onRetrySave?: () => void;
  /** Share API failure (owner view). */
  shareErrorMessage?: string | null;
  onDismissShareError?: () => void;
  // Share management (owner view only)
  shareToken?: string | null;
  shareEnabled?: boolean;
  onGenerateShare?: () => Promise<void>;
  onRevokeShare?: () => Promise<void>;
};

export function TopBar({
  workspaceName,
  readOnly,
  showTweaks,
  onToggleTweaks,
  showActions = true,
  syncStatus = "idle",
  syncErrorMessage,
  onRetrySave,
  shareErrorMessage,
  onDismissShareError,
  shareToken,
  shareEnabled,
  onGenerateShare,
  onRevokeShare,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const isClient = useIsClient();
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  function copyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleShareClick() {
    if (!onGenerateShare) return;
    setShareLoading(true);
    try {
      await onGenerateShare();
    } finally {
      setShareLoading(false);
    }
  }

  async function handleRevokeClick() {
    if (!onRevokeShare) return;
    setShareLoading(true);
    try {
      await onRevokeShare();
    } finally {
      setShareLoading(false);
    }
  }

  const showSync =
    !readOnly &&
    (syncStatus === "saving" ||
      syncStatus === "saved" ||
      (syncStatus === "error" && syncErrorMessage));

  return (
    <header className="flex shrink-0 flex-col border-b border-primary/10 bg-card/40 backdrop-blur-sm supports-[backdrop-filter]:bg-card/30">
      <div className="flex min-h-12 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1.5">
          <h1
            className={`max-w-[min(100%,42ch)] min-w-0 shrink truncate text-sm font-semibold ${workspaceName ? "text-foreground" : "text-muted-foreground"}`}
          >
            {workspaceName || "No workspace selected"}
          </h1>

          {showSync && (
            <div
              className="flex min-w-0 flex-1 items-center gap-2 text-xs sm:max-w-md sm:flex-initial"
              role="status"
              aria-live="polite"
            >
              {syncStatus === "saving" && (
                <span className="inline-flex items-center gap-1.5 text-info">
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                  Saving…
                </span>
              )}
              {syncStatus === "saved" && (
                <span className="inline-flex items-center gap-1.5 text-success">
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Saved
                </span>
              )}
              {syncStatus === "error" && syncErrorMessage && (
                <>
                  <span
                    className="text-destructive truncate max-w-[min(28ch,40vw)]"
                    title={syncErrorMessage}
                  >
                    {syncErrorMessage}
                  </span>
                  {onRetrySave && (
                    <button
                      type="button"
                      onClick={onRetrySave}
                      className="shrink-0 rounded-md px-2 py-1 font-medium text-foreground underline-offset-2 transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Try again
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-1.5 sm:ml-auto sm:w-auto">
          {isClient && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
            </button>
          )}

          {!readOnly && showActions && (
            <>
              {shareEnabled && shareToken ? (
                <>
                  {copied && (
                    <span className="text-xs text-success">Link copied</span>
                  )}
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs text-muted-foreground transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Link2 size={12} aria-hidden />
                    Copy link
                  </button>
                  <button
                    type="button"
                    onClick={handleRevokeClick}
                    disabled={shareLoading}
                    className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <Link2Off size={12} aria-hidden />
                    Stop sharing
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleShareClick}
                  disabled={shareLoading}
                  className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs text-muted-foreground transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Share2 size={12} aria-hidden />
                  {shareLoading ? "Creating link…" : "Share"}
                </button>
              )}

              <button
                type="button"
                onClick={onToggleTweaks}
                aria-pressed={showTweaks}
                className={`flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  showTweaks
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Sliders size={12} aria-hidden />
                Accent
              </button>
            </>
          )}

          {readOnly && (
            <span className="inline-flex min-h-9 items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-meta font-medium text-foreground">
              Read-only
            </span>
          )}
        </div>
      </div>

      {shareErrorMessage && !readOnly && (
        <div className="flex items-start gap-3 border-t border-border bg-destructive/5 px-4 py-2.5 text-xs text-destructive sm:px-6">
          <span className="min-w-0 flex-1">{shareErrorMessage}</span>
          {onDismissShareError && (
            <button
              type="button"
              onClick={onDismissShareError}
              className="shrink-0 rounded px-2 py-0.5 font-medium text-destructive underline-offset-2 transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Close
            </button>
          )}
        </div>
      )}
    </header>
  );
}
