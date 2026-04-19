"use client";

import { X } from "lucide-react";

const ACCENTS = [
  { label: "Amber", value: "oklch(0.72 0.14 65)", fg: "oklch(0.145 0.03 256)" },
  { label: "Coral", value: "oklch(0.68 0.18 20)", fg: "oklch(1 0 0)" },
  { label: "Rose", value: "oklch(0.65 0.2 5)", fg: "oklch(1 0 0)" },
  { label: "Violet", value: "oklch(0.6 0.22 295)", fg: "oklch(1 0 0)" },
  { label: "Indigo", value: "oklch(0.55 0.2 265)", fg: "oklch(1 0 0)" },
  { label: "Sky", value: "oklch(0.65 0.18 220)", fg: "oklch(1 0 0)" },
  { label: "Teal", value: "oklch(0.58 0.15 180)", fg: "oklch(1 0 0)" },
  { label: "Emerald", value: "oklch(0.6 0.17 150)", fg: "oklch(1 0 0)" },
  { label: "Lime", value: "oklch(0.68 0.18 130)", fg: "oklch(0.145 0.03 256)" },
  { label: "Gold", value: "oklch(0.72 0.16 85)", fg: "oklch(0.145 0.03 256)" },
  { label: "Slate", value: "oklch(0.5 0.04 260)", fg: "oklch(1 0 0)" },
  { label: "Stone", value: "oklch(0.5 0.02 60)", fg: "oklch(1 0 0)" },
];

type Props = {
  onClose: () => void;
};

export function TweaksPanel({ onClose }: Props) {
  function applyAccent(value: string, fg: string) {
    document.documentElement.style.setProperty("--accent", value);
    document.documentElement.style.setProperty("--accent-foreground", fg);
  }

  return (
    <div className="absolute top-12 right-0 z-30 w-56 bg-card border border-border rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Accent color
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close accent panel"
        >
          <X size={12} aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ACCENTS.map((a) => (
          <button
            key={a.label}
            type="button"
            title={a.label}
            aria-label={`Use ${a.label} accent`}
            onClick={() => applyAccent(a.value, a.fg)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-2 border-transparent transition-[border-color,transform] motion-safe:hover:scale-105 motion-reduce:hover:scale-100 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: a.value }}
          />
        ))}
      </div>
    </div>
  );
}
