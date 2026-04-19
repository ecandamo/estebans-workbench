"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { priorityChipClass, priorityLabelCompact } from "@/lib/priority-styles";
import type { KanbanCard, Priority } from "@/types/kanban";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(iso: string): boolean {
  return new Date(iso) < new Date(new Date().toDateString());
}

type Props = {
  card: KanbanCard;
  readOnly: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  /** Alt+ArrowLeft / Alt+ArrowRight moves the card between columns (when not read-only). */
  onKeyboardColumnMove?: (delta: -1 | 1) => void;
};

export function KanbanCardTile({
  card,
  readOnly,
  onClick,
  onDragStart,
  onKeyboardColumnMove,
}: Props) {
  const skipOpenAfterDrag = useRef(false);
  const done = card.checklist.filter((i) => i.done).length;
  const total = card.checklist.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdue = card.dueDate && isOverdue(card.dueDate);

  function handleDragStart(e: React.DragEvent) {
    skipOpenAfterDrag.current = false;
    onDragStart(e);
  }

  function handleDragEnd() {
    skipOpenAfterDrag.current = true;
  }

  function handleClick() {
    if (skipOpenAfterDrag.current) {
      skipOpenAfterDrag.current = false;
      return;
    }
    onClick();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (readOnly || !onKeyboardColumnMove) return;
    if (!e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onKeyboardColumnMove(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onKeyboardColumnMove(1);
    }
  }

  return (
    <button
      type="button"
      draggable={!readOnly}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group w-full text-left bg-card border border-border rounded-lg p-3 cursor-pointer select-none",
        "hover:shadow-[var(--shadow-card-hover)] hover:border-border/80 transition-[box-shadow,border-color,opacity] duration-150",
        !readOnly && "active:opacity-70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-board"
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-[3px] shrink-0 text-[0.5625rem] leading-none font-normal uppercase tracking-normal px-0.5 py-px rounded-[2px]",
            priorityChipClass[card.priority as Priority]
          )}
          aria-label={`Priority: ${priorityLabelCompact[card.priority as Priority]}`}
        >
          {priorityLabelCompact[card.priority as Priority]}
        </span>
        <p className="text-sm font-medium text-foreground leading-snug">{card.title}</p>
      </div>

      {total > 0 && (
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-[3px] rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-[width] duration-200 motion-reduce:transition-none"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-label text-muted-foreground shrink-0">
            {done}/{total}
          </span>
        </div>
      )}

      {card.dueDate && (
        <p
          className={cn(
            "mt-2 text-label leading-tight tabular-nums",
            overdue ? "text-destructive font-medium" : "text-muted-foreground"
          )}
        >
          {overdue ? "Overdue · " : ""}
          {formatDate(card.dueDate)}
        </p>
      )}
    </button>
  );
}
