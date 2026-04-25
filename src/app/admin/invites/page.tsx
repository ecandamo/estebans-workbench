import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { AppChromeHeader } from "@/components/shared/app-chrome-header";
import { InviteManager } from "./invite-manager";

export const metadata = { title: "Invites — Workbench" };

export default async function AdminInvitesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdmin(session)) redirect("/");

  const ownerName = session.user.name?.split(" ")[0] ?? null;

  return (
    <div className="flex h-full flex-col">
      <AppChromeHeader
        ownerName={ownerName}
        trailing={
          <a
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
          >
            ← Workbench
          </a>
        }
      />

      <div className="flex-1 overflow-y-auto bg-board">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="mb-8 space-y-1">
            <h1 className="font-wordmark text-2xl font-semibold tracking-tight text-foreground">
              Invites
            </h1>
            <p className="text-sm text-muted-foreground">
              Mint invite links and share them. Each link can only be used once.
            </p>
          </div>

          <InviteManager />
        </div>
      </div>
    </div>
  );
}
