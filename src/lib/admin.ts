type SessionLike = { user: { email: string } };

/** Server-side admin check (reads ADMIN_EMAILS). */
const adminEmails: Set<string> = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export function isAdmin(session: SessionLike): boolean {
  return adminEmails.has(session.user.email.toLowerCase());
}

/**
 * Client-side admin check — reads NEXT_PUBLIC_ADMIN_EMAILS (comma-separated).
 * Keep NEXT_PUBLIC_ADMIN_EMAILS in sync with ADMIN_EMAILS in your env.
 */
export function isAdminEmail(email: string): boolean {
  const publicList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return publicList.includes(email.toLowerCase());
}
