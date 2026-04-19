export type Priority = "high" | "medium" | "low";

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type ActivityEntry = {
  id: string;
  text: string;
  timestamp: string;
};

export type KanbanCard = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  checklist: ChecklistItem[];
  links: string[];
  activity: ActivityEntry[];
  stageId: string;
  workspaceId: string;
};

export type Stage = {
  id: string;
  name: string;
  cardIds: string[];
};

export type Workspace = {
  id: string;
  name: string;
  stages: Stage[];
};

export type BoardState = {
  workspaces: Workspace[];
  cards: Record<string, KanbanCard>;
  activeWorkspaceId: string;
};
