"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

function AuthPageContent() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const redirectTo = useMemo(() => {
    const value = searchParams.get("returnTo");
    if (!value) return "/chat";
    if (!value.startsWith("/") || value.startsWith("//")) {
      return "/chat";
    }
    return value;
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn("password", {
        email,
        password,
        flow: mode
      });
      setPendingRedirect(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated || pendingRedirect) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <p className="text-muted-foreground">
          {pendingRedirect ? "Signing in..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 overflow-auto">
      <div className="mx-auto flex w-full max-w-md items-start px-4 py-8 sm:px-6 lg:px-8 md:py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {mode === "signIn" ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "signIn"
                ? "Sign in to your Zekher account."
                : "Create an account to unlock sharing and saved identity."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={8}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Submitting..."
                  : mode === "signIn"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "signIn" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setMode("signUp")}
                    className="underline hover:text-foreground"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("signIn")}
                    className="underline hover:text-foreground"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuthPageFallback() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}
