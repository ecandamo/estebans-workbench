import type { Priority } from "@/types/kanban";

/**
 * Token-based priority chips — work in light and dark.
 * Note: `text-accent-foreground` is for solid accent surfaces; on `bg-accent/15`
 * it stays dark in dark mode and fails contrast — use `text-foreground` on tinted fills.
 */
export const priorityChipClass: Record<Priority, string> = {
  high:
    "bg-destructive/12 text-destructive border border-destructive/25",
  medium:
    "bg-accent/15 text-foreground border border-accent/40",
  low: "bg-muted text-muted-foreground border border-border",
};

/** Full names for forms and accessible labels */
export const priorityLabel: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

/** Short labels for dense chips on board tiles */
export const priorityLabelCompact: Record<Priority, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};
