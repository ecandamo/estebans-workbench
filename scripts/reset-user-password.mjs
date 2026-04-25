#!/usr/bin/env node
/**
 * Reset a user's password by updating the credential account row in Postgres.
 * Uses the same scrypt format as @better-auth/utils/password (must match better-auth).
 *
 * Usage (from repo root, loads DATABASE_URL from .env.local):
 *   node --env-file=.env.local scripts/reset-user-password.mjs <email> <newPassword>
 *
 * The new password must be at least 10 characters (same as minPasswordLength in src/lib/auth.ts).
 */
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "@better-auth/utils/password";

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  if (!email || !newPassword) {
    console.error("Usage: node --env-file=.env.local scripts/reset-user-password.mjs <email> <newPassword>");
    process.exit(1);
  }
  if (newPassword.length < 10) {
    console.error("Password must be at least 10 characters (app enforces this on sign-in).");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL. Use: node --env-file=.env.local ...");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const hashed = await hashPassword(newPassword);

  const updated = await sql`
    UPDATE account
    SET password = ${hashed},
        "updatedAt" = NOW()
    WHERE "providerId" = 'credential'
      AND "userId" = (SELECT id FROM "user" WHERE LOWER(email) = LOWER(${email}))
    RETURNING id, "userId"
  `;

  if (updated.length === 0) {
    console.error("No credential account found for that email. Check the address or that the user signed up with email/password.");
    process.exit(1);
  }

  console.log(`Password updated for ${email} (account id: ${updated[0].id}). You can sign in at /login.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
