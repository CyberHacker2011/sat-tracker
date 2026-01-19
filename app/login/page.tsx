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

  const redirectTo = searchParams.get("redirectedFrom") || "/dashboard";
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    let mounted = true;
    async function checkUser() {
      const supabase = getSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
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
        // Proceed to dashboard immediately since email confirmation is disabled
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-12 bg-white">
      <div className="w-full max-w-md">
        {isCheckingAuth ? (
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-500 animate-pulse">Checking authentication...</p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-10 shadow-xl border border-gray-100">
            <div className="mb-10 text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-md ${mode === "sign-in" ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"}`}>
                {mode === "sign-in" ? "S" : "!"}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {mode === "sign-in" ? "Welcome Back" : "Start Your Journey"}
              </h1>
              <p className="mt-2 text-sm font-medium text-gray-500">
                {mode === "sign-in"
                  ? "Sign in to access your SAT study plans"
                  : "Begin your organized SAT preparation today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-700 mb-2 ml-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-0 font-medium transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-gray-700 mb-2 ml-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-0 font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                  <p className="text-sm font-bold text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white py-4 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 ${mode === "sign-in" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"}`}
              >
                {loading
                  ? mode === "sign-in"
                    ? "Signing In..."
                    : "Creating Account..."
                  : mode === "sign-in"
                    ? "Sign In"
                    : "Join for Free"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode((prev) => (prev === "sign-in" ? "sign-up" : "sign-in"));
                  setError(null);
                }}
                className="text-sm font-bold text-amber-500 hover:text-amber-600"
              >
                {mode === "sign-in"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm font-bold text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
