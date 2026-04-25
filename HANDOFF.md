# HANDOFF

## Project Summary

Workbench — invite-only multi-user personal Kanban. Each user gets their own isolated board, workspaces, and cards. Auth via Better Auth (email + password). Boards persisted in Neon Postgres. Share links let non-users view a board read-only.

## Current Status

- State: working
- Working now:
  - Per-user boards (isolated by `owner_id` in `workbench` table)
  - Invite-only sign-up: admin mints a link → user visits it → form unlocks sign-up → redeem API creates account atomically
  - Admin UI at `/admin/invites` (mint, copy, revoke invites)
  - Account menu in TopBar (name, sign out, admin link)
  - Personalized wordmark ("Esteban's Workbench", "Sarah's Workbench", etc.)
  - Share links show the owner's name
- Not finished:
  - Email-based invite delivery (user copies link manually for now)
  - Password reset flow
  - Email verification
- Blockers:
  - None

## Last Session Changes

- Added `invite` table to Neon (token, email, created_by, expires_at, used_by, used_at)
- `src/lib/admin.ts` — `isAdmin()` (server) and `isAdminEmail()` (client)
- `src/app/api/invites/route.ts` — POST (mint), GET (list)
- `src/app/api/invites/[token]/route.ts` — DELETE (revoke)
- `src/app/api/invites/[token]/redeem/route.ts` — POST: validates invite → creates user → marks used
- `src/app/login/page.tsx` — sign-up only visible when `?invite=TOKEN` in URL; calls /redeem
- `src/app/admin/invites/` — server page + client InviteManager component
- `src/components/shared/workbench-wordmark.tsx` — accepts `ownerName` prop
- `src/components/shared/top-bar.tsx` — account menu with sign-out + admin link
- `src/app/page.tsx` — passes ownerName and account info to TopBar; wires signOut
- `src/app/api/share/[token]/route.ts` — returns `ownerName` from user join
- `src/app/share/[token]/page.tsx` — renders owner's name in wordmark
- `src/app/layout.tsx` — generic "Workbench" title
- `src/lib/auth.ts` — trustedOrigins + minPasswordLength: 10
- Added `runtime = "nodejs"` to all auth-using API routes

## Files Touched

- `src/lib/auth.ts`
- `src/lib/admin.ts` (new)
- `src/lib/db.ts`
- `src/app/api/invites/route.ts` (new)
- `src/app/api/invites/[token]/route.ts` (new)
- `src/app/api/invites/[token]/redeem/route.ts` (new)
- `src/app/api/auth/[...all]/route.ts`
- `src/app/api/workbench/route.ts`
- `src/app/api/workbench/share/route.ts`
- `src/app/api/share/[token]/route.ts`
- `src/app/admin/invites/page.tsx` (new)
- `src/app/admin/invites/invite-manager.tsx` (new)
- `src/app/login/page.tsx`
- `src/app/share/[token]/page.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/shared/workbench-wordmark.tsx`
- `src/components/shared/top-bar.tsx`
- `.env.local`
- `scripts/reset-user-password.mjs` (new)
- `package.json` (reset-password script)

## Open Issues

- Vercel env vars need to be set manually (see below)
- No email delivery for invites yet — copy the link from `/admin/invites`
- In-app “forgot password” email flow not implemented (use `scripts/reset-user-password.mjs` to set a new hash in Neon; see below)

## Next Best Step

- Primary next action: Add the env vars below to Vercel, then deploy
- Secondary action: Wire invite email delivery (Resend / Postmark) once deployed

## Required Env Vars on Vercel

Add these in **Vercel → Project → Settings → Environment Variables** for Production (and Preview):

| Variable | Value |
|---|---|
| `DATABASE_URL` | (existing Neon connection string) |
| `BETTER_AUTH_SECRET` | (existing secret) |
| `BETTER_AUTH_URL` | `https://your-production-domain.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-production-domain.com` |
| `ADMIN_EMAILS` | `esteban.candamo@gmail.com` |
| `NEXT_PUBLIC_ADMIN_EMAILS` | `esteban.candamo@gmail.com` |

## How to reset a password (DB / local)

Use the same scrypt hasher as Better Auth (`@better-auth/utils/password`). From the repo root:

```bash
npm run reset-password -- you@example.com "YourNewPassword10+chars"
```

This updates the `account` row for `providerId = 'credential'`. Requires `DATABASE_URL` in `.env.local` (the script uses `node --env-file=.env.local`).

## How to Invite a User

1. Sign in as admin at `/login`
2. Click your avatar initials → "Manage invites"
3. Optionally enter their email (pre-binds the invite), optionally set an expiry
4. Click "Create invite" → copy the link
5. Send the link to the person — they visit it and see the sign-up form

## Guardrails

- Each user's board is fully isolated by `owner_id`; no cross-user data access
- Invite tokens are single-use; redeem marks them atomically
- Sign-up is blocked without a valid invite token
- Admin access is controlled by `ADMIN_EMAILS` env var (server) + `NEXT_PUBLIC_ADMIN_EMAILS` (client UI only — not a security boundary)

## Known Decisions

- Invite-only sign-up (no open registration)
- Personalized wordmark per user ("Name's Workbench")
- Admin emails are set via env var, not a DB role flag
- No email delivery yet — admin copies and pastes invite links
- `minPasswordLength: 10` enforced at the Better Auth layer
