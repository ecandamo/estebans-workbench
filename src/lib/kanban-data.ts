import type { BoardState, Workspace } from "@/types/kanban";

/** Default column names when opening the “new workspace” form (editable before create). */
export const DEFAULT_NEW_WORKSPACE_STAGE_NAMES = [
  "Intake",
  "Spec",
  "Build",
  "Test",
  "Live",
] as const;

/** Creates a workspace with empty columns (no cards). `stageNames` must be non-empty after trimming. */
export function createEmptyWorkspace(name: string, stageNames: string[]): Workspace {
  const names = stageNames.map((s) => s.trim()).filter(Boolean);
  if (names.length === 0) {
    throw new Error("createEmptyWorkspace: at least one stage name is required");
  }
  const wsId = `ws-${generateId()}`;
  return {
    id: wsId,
    name,
    stages: names.map((stageName) => ({
      id: `st-${generateId()}`,
      name: stageName,
      cardIds: [],
    })),
  };
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function ts(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

export const DEFAULT_BOARD_STATE: BoardState = {
  activeWorkspaceId: "ws-vibe",
  workspaces: [
    {
      id: "ws-vibe",
      name: "Vibe Coding",
      stages: [
        { id: "vc-intake", name: "Intake", cardIds: ["c1", "c2"] },
        { id: "vc-spec", name: "Spec", cardIds: ["c3"] },
        { id: "vc-build", name: "Build", cardIds: ["c4", "c5"] },
        { id: "vc-test", name: "Test", cardIds: ["c6"] },
        { id: "vc-live", name: "Live", cardIds: ["c7"] },
      ],
    },
    {
      id: "ws-sales",
      name: "Sales Collateral",
      stages: [
        { id: "sc-brief", name: "Brief", cardIds: ["c8", "c9"] },
        { id: "sc-drafting", name: "Drafting", cardIds: ["c10"] },
        { id: "sc-review", name: "Review", cardIds: ["c11"] },
        { id: "sc-approved", name: "Approved", cardIds: ["c12"] },
        { id: "sc-shipped", name: "Shipped", cardIds: ["c13"] },
      ],
    },
    {
      id: "ws-ai",
      name: "AI Initiatives",
      stages: [
        { id: "ai-idea", name: "Idea", cardIds: ["c14", "c15"] },
        { id: "ai-research", name: "Research", cardIds: ["c16"] },
        { id: "ai-proto", name: "Prototype", cardIds: ["c17"] },
        { id: "ai-validate", name: "Validating", cardIds: ["c18"] },
        { id: "ai-shipped", name: "Shipped", cardIds: [] },
      ],
    },
    {
      id: "ws-general",
      name: "General",
      stages: [
        { id: "g-backlog", name: "Backlog", cardIds: ["c19", "c20"] },
        { id: "g-progress", name: "In Progress", cardIds: ["c21"] },
        { id: "g-done", name: "Done", cardIds: ["c22"] },
      ],
    },
  ],
  cards: {
    c1: {
      id: "c1", workspaceId: "ws-vibe", stageId: "vc-intake",
      title: "Slack bot: /ask-deal",
      description: "Build a Slack command that queries deal status from Salesforce and returns a summary.",
      priority: "high", dueDate: ts(5),
      checklist: [
        { id: "cl1", text: "Define slash command spec", done: true },
        { id: "cl2", text: "Set up Slack app manifest", done: false },
        { id: "cl3", text: "SF API auth", done: false },
      ],
      links: [],
      activity: [{ id: "a1", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c2: {
      id: "c2", workspaceId: "ws-vibe", stageId: "vc-intake",
      title: "AI meeting notes → CRM",
      description: "Auto-populate CRM fields from recorded meeting transcripts using an LLM pipeline.",
      priority: "medium", dueDate: ts(12),
      checklist: [
        { id: "cl4", text: "Evaluate Fireflies vs Otter", done: true },
        { id: "cl5", text: "Design CRM field mapping", done: false },
      ],
      links: [],
      activity: [{ id: "a2", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c3: {
      id: "c3", workspaceId: "ws-vibe", stageId: "vc-spec",
      title: "Deal score dashboard",
      description: "Real-time dashboard showing AI-generated deal health scores per account.",
      priority: "high", dueDate: ts(7),
      checklist: [
        { id: "cl6", text: "Define scoring model inputs", done: true },
        { id: "cl7", text: "Wireframe dashboard layout", done: true },
        { id: "cl8", text: "API design doc", done: false },
      ],
      links: [],
      activity: [{ id: "a3", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c4: {
      id: "c4", workspaceId: "ws-vibe", stageId: "vc-build",
      title: "Email sequence generator",
      description: "Generate personalized outbound sequences using prospect data + ICP criteria.",
      priority: "medium", dueDate: ts(3),
      checklist: [
        { id: "cl9", text: "Prompt engineering", done: true },
        { id: "cl10", text: "UI for output review", done: false },
        { id: "cl11", text: "Outreach integration", done: false },
      ],
      links: [],
      activity: [{ id: "a4", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c5: {
      id: "c5", workspaceId: "ws-vibe", stageId: "vc-build",
      title: "Proposal auto-formatter",
      description: "Paste raw proposal content, get a formatted PDF with brand styling.",
      priority: "low", dueDate: null,
      checklist: [],
      links: [],
      activity: [{ id: "a5", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c6: {
      id: "c6", workspaceId: "ws-vibe", stageId: "vc-test",
      title: "Lead enrichment API",
      description: "Enrich inbound leads with LinkedIn + Clearbit data automatically on form submit.",
      priority: "high", dueDate: ts(-1),
      checklist: [
        { id: "cl12", text: "Integration tests", done: true },
        { id: "cl13", text: "Rate limit handling", done: false },
      ],
      links: [],
      activity: [{ id: "a6", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c7: {
      id: "c7", workspaceId: "ws-vibe", stageId: "vc-live",
      title: "Pipeline forecasting model",
      description: "ML model predicting close probability based on deal stage, activity, and history.",
      priority: "medium", dueDate: null,
      checklist: [
        { id: "cl14", text: "Feature engineering", done: true },
        { id: "cl15", text: "Model training", done: true },
        { id: "cl16", text: "CRM plugin", done: true },
      ],
      links: [],
      activity: [{ id: "a7", text: "Card created", timestamp: new Date().toISOString() }, { id: "a8", text: "Moved to Live", timestamp: new Date().toISOString() }],
    },
    c8: {
      id: "c8", workspaceId: "ws-sales", stageId: "sc-brief",
      title: "Q2 product one-pager",
      description: "Single-page overview of Q2 product updates for AEs to send to prospects.",
      priority: "high", dueDate: ts(4),
      checklist: [{ id: "cl17", text: "Collect feature highlights from PM", done: false }],
      links: [],
      activity: [{ id: "a9", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c9: {
      id: "c9", workspaceId: "ws-sales", stageId: "sc-brief",
      title: "Competitive battle card update",
      description: "Refresh battle cards for Competitor X after their recent feature launch.",
      priority: "medium", dueDate: ts(8),
      checklist: [],
      links: [],
      activity: [{ id: "a10", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c10: {
      id: "c10", workspaceId: "ws-sales", stageId: "sc-drafting",
      title: "ROI calculator deck",
      description: "Interactive deck showing ROI projections based on prospect team size and deal type.",
      priority: "high", dueDate: ts(6),
      checklist: [
        { id: "cl18", text: "Gather ROI benchmark data", done: true },
        { id: "cl19", text: "Slide layouts", done: false },
      ],
      links: [],
      activity: [{ id: "a11", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c11: {
      id: "c11", workspaceId: "ws-sales", stageId: "sc-review",
      title: "New customer case study",
      description: "Written case study for our largest Q1 close — needs legal sign-off.",
      priority: "medium", dueDate: ts(2),
      checklist: [
        { id: "cl20", text: "Draft written", done: true },
        { id: "cl21", text: "Customer approval", done: false },
        { id: "cl22", text: "Legal sign-off", done: false },
      ],
      links: [],
      activity: [{ id: "a12", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c12: {
      id: "c12", workspaceId: "ws-sales", stageId: "sc-approved",
      title: "Partner co-sell one-pager",
      description: "Collateral for our new GSI partnership — ready to distribute.",
      priority: "low", dueDate: null,
      checklist: [],
      links: [],
      activity: [{ id: "a13", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c13: {
      id: "c13", workspaceId: "ws-sales", stageId: "sc-shipped",
      title: "Enterprise pitch deck v3",
      description: "Full deck for enterprise segment, aligned with new positioning.",
      priority: "high", dueDate: null,
      checklist: [],
      links: [],
      activity: [{ id: "a14", text: "Card created", timestamp: new Date().toISOString() }, { id: "a15", text: "Moved to Shipped", timestamp: new Date().toISOString() }],
    },
    c14: {
      id: "c14", workspaceId: "ws-ai", stageId: "ai-idea",
      title: "Auto-qualify inbound leads",
      description: "Use LLM to score and qualify inbound leads before routing to AEs.",
      priority: "high", dueDate: null,
      checklist: [],
      links: [],
      activity: [{ id: "a16", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c15: {
      id: "c15", workspaceId: "ws-ai", stageId: "ai-idea",
      title: "GPT-powered RFP responder",
      description: "Automate first-pass RFP responses using historical winning proposals.",
      priority: "medium", dueDate: null,
      checklist: [],
      links: [],
      activity: [{ id: "a17", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c16: {
      id: "c16", workspaceId: "ws-ai", stageId: "ai-research",
      title: "Sentiment analysis on calls",
      description: "Detect objection patterns and sentiment shifts in recorded sales calls.",
      priority: "medium", dueDate: ts(14),
      checklist: [
        { id: "cl23", text: "Survey existing tools", done: true },
        { id: "cl24", text: "Proof of concept", done: false },
      ],
      links: [],
      activity: [{ id: "a18", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c17: {
      id: "c17", workspaceId: "ws-ai", stageId: "ai-proto",
      title: "Smart next-step recommender",
      description: "Recommend next best action for each deal based on stage, age, and activity.",
      priority: "high", dueDate: ts(10),
      checklist: [
        { id: "cl25", text: "Data model design", done: true },
        { id: "cl26", text: "v1 prototype", done: true },
        { id: "cl27", text: "AE pilot feedback", done: false },
      ],
      links: [],
      activity: [{ id: "a19", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c18: {
      id: "c18", workspaceId: "ws-ai", stageId: "ai-validate",
      title: "Churn risk predictor",
      description: "ML model alerting CSMs when accounts show early churn signals.",
      priority: "high", dueDate: ts(3),
      checklist: [
        { id: "cl28", text: "Model training", done: true },
        { id: "cl29", text: "Pilot with 5 CSMs", done: false },
      ],
      links: [],
      activity: [{ id: "a20", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c19: {
      id: "c19", workspaceId: "ws-general", stageId: "g-backlog",
      title: "Consolidate tool subscriptions",
      description: "Audit SaaS spend and cancel redundant tools across the sales stack.",
      priority: "low", dueDate: null,
      checklist: [],
      links: [],
      activity: [{ id: "a21", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c20: {
      id: "c20", workspaceId: "ws-general", stageId: "g-backlog",
      title: "Sales process documentation",
      description: "Document current sales motion end-to-end for onboarding new reps.",
      priority: "medium", dueDate: ts(20),
      checklist: [],
      links: [],
      activity: [{ id: "a22", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c21: {
      id: "c21", workspaceId: "ws-general", stageId: "g-progress",
      title: "Q2 OKR alignment doc",
      description: "Align all AI and sales initiatives to Q2 company OKRs.",
      priority: "high", dueDate: ts(2),
      checklist: [
        { id: "cl30", text: "Draft objectives", done: true },
        { id: "cl31", text: "Review with director", done: false },
      ],
      links: [],
      activity: [{ id: "a23", text: "Card created", timestamp: new Date().toISOString() }],
    },
    c22: {
      id: "c22", workspaceId: "ws-general", stageId: "g-done",
      title: "Onboard new SDR tooling",
      description: "Set up Outreach sequences and CRM workflows for new SDR hires.",
      priority: "medium", dueDate: null,
      checklist: [],
      links: [],
      activity: [{ id: "a24", text: "Card created", timestamp: new Date().toISOString() }, { id: "a25", text: "Moved to Done", timestamp: new Date().toISOString() }],
    },
  },
};

const STORAGE_KEY = "estebans-workbench-board";

/** Ensures active workspace points at a real row when possible; drops orphan cards; allows empty board. */
export function normalizeBoardState(state: BoardState): BoardState {
  const workspaces = state.workspaces ?? [];
  const wsIds = new Set(workspaces.map((w) => w.id));
  const cards: BoardState["cards"] = {};
  for (const [id, card] of Object.entries(state.cards ?? {})) {
    if (wsIds.has(card.workspaceId)) {
      cards[id] = card;
    }
  }

  if (workspaces.length === 0) {
    return { workspaces: [], cards: {}, activeWorkspaceId: null };
  }

  let activeWorkspaceId: string | null = state.activeWorkspaceId ?? null;
  if (!activeWorkspaceId || !wsIds.has(activeWorkspaceId)) {
    activeWorkspaceId = workspaces[0].id;
  }

  return { workspaces, cards, activeWorkspaceId };
}

export function loadBoard(): BoardState {
  if (typeof window === "undefined") return DEFAULT_BOARD_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BOARD_STATE;
    const parsed = JSON.parse(raw) as BoardState;
    return normalizeBoardState(parsed);
  } catch {
    return DEFAULT_BOARD_STATE;
  }
}

export function saveBoard(state: BoardState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
