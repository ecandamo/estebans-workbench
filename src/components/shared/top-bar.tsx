"use client";

import { Link2, Link2Off, Share2, Sliders, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";

type Props = {
  workspaceName: string;
  readOnly: boolean;
  showTweaks: boolean;
  onToggleTweaks: () => void;
  showActions?: boolean;
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

  return (
    <header className="flex items-center min-h-12 px-5 shrink-0 bg-background gap-4">
      <h1
        className={`text-sm font-semibold ${workspaceName ? "text-foreground" : "text-muted-foreground"}`}
      >
        {workspaceName || "No workspace"}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        {isClient && (
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  <span className="text-xs text-muted-foreground">Link copied!</span>
                )}
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Link2 size={12} aria-hidden />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={handleRevokeClick}
                  disabled={shareLoading}
                  className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Link2Off size={12} aria-hidden />
                  Revoke
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleShareClick}
                disabled={shareLoading}
                className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <Share2 size={12} aria-hidden />
                {shareLoading ? "Generating…" : "Share"}
              </button>
            )}

            <button
              type="button"
              onClick={onToggleTweaks}
              aria-pressed={showTweaks}
              className={`flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                showTweaks
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Sliders size={12} aria-hidden />
              Tweaks
            </button>
          </>
        )}

        {readOnly && (
          <span className="inline-flex min-h-9 items-center rounded-full border border-border bg-muted/80 px-2.5 py-1 text-[11px] font-medium text-foreground">
            View only
          </span>
        )}
      </div>
    </header>
  );
}
