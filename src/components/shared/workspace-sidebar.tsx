"use client";

import { useState, useId } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
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
  const newWorkspaceFormId = useId();

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

  const pendingWs = pendingDeleteId
    ? workspaces.find((w) => w.id === pendingDeleteId)
    : undefined;

  return (
    <aside className="flex flex-col w-52 shrink-0 h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Wordmark */}
      <div className="flex min-h-12 shrink-0 items-center border-b border-sidebar-border bg-muted/35 px-4 sm:px-6">
        <span className="font-serif text-[1.1rem] font-semibold leading-tight tracking-tight text-foreground whitespace-nowrap">
          <span className="font-normal italic">Esteban&apos;s</span>
          <span> Workbench</span>
        </span>
      </div>

      {/* Workspace list */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-1 text-label font-semibold uppercase tracking-widest text-muted-foreground/90">
          Workspaces
        </p>
        <div className="flex flex-col gap-1">
        {workspaces.map((ws) => (
          <div key={ws.id}>
            <div className="group flex items-stretch gap-0.5 rounded-md">
              <button
                type="button"
                onClick={() => onSelect(ws.id)}
                className={cn(
                  "min-w-0 flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors",
                  ws.id === activeId
                    ? "bg-primary/12 text-foreground font-medium ring-1 ring-inset ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
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
          </div>
        ))}
        </div>
      </nav>

      <AlertDialog.Root
        open={pendingDeleteId !== null && pendingWs != null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[100] bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[min(calc(100vw-2rem),22rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-5 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <AlertDialog.Title className="text-sm font-medium text-foreground">
              Delete workspace &ldquo;{pendingWs?.name}&rdquo;?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Every card in this workspace will be deleted. You can&apos;t undo this.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="text-xs px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  className="text-xs px-3 py-2 rounded-md font-medium bg-destructive/15 text-destructive hover:bg-destructive/25"
                  onClick={() => {
                    if (pendingDeleteId && onDeleteWorkspace) {
                      onDeleteWorkspace(pendingDeleteId);
                    }
                  }}
                >
                  Delete workspace
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Footer */}
      {!readOnly && onAddWorkspace && (
        <div className="space-y-2 border-t border-sidebar-border px-3 py-4 sm:px-4">
          {adding ? (
            <div className="flex flex-col gap-2">
              <label htmlFor={`${newWorkspaceFormId}-name`} className="sr-only">
                Workspace name
              </label>
              <input
                id={`${newWorkspaceFormId}-name`}
                autoFocus
                autoComplete="off"
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
                <p
                  id={`${newWorkspaceFormId}-columns-label`}
                  className="text-label font-semibold uppercase tracking-wider text-muted-foreground px-0.5"
                >
                  Columns
                </p>
                <div
                  className="max-h-40 overflow-y-auto space-y-1 pr-0.5"
                  role="group"
                  aria-labelledby={`${newWorkspaceFormId}-columns-label`}
                >
                  {stageInputs.map((row, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <label htmlFor={`${newWorkspaceFormId}-stage-${index}`} className="sr-only">
                        {`Column ${index + 1} name`}
                      </label>
                      <input
                        id={`${newWorkspaceFormId}-stage-${index}`}
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
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
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
                  className="flex min-h-10 items-center gap-1 rounded-md px-0.5 text-meta text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
                  onClick={addStageRow}
                >
                  <Plus size={12} />
                  Add column
                </button>
              </div>
              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  className="text-xs px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
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
              className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-left"
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
