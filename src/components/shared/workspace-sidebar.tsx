"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/kanban";

type Props = {
  workspaces: Workspace[];
  activeId: string;
  onSelect: (id: string) => void;
  onAddWorkspace?: (name: string) => void;
  readOnly: boolean;
};

export function WorkspaceSidebar({ workspaces, activeId, onSelect, onAddWorkspace, readOnly }: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function submitNewWorkspace() {
    const trimmed = newName.trim();
    if (!trimmed || !onAddWorkspace) return;
    onAddWorkspace(trimmed);
    setNewName("");
    setAdding(false);
  }
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
          <button
            key={ws.id}
            onClick={() => onSelect(ws.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
              ws.id === activeId
                ? "bg-accent/15 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {ws.name}
          </button>
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
                  if (e.key === "Escape") {
                    setAdding(false);
                    setNewName("");
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs px-2.5 py-1 rounded-md bg-foreground text-background hover:opacity-90"
                  onClick={submitNewWorkspace}
                >
                  Create
                </button>
                <button
                  type="button"
                  className="text-xs px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setAdding(false);
                    setNewName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
              onClick={() => setAdding(true)}
            >
              + New workspace
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
