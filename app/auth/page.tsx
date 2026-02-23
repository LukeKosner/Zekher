"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
  CardTitle,
} from "@/components/ui/card";

type AuthMode = "signIn" | "signUp" | "resetPassword";
type AuthStep =
  | "credentials"
  | "emailVerification"
  | "resetRequest"
  | "resetVerification";

function AuthPageContent() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>("signIn");
  const [step, setStep] = useState<AuthStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const redirectTo = useMemo(() => {
    const value = searchParams.get("returnTo");
    if (!value) return "/chat";
    if (!value.startsWith("/") || value.startsWith("//")) return "/chat";
    return value;
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const clearStatus = () => {
    setError(null);
    setMessage(null);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    clearStatus();
    setCode("");
    setPassword("");
    setNewPassword("");
    setStep(nextMode === "resetPassword" ? "resetRequest" : "credentials");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();
    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    try {
      if (!trimmedEmail) {
        setError("Email is required.");
        return;
      }

      if (step === "credentials") {
        if (!password.trim()) {
          setError("Password is required.");
          return;
        }

        const result = await signIn("password", {
          email: trimmedEmail,
          password,
          flow: mode,
        });
        if (result.signingIn) {
          setPendingRedirect(true);
          return;
        }

        setStep("emailVerification");
        setMessage("Check your email for a verification code.");
        return;
      }

      if (step === "emailVerification") {
        if (!trimmedCode) {
          setError("Verification code is required.");
          return;
        }

        const result = await signIn("password", {
          email: trimmedEmail,
          code: trimmedCode,
          flow: "email-verification",
        });
        if (result.signingIn) {
          setPendingRedirect(true);
          return;
        }

        setMessage("Verification code sent. Check your email.");
        return;
      }

      if (step === "resetRequest") {
        const result = await signIn("password", {
          email: trimmedEmail,
          flow: "reset",
        });
        if (result.signingIn) {
          setPendingRedirect(true);
          return;
        }

        setStep("resetVerification");
        setMessage("Check your email for a password reset code.");
        return;
      }

      if (!trimmedCode) {
        setError("Verification code is required.");
        return;
      }
      if (!newPassword.trim()) {
        setError("New password is required.");
        return;
      }

      const result = await signIn("password", {
        email: trimmedEmail,
        code: trimmedCode,
        newPassword,
        flow: "reset-verification",
      });
      if (result.signingIn) {
        setPendingRedirect(true);
        return;
      }

      setMode("signIn");
      setStep("credentials");
      setCode("");
      setPassword("");
      setNewPassword("");
      setMessage("Password updated. Sign in with your new password.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      if (message.includes("InvalidAccountId")) {
        setError("No account found for this email. Try signing up first.");
      } else if (message.includes("JWT_PRIVATE_KEY")) {
        setError("Authentication is temporarily unavailable. Please try again later.");
      } else {
        setError(message);
      }
    } finally {
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
              {mode === "resetPassword"
                ? "Reset Password"
                : mode === "signIn"
                  ? "Sign In"
                  : "Create Account"}
            </CardTitle>
            <CardDescription>
              {step === "emailVerification" &&
                "Enter the verification code sent to your email."}
              {step === "resetRequest" &&
                "Request a one-time code to reset your password."}
              {step === "resetVerification" &&
                "Enter your reset code and set a new password."}
              {step === "credentials" &&
                (mode === "signIn"
                  ? "Sign in to your Zekher account."
                  : "Create an account to unlock sharing and saved identity.")}
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
                  disabled={step === "emailVerification" || step === "resetVerification"}
                />
              </div>

              {step === "credentials" && (
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
              )}

              {(step === "emailVerification" || step === "resetVerification") && (
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                    placeholder="Enter code"
                    required
                  />
                </div>
              )}

              {step === "resetVerification" && (
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    required
                    minLength={8}
                  />
                </div>
              )}

              {message && (
                <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                  {message}
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Submitting..."
                  : step === "credentials"
                    ? mode === "signIn"
                      ? "Sign In"
                      : "Create Account"
                    : step === "emailVerification"
                      ? "Verify Email"
                      : step === "resetRequest"
                        ? "Send Reset Code"
                        : "Reset Password"}
              </Button>
            </form>

            {mode !== "resetPassword" && step === "credentials" && (
              <p className="text-center text-sm text-muted-foreground">
                {mode === "signIn" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signUp")}
                      className="underline hover:text-foreground"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signIn")}
                      className="underline hover:text-foreground"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            )}

            {mode === "signIn" && step === "credentials" && (
              <p className="text-center text-sm text-muted-foreground">
                Forgot your password?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("resetPassword")}
                  className="underline hover:text-foreground"
                >
                  Reset it
                </button>
              </p>
            )}

            {mode === "resetPassword" && (
              <p className="text-center text-sm text-muted-foreground">
                Back to{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signIn")}
                  className="underline hover:text-foreground"
                >
                  Sign in
                </button>
              </p>
            )}

            {(step === "emailVerification" || step === "resetVerification") && (
              <p className="text-center text-sm text-muted-foreground">
                Didn&apos;t get a code?{" "}
                <button
                  type="button"
                  onClick={() =>
                    setStep(
                      mode === "resetPassword" ? "resetRequest" : "credentials"
                    )
                  }
                  className="underline hover:text-foreground"
                >
                  Send again
                </button>
              </p>
            )}
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
