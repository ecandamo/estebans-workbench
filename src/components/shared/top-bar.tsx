"use client";

import type { ReactNode } from "react";
import {
  Check,
  Link2,
  Link2Off,
  Loader2,
  LogOut,
  Settings2,
  Share2,
  Sliders,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import { cn } from "@/lib/utils";

export type SyncStatus = "idle" | "saving" | "saved" | "error";

type AccountInfo = {
  name: string;
  email: string;
  isAdmin: boolean;
};

type Props = {
  /** Left strip (e.g. workbench wordmark) — one unified header row with toolbar */
  leading?: ReactNode;
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
  // Account
  account?: AccountInfo;
  onSignOut?: () => Promise<void>;
};

const iconBtn =
  "flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textBtn =
  "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function AccountMenu({
  account,
  onSignOut,
}: {
  account: AccountInfo;
  onSignOut?: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleSignOut() {
    if (!onSignOut) return;
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {initials(account.name)}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-popover shadow-lg ring-1 ring-black/5">
          {/* User info */}
          <div className="px-3 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground leading-none truncate">
              {account.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{account.email}</p>
          </div>

          {/* Actions */}
          <div className="py-1">
            {account.isAdmin && (
              <a
                href="/admin/invites"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Settings2 size={14} className="shrink-0 text-muted-foreground" />
                Manage invites
              </a>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              {signingOut ? (
                <Loader2 size={14} className="shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <LogOut size={14} className="shrink-0 text-muted-foreground" />
              )}
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TopBar({
  leading,
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
  account,
  onSignOut,
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

  const toolbar = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
        {showSync && (
          <div
            className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md sm:flex-initial"
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
                    className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium text-foreground underline-offset-2 transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Try again
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-1.5">
        {isClient && (
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={iconBtn}
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
                  className={cn(
                    textBtn,
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Link2 size={12} aria-hidden />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={handleRevokeClick}
                  disabled={shareLoading}
                  className={cn(
                    textBtn,
                    "hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  )}
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
                className={cn(
                  textBtn,
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:opacity-50",
                )}
              >
                <Share2 size={12} aria-hidden />
                {shareLoading ? "Creating link…" : "Share"}
              </button>
            )}

            <button
              type="button"
              onClick={onToggleTweaks}
              aria-pressed={showTweaks}
              className={cn(
                textBtn,
                showTweaks
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Sliders size={12} aria-hidden />
              Accent
            </button>
          </>
        )}

        {readOnly && (
          <span className="inline-flex h-7 items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-label font-medium text-muted-foreground">
            Read-only
          </span>
        )}

        {account && !readOnly && (
          <AccountMenu account={account} onSignOut={onSignOut} />
        )}
      </div>
    </>
  );

  return (
    <header
      className={cn(
        "flex shrink-0 flex-col border-b border-border",
        "bg-sidebar/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sidebar/90",
        "dark:bg-sidebar dark:backdrop-blur-none dark:supports-[backdrop-filter]:bg-sidebar",
      )}
    >
      {leading != null ? (
        <div className="flex h-11 min-h-11 items-stretch">
          <div className="flex w-60 shrink-0 items-center px-4 sm:px-6">
            {leading}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 items-center gap-3 px-4 sm:px-6">
            {toolbar}
          </div>
        </div>
      ) : (
        <div className="flex h-11 min-h-11 items-center gap-3 px-4 sm:px-6">{toolbar}</div>
      )}

      {shareErrorMessage && !readOnly && (
        <div className="flex items-start gap-3 border-t border-border bg-destructive/5 px-4 py-2 text-xs text-destructive sm:px-6">
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
