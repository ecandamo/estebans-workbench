"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { WorkbenchWordmark } from "@/components/shared/workbench-wordmark";
import { useIsClient } from "@/hooks/use-is-client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const headerCls = cn(
  "flex h-11 shrink-0 items-stretch border-b border-border",
  "bg-sidebar/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sidebar/90",
  "dark:bg-sidebar dark:backdrop-blur-none dark:supports-[backdrop-filter]:bg-sidebar",
);

const iconBtn =
  "flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();
  if (!isClient) return <div className="size-9 shrink-0" />;
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={iconBtn}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
    </button>
  );
}

/** Shared chrome header — same visual as TopBar but without board actions. */
function LoginHeader() {
  return (
    <header className={headerCls}>
      <div className="flex w-60 shrink-0 items-center px-4 sm:px-6">
        <WorkbenchWordmark />
      </div>
      <div className="flex flex-1 items-center justify-end px-4 sm:px-6">
        <ThemeToggle />
      </div>
    </header>
  );
}

/** Shown while the Suspense boundary resolves search params. */
function LoginFallback() {
  return (
    <div className="flex h-full flex-col">
      <LoginHeader />
      <div
        role="status"
        aria-live="polite"
        aria-busy
        className="flex flex-1 items-center justify-center bg-board"
      >
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

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

  const inputCls =
    "min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";

  return (
    <div className="flex h-full flex-col">
      <LoginHeader />

      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-board px-4 py-10">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-[var(--shadow-card)] p-6 space-y-6">

          {/* Card header */}
          <div className="space-y-0.5">
            <p className="font-wordmark text-base font-semibold tracking-tight text-foreground/80">
              {mode === "signin" ? "Sign in" : "Create account"}
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Open your workbench"
                : "Set up your workbench"}
            </p>
          </div>

          {/* Form */}
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
                  className={inputCls}
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
                className={inputCls}
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
                className={inputCls}
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
              className="min-h-11 w-full rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-[opacity,background-color] duration-150 hover:opacity-90 dark:hover:opacity-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </span>
              ) : mode === "signin" ? "Sign in" : "Create account"}
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
                className="font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
