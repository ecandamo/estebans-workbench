"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Trash2, Plus, Loader2, Link } from "lucide-react";
import { cn } from "@/lib/utils";

interface Invite {
  token: string;
  email: string | null;
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
  usedByName: string | null;
  usedByEmail: string | null;
  url: string;
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InviteRow({ invite, onRevoke }: { invite: Invite; onRevoke: (token: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const isUsed = Boolean(invite.usedAt);
  const isExpired = !isUsed && invite.expiresAt != null && new Date(invite.expiresAt) < new Date();

  function copyLink() {
    navigator.clipboard.writeText(invite.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleRevoke() {
    setRevoking(true);
    try {
      const res = await fetch(`/api/invites/${encodeURIComponent(invite.token)}`, {
        method: "DELETE",
      });
      if (res.ok) onRevoke(invite.token);
    } finally {
      setRevoking(false);
    }
  }

  let status: string;
  let statusColor: string;
  if (isUsed) {
    status = "Used";
    statusColor = "text-muted-foreground";
  } else if (isExpired) {
    status = "Expired";
    statusColor = "text-destructive";
  } else {
    status = "Active";
    statusColor = "text-success";
  }

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card px-4 py-3 text-sm">
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium", statusColor)}>{status}</span>
          {invite.email && (
            <>
              <span className="text-border">·</span>
              <span className="text-xs text-muted-foreground truncate">{invite.email}</span>
            </>
          )}
        </div>
        {isUsed ? (
          <p className="text-xs text-muted-foreground">
            Used by{" "}
            <span className="font-medium text-foreground">
              {invite.usedByName ?? invite.usedByEmail ?? "unknown"}
            </span>{" "}
            on {fmt(invite.usedAt)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground font-mono truncate">{invite.url}</p>
        )}
        <p className="text-xs text-muted-foreground/60">
          Created {fmt(invite.createdAt)}
          {invite.expiresAt ? ` · Expires ${fmt(invite.expiresAt)}` : ""}
        </p>
      </div>

      {!isUsed && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy invite link"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={revoking}
            aria-label="Revoke invite"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {revoking ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}

export function InviteManager() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newDays, setNewDays] = useState("");
  const [mintedUrl, setMintedUrl] = useState<string | null>(null);
  const [copiedMinted, setCopiedMinted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadInvites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invites");
      if (res.ok) {
        const data = await res.json() as { invites: Invite[] };
        setInvites(data.invites);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadInvites(); }, [loadInvites]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setMintedUrl(null);
    setCreating(true);

    try {
      const body: { email?: string; expiresInDays?: number } = {};
      if (newEmail.trim()) body.email = newEmail.trim();
      if (newDays.trim()) body.expiresInDays = parseInt(newDays, 10);

      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        setFormError(d.error ?? "Failed to create invite");
        return;
      }

      const data = await res.json() as { url: string };
      setMintedUrl(data.url);
      setNewEmail("");
      setNewDays("");
      await loadInvites();
    } finally {
      setCreating(false);
    }
  }

  function copyMinted() {
    if (!mintedUrl) return;
    navigator.clipboard.writeText(mintedUrl).then(() => {
      setCopiedMinted(true);
      setTimeout(() => setCopiedMinted(false), 2000);
    });
  }

  function handleRevoke(token: string) {
    setInvites((prev) => prev.filter((i) => i.token !== token));
  }

  const active = invites.filter((i) => !i.usedAt && (!i.expiresAt || new Date(i.expiresAt) >= new Date()));
  const past = invites.filter((i) => i.usedAt || (i.expiresAt && new Date(i.expiresAt) < new Date()));

  const inputCls =
    "min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";

  const sectionHeading =
    "text-label font-semibold uppercase tracking-widest text-muted-foreground";

  return (
    <div className="space-y-8">
      {/* Mint form */}
      <section className="space-y-4">
        <h2 className={sectionHeading}>New invite</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="invite-email" className="text-xs font-medium text-foreground">
              Email <span className="font-normal text-muted-foreground">(optional — pre-binds to one address)</span>
            </label>
            <input
              id="invite-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="manager@example.com"
              className={inputCls}
            />
          </div>
          <div className="w-32 space-y-1.5">
            <label htmlFor="invite-days" className="text-xs font-medium text-foreground">
              Expires in
            </label>
            <input
              id="invite-days"
              type="number"
              min={1}
              max={365}
              value={newDays}
              onChange={(e) => setNewDays(e.target.value)}
              placeholder="days"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-[opacity,background-color] duration-150 hover:opacity-90 dark:hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {creating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {creating ? "Creating…" : "Create invite"}
          </button>
        </form>

        {formError && (
          <p role="alert" className="text-xs text-destructive">{formError}</p>
        )}

        {mintedUrl && (
          <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
            <Link size={14} className="shrink-0 text-success" />
            <span className="flex-1 truncate font-mono text-xs text-foreground">{mintedUrl}</span>
            <button
              type="button"
              onClick={copyMinted}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-success transition-[opacity,background-color] duration-150 hover:bg-success/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copiedMinted ? <Check size={12} /> : <Copy size={12} />}
              {copiedMinted ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </section>

      {/* Active invites */}
      <section className="space-y-3">
        <h2 className={sectionHeading}>Active</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active invites.</p>
        ) : (
          <div className="space-y-2">
            {active.map((inv) => (
              <InviteRow key={inv.token} invite={inv} onRevoke={handleRevoke} />
            ))}
          </div>
        )}
      </section>

      {/* Past invites */}
      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className={sectionHeading}>History</h2>
          <div className="space-y-2">
            {past.map((inv) => (
              <InviteRow key={inv.token} invite={inv} onRevoke={handleRevoke} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
