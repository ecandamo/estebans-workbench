"use client";

import { Share2, Sliders, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";

type Props = {
  workspaceName: string;
  readOnly: boolean;
  showTweaks: boolean;
  onToggleTweaks: () => void;
  /** When false, Share / Tweaks are hidden (no active workspace). */
  showActions?: boolean;
};

export function TopBar({
  workspaceName,
  readOnly,
  showTweaks,
  onToggleTweaks,
  showActions = true,
}: Props) {
  const [copied, setCopied] = useState(false);
  const isClient = useIsClient();
  const { resolvedTheme, setTheme } = useTheme();

  function handleShare() {
    const url = `${window.location.origin}/?view=1`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isDark = resolvedTheme === "dark";

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

        {copied && (
          <span className="text-xs text-muted-foreground">Link copied!</span>
        )}

        {!readOnly && showActions && (
          <>
            <button
              type="button"
              onClick={handleShare}
              className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Share2 size={12} aria-hidden />
              Share
            </button>

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
