"use client";

import { useState, useEffect, useId } from "react";
import {
  Close,
  Content,
  Description,
  Dialog,
  Overlay,
  Portal,
  Title,
} from "@radix-ui/react-dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/kanban-data";
import { priorityChipClass, priorityLabel } from "@/lib/priority-styles";
import type { KanbanCard, Priority, ChecklistItem } from "@/types/kanban";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

function formatTs(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  card: KanbanCard;
  stages: { id: string; name: string }[];
  onMoveToStage?: (stageId: string) => void;
  readOnly: boolean;
  onUpdate: (card: KanbanCard) => void;
  onClose: () => void;
  onDelete?: () => void;
};

export function CardDrawer({
  card,
  stages,
  onMoveToStage,
  readOnly,
  onUpdate,
  onClose,
  onDelete,
}: Props) {
  const [local, setLocal] = useState<KanbanCard>(card);
  const [comment, setComment] = useState("");
  const commentFieldId = useId();

  useEffect(() => {
    setLocal(card);
  }, [card]);

  function patch(partial: Partial<KanbanCard>) {
    const updated = { ...local, ...partial };
    setLocal(updated);
    onUpdate(updated);
  }

  function toggleChecklist(id: string) {
    const checklist = local.checklist.map((i) =>
      i.id === id ? { ...i, done: !i.done } : i
    );
    patch({ checklist });
  }

  function addChecklistItem() {
    const item: ChecklistItem = { id: generateId(), text: "New item", done: false };
    patch({ checklist: [...local.checklist, item] });
  }

  function updateChecklistText(id: string, text: string) {
    const checklist = local.checklist.map((i) => (i.id === id ? { ...i, text } : i));
    patch({ checklist });
  }

  function removeChecklistItem(id: string) {
    patch({ checklist: local.checklist.filter((i) => i.id !== id) });
  }

  function submitComment() {
    if (!comment.trim()) return;
    const entry = { id: generateId(), text: comment.trim(), timestamp: new Date().toISOString() };
    patch({ activity: [...local.activity, entry] });
    setComment("");
  }

  const done = local.checklist.filter((i) => i.done).length;
  const total = local.checklist.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Overlay className="fixed inset-0 z-40 bg-background/70 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Content
          className={cn(
            "fixed top-0 right-0 z-50 flex h-full w-[min(100vw,420px)] flex-col overflow-hidden border-l border-border bg-card shadow-xl outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200"
          )}
          onOpenAutoFocus={(e) => {
            const root = e.currentTarget as HTMLElement | null;
            if (!root) return;
            const target = root.querySelector<HTMLElement>(
              "[data-autofocus-card-drawer]"
            );
            if (target) {
              e.preventDefault();
              target.focus();
            }
          }}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
            {readOnly ? (
              <Title className="text-sm font-medium text-foreground pr-3">
                {local.title}
              </Title>
            ) : (
              <>
                <Title className="sr-only">Edit card: {local.title}</Title>
                <input
                  data-autofocus-card-drawer
                  className="mr-3 flex-1 border-b border-transparent bg-transparent text-sm font-medium text-foreground outline-none transition-[border-color] focus:border-border"
                  aria-label="Card title"
                  value={local.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </>
            )}
            <Close asChild>
              <button
                type="button"
                className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close card details"
              >
                <X size={16} aria-hidden />
              </button>
            </Close>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
            <Description className="sr-only">
              Card details, checklist, activity, and comments for this work item.
            </Description>

            {/* Column + priority row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={readOnly}
                    onClick={() => patch({ priority: p })}
                    className={cn(
                      "rounded-sm border px-1.5 py-0.5 text-[0.5625rem] font-medium uppercase tracking-normal leading-none transition-[background-color,border-color,color]",
                      local.priority === p
                        ? priorityChipClass[p]
                        : "border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {priorityLabel[p]}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex min-w-0 items-center gap-2">
                <label
                  htmlFor={`card-stage-${local.id}`}
                  className="text-xs text-muted-foreground shrink-0"
                >
                  Column
                </label>
                {readOnly ? (
                  <span className="text-xs text-muted-foreground">
                    {stages.find((s) => s.id === local.stageId)?.name ?? "—"}
                  </span>
                ) : (
                  <select
                    id={`card-stage-${local.id}`}
                    className="max-w-[200px] rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none transition-[border-color] focus:border-accent"
                    value={local.stageId}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next !== local.stageId) {
                        onMoveToStage?.(next);
                      }
                    }}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-label font-semibold uppercase tracking-widest text-muted-foreground">
                Description
              </p>
              {readOnly ? (
                <p className="text-sm leading-relaxed text-foreground/80">
                  {local.description || "—"}
                </p>
              ) : (
                <textarea
                  className="w-full resize-none rounded-md border border-border bg-muted/40 px-3 py-2 text-sm leading-relaxed text-foreground/80 outline-none transition-[border-color] focus:border-accent"
                  rows={3}
                  value={local.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-label font-semibold uppercase tracking-widest text-muted-foreground">
                  Checklist {total > 0 && `· ${done}/${total}`}
                </p>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-11 min-w-11 flex items-center justify-center"
                    aria-label="Add checklist item"
                  >
                    <Plus size={13} aria-hidden />
                  </button>
                )}
              </div>

              {total > 0 && (
                <div className="mb-3 h-[3px] overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-200 motion-reduce:transition-none"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                {local.checklist.map((item) => (
                  <div key={item.id} className="group/item flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-accent h-4 w-4 shrink-0"
                      checked={item.done}
                      disabled={readOnly}
                      onChange={() => toggleChecklist(item.id)}
                      aria-label={`Done: ${item.text}`}
                    />
                    {readOnly ? (
                      <span
                        className={cn(
                          "flex-1 text-sm",
                          item.done && "text-muted-foreground line-through"
                        )}
                      >
                        {item.text}
                      </span>
                    ) : (
                      <input
                        className={cn(
                          "min-w-0 flex-1 border-b border-transparent bg-transparent text-sm outline-none transition-[border-color] focus:border-border",
                          item.done && "text-muted-foreground line-through"
                        )}
                        aria-label="Checklist item text"
                        value={item.text}
                        onChange={(e) => updateChecklistText(item.id, e.target.value)}
                      />
                    )}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(item.id)}
                        className="min-h-11 min-w-11 shrink-0 rounded-md p-2 text-muted-foreground opacity-0 transition-[opacity,color] group-hover/item:opacity-100 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Remove checklist item: ${item.text}`}
                      >
                        <Trash2 size={11} aria-hidden />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-label font-semibold uppercase tracking-widest text-muted-foreground">
                Activity
              </p>
              <div className="space-y-2">
                {[...local.activity].reverse().map((entry) => (
                  <div key={entry.id} className="flex gap-2 text-xs">
                    <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                      {formatTs(entry.timestamp)}
                    </span>
                    <span className="text-foreground/70">{entry.text}</span>
                  </div>
                ))}
                {local.activity.length === 0 && (
                  <p className="text-xs text-muted-foreground">No activity yet.</p>
                )}
              </div>
            </div>

            {!readOnly && (
              <div>
                <label
                  htmlFor={commentFieldId}
                  className="mb-1.5 block text-label font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Add comment
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    id={commentFieldId}
                    className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm outline-none transition-[border-color] focus:border-accent"
                    placeholder="Leave a note..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitComment();
                    }}
                  />
                  <button
                    type="button"
                    onClick={submitComment}
                    className="min-h-11 rounded-md bg-foreground px-3 text-xs text-background transition-opacity hover:opacity-80"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>

          {!readOnly && onDelete && (
            <div className="shrink-0 border-t border-border bg-card px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm("Delete this card? This cannot be undone.")
                  ) {
                    onDelete();
                  }
                }}
                className="text-xs font-medium text-destructive transition-colors hover:text-destructive/90"
              >
                Delete card
              </button>
            </div>
          )}
        </Content>
      </Portal>
    </Dialog>
  );
}
