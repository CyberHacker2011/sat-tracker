"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserName(user.email.split('@')[0]);
      }
      setLoading(false);
    }
    getUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-sm text-gray-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Welcome back, {userName ? <span className="text-amber-600 capitalize">{userName}</span> : "Student"}!
        </h1>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Ready to crush your SAT goals today? Here&apos;s your command center.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Plan Card */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-amber-200">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold leading-7 text-gray-900">
              <Link href="/plan">
                <span className="absolute inset-0" />
                Daily Study Plan
              </Link>
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Organize your study sessions, set topics, and define your daily goals. Stay on track with a clear roadmap.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-x-2 text-sm font-semibold leading-6 text-amber-600 group-hover:text-amber-500">
            Go to Plan <span aria-hidden="true">→</span>
          </div>
        </div>

        {/* Check-in Card */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-blue-200">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold leading-7 text-gray-900">
              <Link href="/check-in">
                <span className="absolute inset-0" />
                Daily Check-in
              </Link>
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Log your progress for the day. Mark tasks as complete and reflect on what you&apos;ve learned.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-x-2 text-sm font-semibold leading-6 text-blue-600 group-hover:text-blue-500">
            Check-in Now <span aria-hidden="true">→</span>
          </div>
        </div>

        {/* Archive Card */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-gray-300">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold leading-7 text-gray-900">
              <Link href="/archive">
                <span className="absolute inset-0" />
                Archive
              </Link>
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              View your past study history and track your consistency over time. See how far you&apos;ve come.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-600 group-hover:text-gray-800">
            View Archive <span aria-hidden="true">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
