"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/kanban-data";
import type { KanbanCard, Priority, ChecklistItem } from "@/types/kanban";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

const priorityColors: Record<Priority, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-muted text-muted-foreground border-border",
};

function formatTs(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

type Props = {
  card: KanbanCard;
  readOnly: boolean;
  onUpdate: (card: KanbanCard) => void;
  onClose: () => void;
  onDelete?: () => void;
};

export function CardDrawer({ card, readOnly, onUpdate, onClose, onDelete }: Props) {
  const [local, setLocal] = useState<KanbanCard>(card);
  const [comment, setComment] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync if card changes externally
  useEffect(() => { setLocal(card); }, [card]);

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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[420px] z-50 bg-card border-l border-border flex flex-col shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          {readOnly ? (
            <p className="text-sm font-medium text-foreground">{local.title}</p>
          ) : (
            <input
              className="flex-1 text-sm font-medium text-foreground bg-transparent outline-none border-b border-transparent focus:border-border transition-colors mr-3"
              value={local.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Priority + due date row */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  disabled={readOnly}
                  onClick={() => patch({ priority: p })}
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded border transition-all",
                    local.priority === p ? priorityColors[p] : "border-transparent text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="ml-auto">
              {readOnly ? (
                <span className="text-xs text-muted-foreground">{local.dueDate ?? "No due date"}</span>
              ) : (
                <input
                  type="date"
                  className="text-xs text-muted-foreground bg-transparent border border-border rounded px-2 py-1 outline-none focus:border-accent"
                  value={local.dueDate ?? ""}
                  onChange={(e) => patch({ dueDate: e.target.value || null })}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Description</p>
            {readOnly ? (
              <p className="text-sm text-foreground/80 leading-relaxed">{local.description || "—"}</p>
            ) : (
              <textarea
                className="w-full text-sm text-foreground/80 leading-relaxed bg-muted/40 border border-border rounded-md px-3 py-2 outline-none resize-none focus:border-accent transition-colors"
                rows={3}
                value={local.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            )}
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Checklist {total > 0 && `· ${done}/${total}`}
              </p>
              {!readOnly && (
                <button
                  onClick={addChecklistItem}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus size={13} />
                </button>
              )}
            </div>

            {total > 0 && (
              <div className="h-[3px] rounded-full bg-muted mb-3 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              {local.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group/item">
                  <input
                    type="checkbox"
                    checked={item.done}
                    disabled={readOnly}
                    onChange={() => toggleChecklist(item.id)}
                    className="accent-accent shrink-0"
                  />
                  {readOnly ? (
                    <span className={cn("text-sm flex-1", item.done && "line-through text-muted-foreground")}>
                      {item.text}
                    </span>
                  ) : (
                    <input
                      className={cn(
                        "text-sm flex-1 bg-transparent outline-none border-b border-transparent focus:border-border",
                        item.done && "line-through text-muted-foreground"
                      )}
                      value={item.text}
                      onChange={(e) => updateChecklistText(item.id, e.target.value)}
                    />
                  )}
                  {!readOnly && (
                    <button
                      onClick={() => removeChecklistItem(item.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Activity</p>
            <div className="space-y-2">
              {[...local.activity].reverse().map((entry) => (
                <div key={entry.id} className="flex gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">{formatTs(entry.timestamp)}</span>
                  <span className="text-foreground/70">{entry.text}</span>
                </div>
              ))}
              {local.activity.length === 0 && (
                <p className="text-xs text-muted-foreground">No activity yet.</p>
              )}
            </div>
          </div>

          {/* Comment */}
          {!readOnly && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Add comment</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 text-sm bg-muted/40 border border-border rounded-md px-3 py-1.5 outline-none focus:border-accent transition-colors"
                  placeholder="Leave a note..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitComment(); }}
                />
                <button
                  onClick={submitComment}
                  className="text-xs px-3 py-1.5 bg-foreground text-background rounded-md hover:opacity-80 transition-opacity"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>

        {!readOnly && onDelete && (
          <div className="border-t border-border px-5 py-3 shrink-0 bg-card">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.confirm("Delete this card? This cannot be undone.")) {
                  onDelete();
                }
              }}
              className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Delete card
            </button>
          </div>
        )}
      </div>
    </>
  );
}
