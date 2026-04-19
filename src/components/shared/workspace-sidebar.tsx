"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { DEFAULT_NEW_WORKSPACE_STAGE_NAMES } from "@/lib/kanban-data";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/kanban";

type Props = {
  workspaces: Workspace[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAddWorkspace?: (name: string, stageNames: string[]) => void;
  onDeleteWorkspace?: (id: string) => void;
  readOnly: boolean;
};

export function WorkspaceSidebar({
  workspaces,
  activeId,
  onSelect,
  onAddWorkspace,
  onDeleteWorkspace,
  readOnly,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [stageInputs, setStageInputs] = useState<string[]>(() => [...DEFAULT_NEW_WORKSPACE_STAGE_NAMES]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function resetAddForm() {
    setNewName("");
    setStageInputs([...DEFAULT_NEW_WORKSPACE_STAGE_NAMES]);
    setAdding(false);
  }

  function submitNewWorkspace() {
    const trimmed = newName.trim();
    const stages = stageInputs.map((s) => s.trim()).filter(Boolean);
    if (!trimmed || !onAddWorkspace || stages.length === 0) return;
    onAddWorkspace(trimmed, stages);
    resetAddForm();
  }

  function updateStageRow(index: number, value: string) {
    setStageInputs((rows) => rows.map((r, i) => (i === index ? value : r)));
  }

  function removeStageRow(index: number) {
    setStageInputs((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)));
  }

  function addStageRow() {
    setStageInputs((rows) => [...rows, ""]);
  }

  useEffect(() => {
    if (pendingDeleteId == null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPendingDeleteId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingDeleteId]);

  return (
    <aside className="flex flex-col w-52 shrink-0 h-full border-r border-border bg-background">
      {/* Wordmark */}
      <div className="flex h-12 shrink-0 items-center px-5 border-b border-border">
        <span
          className="text-[1.1rem] leading-tight text-foreground whitespace-nowrap"
          style={{ fontFamily: "var(--font-roboto)" }}
        >
          <span className="italic">Esteban&apos;s</span>
          <span> Workbench</span>
        </span>
      </div>

      {/* Workspace list */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
          Workspaces
        </p>
        {workspaces.map((ws) => (
          <div key={ws.id} className="mb-1 last:mb-0">
            {pendingDeleteId === ws.id ? (
              <div
                className="rounded-md border border-border bg-muted/40 px-2.5 py-2 space-y-2"
                role="alertdialog"
                aria-labelledby={`delete-workspace-title-${ws.id}`}
              >
                <p id={`delete-workspace-title-${ws.id}`} className="text-[11px] text-foreground leading-snug">
                  Delete <span className="font-medium">{ws.name}</span>? All cards in this workspace will be
                  removed.
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => setPendingDeleteId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded-md font-medium bg-destructive/15 text-destructive hover:bg-destructive/25"
                    onClick={() => {
                      onDeleteWorkspace?.(ws.id);
                      setPendingDeleteId(null);
                    }}
                  >
                    Delete workspace
                  </button>
                </div>
              </div>
            ) : (
              <div className="group flex items-stretch gap-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => onSelect(ws.id)}
                  className={cn(
                    "min-w-0 flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors",
                    ws.id === activeId
                      ? "bg-accent/15 text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="block truncate">{ws.name}</span>
                </button>
                {!readOnly && onDeleteWorkspace && (
                  <button
                    type="button"
                    aria-label={`Delete workspace ${ws.name}`}
                    className="shrink-0 px-1.5 rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteId(ws.id);
                    }}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!readOnly && onAddWorkspace && (
        <div className="px-4 py-4 border-t border-border space-y-2">
          {adding ? (
            <div className="flex flex-col gap-2">
              <input
                autoFocus
                className="w-full text-sm bg-muted/50 border border-border rounded-md px-2.5 py-1.5 outline-none focus:border-accent"
                placeholder="Workspace name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNewWorkspace();
                  if (e.key === "Escape") resetAddForm();
                }}
              />
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">
                  Columns
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5">
                  {stageInputs.map((row, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <input
                        className="min-w-0 flex-1 text-xs bg-background border border-border rounded px-2 py-1 outline-none focus:border-accent"
                        placeholder={`Stage ${index + 1}`}
                        value={row}
                        onChange={(e) => updateStageRow(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") resetAddForm();
                        }}
                      />
                      <button
                        type="button"
                        className="shrink-0 p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                        aria-label="Remove column"
                        disabled={stageInputs.length <= 1}
                        onClick={() => removeStageRow(index)}
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={addStageRow}
                >
                  <Plus size={12} />
                  Add column
                </button>
              </div>
              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  className="text-xs px-2.5 py-1 rounded-md bg-foreground text-background hover:opacity-90 disabled:opacity-40"
                  onClick={submitNewWorkspace}
                  disabled={
                    !newName.trim() || stageInputs.every((s) => !s.trim())
                  }
                >
                  Create
                </button>
                <button
                  type="button"
                  className="text-xs px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground"
                  onClick={resetAddForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
              onClick={() => {
                setStageInputs([...DEFAULT_NEW_WORKSPACE_STAGE_NAMES]);
                setAdding(true);
              }}
            >
              + New workspace
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
