"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Mode = "sign-in" | "sign-up";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const redirectTo = searchParams.get("redirectedFrom") || "/dashboard";
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    let mounted = true;
    async function checkUser() {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (user) {
        router.push(redirectTo);
      } else {
        setIsCheckingAuth(false);
      }
    }
    checkUser();
    return () => {
      mounted = false;
    };
  }, [router, redirectTo]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push(redirectTo);
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setCheckEmail(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 sm:p-10 text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
              Check your email
            </h2>
            <p className="text-gray-600 mb-8">
              We&apos;ve sent a verification link to <span className="font-semibold text-gray-900">{email}</span>.
              <br />
              Please check your inbox to authenticate your account.
            </p>
            <button
              onClick={() => {
                setCheckEmail(false);
                setMode("sign-in");
              }}
              className="font-semibold text-amber-600 hover:text-amber-500"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {isCheckingAuth ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 animate-pulse">Checking authentication...</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {mode === "sign-in" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              {mode === "sign-in"
                ? "Sign in to continue to your SAT study plans"
                : "Start planning your SAT study sessions today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold leading-6 text-gray-900 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-0 px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold leading-6 text-gray-900 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border-0 px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800" role="alert">
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? mode === "sign-in"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "sign-in"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <button
              type="button"
              onClick={() => {
                setMode((prev) => (prev === "sign-in" ? "sign-up" : "sign-in"));
                setError(null);
              }}
              className="font-semibold text-amber-600 hover:text-amber-500"
            >
              {mode === "sign-in"
                ? "Don&apos;t have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="font-semibold text-gray-900 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
