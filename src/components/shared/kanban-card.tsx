"use client";

import { cn } from "@/lib/utils";
import type { KanbanCard, Priority } from "@/types/kanban";

const priorityColors: Record<Priority, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-muted text-muted-foreground",
};

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
};

export function KanbanCardTile({ card, readOnly, onClick, onDragStart }: Props) {
  const done = card.checklist.filter((i) => i.done).length;
  const total = card.checklist.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdue = card.dueDate && isOverdue(card.dueDate);

  return (
    <div
      draggable={!readOnly}
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        "group bg-card border border-border rounded-lg p-3 cursor-pointer select-none",
        "hover:shadow-[var(--shadow-card-hover)] hover:border-border/80 transition-all duration-150",
        !readOnly && "active:opacity-70"
      )}
    >
      {/* Priority + title */}
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-[2px] shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
            priorityColors[card.priority]
          )}
        >
          {card.priority.slice(0, 3)}
        </span>
        <p className="text-sm font-medium text-foreground leading-snug">{card.title}</p>
      </div>

      {/* Checklist progress */}
      {total > 0 && (
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-[3px] rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {done}/{total}
          </span>
        </div>
      )}

      {/* Due date */}
      {card.dueDate && (
        <p
          className={cn(
            "mt-2 text-[11px]",
            overdue ? "text-red-500 font-medium" : "text-muted-foreground"
          )}
        >
          {overdue ? "Overdue · " : ""}{formatDate(card.dueDate)}
        </p>
      )}
    </div>
  );
}
