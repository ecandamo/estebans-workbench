"use client";

import { Share2, Sliders } from "lucide-react";
import { useState } from "react";

type Props = {
  workspaceName: string;
  readOnly: boolean;
  showTweaks: boolean;
  onToggleTweaks: () => void;
};

export function TopBar({ workspaceName, readOnly, showTweaks, onToggleTweaks }: Props) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/?view=1`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <header className="flex items-center h-12 px-5 border-b border-border shrink-0 bg-background gap-4">
      <h1 className="text-sm font-semibold text-foreground">{workspaceName}</h1>

      <div className="ml-auto flex items-center gap-2">
        {copied && (
          <span className="text-xs text-muted-foreground">Link copied!</span>
        )}

        {!readOnly && (
          <>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1.5 transition-colors hover:bg-muted"
            >
              <Share2 size={12} />
              Share
            </button>

            <button
              onClick={onToggleTweaks}
              className={`flex items-center gap-1.5 text-xs border rounded-md px-2.5 py-1.5 transition-colors ${
                showTweaks
                  ? "bg-accent text-accent-foreground border-accent"
                  : "text-muted-foreground hover:text-foreground border-border hover:bg-muted"
              }`}
            >
              <Sliders size={12} />
              Tweaks
            </button>
          </>
        )}

        {readOnly && (
          <span className="text-[11px] text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full font-medium">
            View only
          </span>
        )}
      </div>
    </header>
  );
}
