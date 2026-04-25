"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";

type Mode = "signin" | "signup";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [mode, setMode] = useState<Mode>(inviteToken ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // When invite token disappears or appears, re-sync the mode
  useEffect(() => {
    if (!inviteToken && mode === "signup") setMode("signin");
    if (inviteToken && mode === "signin") setMode("signup");
  }, [inviteToken]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!inviteToken) {
          setError("An invite link is required to create an account.");
          return;
        }

        const res = await fetch(`/api/invites/${encodeURIComponent(inviteToken)}/redeem`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string };
          setError(data.error ?? "Something didn't work. Check your details and try again.");
          return;
        }

        // Sign in immediately after account creation so the session cookie is set
        const signInResult = await signIn.email({ email, password });
        if (signInResult.error) {
          setError("Account created — please sign in.");
          setMode("signin");
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(
            result.error.message ??
              "Something didn't work. Check your email and password and try again."
          );
          return;
        }
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const fieldErrorDesc = error ? "login-form-error" : undefined;
  const canSignUp = Boolean(inviteToken);

  return (
    <main className="flex h-full items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Workbench
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to open your workbench"
              : "Create an account to use your workbench"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" aria-busy={loading}>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                aria-invalid={!!error}
                aria-describedby={fieldErrorDesc}
                className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={!!error}
              aria-describedby={fieldErrorDesc}
              className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={!!error}
              aria-describedby={fieldErrorDesc}
              className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </div>

          {error && (
            <p id="login-form-error" role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading
              ? mode === "signin"
                ? "Signing in…"
                : "Creating account…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        {canSignUp && (
          <p className="text-center text-xs text-muted-foreground">
            {mode === "signin" ? "Have an invite?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="min-h-11 min-w-[44px] font-medium text-foreground underline-offset-2 hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
