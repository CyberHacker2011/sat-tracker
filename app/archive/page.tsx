"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

type StudyPlan = {
  id: string;
  date: string;
  section: "math" | "reading" | "writing";
  start_time: string;
  end_time: string;
  tasks_text: string;
  daily_log?: { status: "done" | "missed" }[] | { status: "done" | "missed" } | null;
};

export default function ArchivePage() {
  const supabase = getSupabaseBrowserClient();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArchive() {
      setLoading(true);
      setError(null);

      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (!user) {
          setError("Please sign in to view your archive.");
          setLoading(false);
          return;
        }

        // Standard select. We'll fetch daily_log separately if the join causes issues
        const { data, error: fetchError } = await supabase
          .from("study_plan")
          .select("id, date, section, start_time, end_time, tasks_text")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .order("start_time", { ascending: false });

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
            const planIds = data.map(p => p.id);
            const { data: logsData, error: logsError } = await supabase
              .from("daily_log")
              .select("plan_id, status")
              .in("plan_id", planIds);

            if (!logsError) {
              const enrichedPlans = data.map(plan => ({
                ...plan,
                daily_log: logsData.filter(l => l.plan_id === plan.id)
              }));
              setPlans(enrichedPlans as any[]);
            } else {
              setPlans(data as any[]);
            }
        } else {
          setPlans([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load archive history.");
      } finally {
        setLoading(false);
      }
    }

    loadArchive();
  }, [supabase]);

  function formatTime(time: string) {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 bg-white min-h-screen">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-100 pb-12">
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Study <span className="text-amber-500">History</span>
            </h1>
            <p className="text-gray-500 font-medium">
            Review your past performance and consistency.
            </p>
        </div>
        <Link href="/dashboard" className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors">
            ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm mb-10 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      {plans.length === 0 && !error ? (
        <div className="text-center py-24 bg-gray-50 rounded-[2.5rem] border border-gray-100">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-gray-50 text-gray-200">
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
          </div>
          <p className="text-gray-400 font-bold">Your study history is currently empty.</p>
          <p className="text-sm font-medium text-gray-300 mt-2">Start your mission by creating a new plan.</p>
        </div>
      ) : plans.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Subject</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Time Block</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Objectives</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plans.map((plan) => {
                // Handle different possible structures of joined data
                const logData = plan.daily_log;
                const status = Array.isArray(logData) 
                  ? logData[0]?.status 
                  : (logData as any)?.status;
                
                return (
                  <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-7">
                      <div className="space-y-1.5">
                        <p className="text-sm font-extrabold text-gray-900">{formatDate(plan.date)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                          plan.section === 'math' ? 'bg-blue-50 text-blue-600' :
                          plan.section === 'reading' ? 'bg-amber-50 text-amber-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {plan.section}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-7 font-bold text-gray-400 text-xs tabular-nums">
                      {formatTime(plan.start_time)} - {formatTime(plan.end_time)}
                    </td>
                    <td className="px-8 py-7">
                      <p className="text-sm font-medium text-gray-600 line-clamp-2 max-w-sm leading-relaxed">{plan.tasks_text}</p>
                    </td>
                    <td className="px-8 py-7 text-center">
                      {status === "done" ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border border-green-100">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Success
                        </span>
                      ) : status === "missed" ? (
                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border border-red-100">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Missed
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-gray-300 uppercase tracking-widest">Untracked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
