"use client";

import { X } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Brand accent presets only (navy / teal / amber from globals.css).
 * Replaces ad-hoc swatches; "default" clears inline overrides so the theme controls accent.
 */
const PRESETS = {
  amber: {
    light: { accent: "oklch(0.72 0.14 65)", fg: "oklch(0.145 0.03 256)" },
    dark: { accent: "oklch(0.75 0.15 75)", fg: "oklch(0.145 0.03 256)" },
  },
  teal: {
    light: { accent: "oklch(0.49 0.1 180)", fg: "oklch(1 0 0)" },
    dark: { accent: "oklch(0.7 0.1 180)", fg: "oklch(0.145 0.03 256)" },
  },
  navy: {
    light: { accent: "oklch(0.34 0.12 262)", fg: "oklch(1 0 0)" },
    dark: { accent: "oklch(0.63 0.185 262)", fg: "oklch(1 0 0)" },
  },
} as const;

type PresetKey = keyof typeof PRESETS;

type Props = {
  onClose: () => void;
};

export function TweaksPanel({ onClose }: Props) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  function applyPreset(key: PresetKey) {
    const { accent, fg } = PRESETS[key][mode];
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-foreground", fg);
  }

  function useThemeDefault() {
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--accent-foreground");
  }

  return (
    <div className="absolute right-4 top-full z-30 mt-1 w-[11.5rem] rounded-lg border border-border bg-card p-3 shadow-lg sm:right-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-label font-semibold uppercase tracking-widest text-muted-foreground">
          Accent
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-9 min-w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close accent options"
        >
          <X size={12} aria-hidden />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
          const { accent, fg } = PRESETS[key][mode];
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          return (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="w-full rounded-md px-3 py-2 text-left text-xs font-medium transition-[filter] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:brightness-110"
              style={{ backgroundColor: accent, color: fg }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={useThemeDefault}
        className="mt-3 min-h-10 w-full rounded-sm border-t border-border pt-2 pb-1 text-left text-meta text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Use default accent
      </button>
    </div>
  );
}
