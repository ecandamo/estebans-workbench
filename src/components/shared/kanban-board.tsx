"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/kanban-data";
import { KanbanCardTile } from "./kanban-card";
import { CardDrawer } from "./card-drawer";
import type { BoardState, KanbanCard, Stage, Workspace } from "@/types/kanban";

type Props = {
  board: BoardState;
  readOnly: boolean;
  onBoardChange: (board: BoardState) => void;
};

export function KanbanBoard({ board, readOnly, onBoardChange }: Props) {
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const dragCard = useRef<{ cardId: string; fromStageId: string } | null>(null);

  const activeWsId = board.activeWorkspaceId;
  if (activeWsId == null) {
    return null;
  }
  const foundWorkspace = board.workspaces.find((w) => w.id === activeWsId);
  if (!foundWorkspace) {
    return null;
  }
  const currentWorkspace: Workspace = foundWorkspace;

  const workspaceId: string = activeWsId;

  function updateBoard(partial: Partial<BoardState>) {
    onBoardChange({ ...board, ...partial });
  }

  function updateCard(updated: KanbanCard) {
    updateBoard({ cards: { ...board.cards, [updated.id]: updated } });
  }

  function addCard(stageId: string) {
    const id = generateId();
    const card: KanbanCard = {
      id, workspaceId, stageId,
      title: "New card",
      description: "",
      priority: "medium",
      dueDate: null,
      checklist: [],
      links: [],
      activity: [{ id: generateId(), text: "Card created", timestamp: new Date().toISOString() }],
    };
    const updatedWorkspaces = board.workspaces.map((ws) =>
      ws.id !== workspaceId ? ws : {
        ...ws,
        stages: ws.stages.map((s) =>
          s.id !== stageId ? s : { ...s, cardIds: [...s.cardIds, id] }
        ),
      }
    );
    onBoardChange({
      ...board,
      workspaces: updatedWorkspaces,
      cards: { ...board.cards, [id]: card },
    });
    setOpenCardId(id);
  }

  function deleteCard(cardId: string) {
    const updatedWorkspaces = board.workspaces.map((ws) =>
      ws.id !== workspaceId
        ? ws
        : {
            ...ws,
            stages: ws.stages.map((s) => ({
              ...s,
              cardIds: s.cardIds.filter((id) => id !== cardId),
            })),
          }
    );
    const restCards = { ...board.cards };
    delete restCards[cardId];
    onBoardChange({
      ...board,
      workspaces: updatedWorkspaces,
      cards: restCards,
    });
    setOpenCardId((open) => (open === cardId ? null : open));
  }

  function moveCard(cardId: string, fromStageId: string, toStageId: string) {
    if (fromStageId === toStageId) return;

    const card = board.cards[cardId];
    const stageName = currentWorkspace.stages.find((s) => s.id === toStageId)?.name ?? toStageId;
    const updatedCard: KanbanCard = {
      ...card,
      stageId: toStageId,
      activity: [
        ...card.activity,
        { id: generateId(), text: `Moved to ${stageName}`, timestamp: new Date().toISOString() },
      ],
    };

    const updatedWorkspaces = board.workspaces.map((ws) =>
      ws.id !== workspaceId ? ws : {
        ...ws,
        stages: ws.stages.map((s) => {
          if (s.id === fromStageId) return { ...s, cardIds: s.cardIds.filter((id) => id !== cardId) };
          if (s.id === toStageId) return { ...s, cardIds: [...s.cardIds, cardId] };
          return s;
        }),
      }
    );

    onBoardChange({
      ...board,
      workspaces: updatedWorkspaces,
      cards: { ...board.cards, [cardId]: updatedCard },
    });
  }

  function handleDragStart(e: React.DragEvent, cardId: string, stageId: string) {
    dragCard.current = { cardId, fromStageId: stageId };
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetId(stageId);
  }

  function handleDrop(e: React.DragEvent, toStageId: string) {
    e.preventDefault();
    if (dragCard.current) {
      moveCard(dragCard.current.cardId, dragCard.current.fromStageId, toStageId);
      dragCard.current = null;
    }
    setDropTargetId(null);
  }

  function handleDragLeave() {
    setDropTargetId(null);
  }

  function handleCardKeyboardMove(
    cardId: string,
    fromStageId: string,
    delta: -1 | 1
  ) {
    const stages = currentWorkspace.stages;
    const idx = stages.findIndex((s) => s.id === fromStageId);
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= stages.length) return;
    moveCard(cardId, fromStageId, stages[nextIdx].id);
  }

  const openCard = openCardId ? board.cards[openCardId] : null;

  return (
    <div className="relative flex-1 flex overflow-hidden">
      {/* Board scroll area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div
          className="flex h-full min-w-max gap-4 px-4 py-5 sm:px-6"
        >
          {currentWorkspace.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              cards={stage.cardIds.map((id) => board.cards[id]).filter(Boolean)}
              readOnly={readOnly}
              isDropTarget={dropTargetId === stage.id}
              onCardClick={(id) => setOpenCardId(id)}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={handleDragLeave}
              onAddCard={() => addCard(stage.id)}
              onCardKeyboardMove={(cardId, delta) =>
                handleCardKeyboardMove(cardId, stage.id, delta)
              }
            />
          ))}
        </div>
      </div>

      {/* Card drawer */}
      {openCard && (
        <CardDrawer
          card={openCard}
          stages={currentWorkspace.stages.map((s) => ({ id: s.id, name: s.name }))}
          onMoveToStage={
            readOnly
              ? undefined
              : (stageId) => {
                  if (stageId !== openCard.stageId) {
                    moveCard(openCard.id, openCard.stageId, stageId);
                  }
                }
          }
          readOnly={readOnly}
          onUpdate={updateCard}
          onClose={() => setOpenCardId(null)}
          onDelete={readOnly ? undefined : () => deleteCard(openCard.id)}
        />
      )}
    </div>
  );
}

type ColumnProps = {
  stage: Stage;
  cards: KanbanCard[];
  readOnly: boolean;
  isDropTarget: boolean;
  onCardClick: (id: string) => void;
  onDragStart: (e: React.DragEvent, cardId: string, stageId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onAddCard: () => void;
  onCardKeyboardMove: (cardId: string, delta: -1 | 1) => void;
};

function StageColumn({
  stage, cards, readOnly, isDropTarget,
  onCardClick, onDragStart, onDragOver, onDrop, onDragLeave, onAddCard,
  onCardKeyboardMove,
}: ColumnProps) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <span className="min-w-0 truncate text-xs font-semibold text-foreground">
          {stage.name}
        </span>
        <span className="shrink-0 rounded-full bg-primary/12 px-2 py-0.5 text-center text-label font-medium tabular-nums text-primary">
          {cards.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "flex-1 rounded-xl border border-dashed transition-colors duration-150 overflow-y-auto",
          isDropTarget
            ? "border-accent/60 bg-accent/8"
            : "border-primary/12 bg-muted/25"
        )}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
      >
        <div className="space-y-2.5 p-2">
          {cards.map((card) => (
            <KanbanCardTile
              key={card.id}
              card={card}
              readOnly={readOnly}
              onClick={() => onCardClick(card.id)}
              onDragStart={(e) => onDragStart(e, card.id, stage.id)}
              onKeyboardColumnMove={
                readOnly ? undefined : (delta) => onCardKeyboardMove(card.id, delta)
              }
            />
          ))}

          {/* Add card button */}
          {!readOnly && (
            <button
              type="button"
              onClick={onAddCard}
              className="flex min-h-10 w-full items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors duration-150 hover:bg-muted/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Plus size={12} />
              Add card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
