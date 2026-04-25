import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { InviteManager } from "./invite-manager";

export const metadata = { title: "Invites — Workbench" };

export default async function AdminInvitesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdmin(session)) redirect("/");

  return (
    <main className="min-h-full bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Invites
          </h1>
          <p className="text-sm text-muted-foreground">
            Mint invite links and share them. Each link can only be used once.
          </p>
        </div>

        <InviteManager />
      </div>
    </main>
  );
}
