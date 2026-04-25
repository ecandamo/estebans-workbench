"use client";

import type { ReactNode } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/use-is-client";
import { WorkbenchWordmark } from "@/components/shared/workbench-wordmark";
import { cn } from "@/lib/utils";

export const chromeHeaderCls = cn(
  "flex h-11 shrink-0 items-stretch border-b border-border",
  "bg-sidebar/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sidebar/90",
  "dark:bg-sidebar dark:backdrop-blur-none dark:supports-[backdrop-filter]:bg-sidebar",
);

export const iconBtn =
  "flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();
  if (!isClient) return <div className="size-9 shrink-0" />;
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={iconBtn}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
    </button>
  );
}

type Props = {
  /** Optional personalized name for the wordmark ("Esteban's Workbench"). */
  ownerName?: string | null;
  /** Optional slot rendered left of the theme toggle — e.g. a back link. */
  trailing?: ReactNode;
};

/**
 * Shared chrome header — identical to TopBar's visual shell without board actions.
 * Use on login, share loading/error, admin pages, and any other branded non-board surface.
 */
export function AppChromeHeader({ ownerName, trailing }: Props) {
  return (
    <header className={chromeHeaderCls}>
      <div className="flex w-60 shrink-0 items-center px-4 sm:px-6">
        <WorkbenchWordmark ownerName={ownerName} />
      </div>
      <div className="flex flex-1 items-center justify-end gap-1 px-4 sm:px-6">
        {trailing}
        <ThemeToggle />
      </div>
    </header>
  );
}
