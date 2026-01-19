"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type StudyPlan = {
  id: string;
  user_id: string;
  date: string;
  section: "math" | "reading" | "writing";
  start_time: string;
  end_time: string;
  tasks_text: string;
};

type DashboardPlan = StudyPlan & {
  isActive: boolean;
  isPast: boolean;
  isMarked: boolean;
};

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayPlans, setTodayPlans] = useState<DashboardPlan[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = getSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      
      if (user) {
        if (user.email) setUserName(user.email.split('@')[0]);

        const today = new Date().toISOString().split('T')[0];
        
        // Fetch plans and logs
        const [plansRes, logsRes] = await Promise.all([
          supabase.from("study_plan").select("*").eq("user_id", user.id).eq("date", today),
          supabase.from("daily_log").select("plan_id, status").eq("user_id", user.id).eq("date", today)
        ]);

        if (plansRes.data) {
          const now = new Date();
          const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
          const logs = logsRes.data || [];
          
          const processed: DashboardPlan[] = plansRes.data.map((plan: StudyPlan) => {
            const log = logs.find(l => l.plan_id === plan.id);
            const isActive = currentTimeStr >= plan.start_time && currentTimeStr <= plan.end_time;
            const isPast = currentTimeStr > plan.end_time;
            const isMarked = !!log;
            return { ...plan, isActive, isPast, isMarked };
          });
          
          // Sort logic: 
          // Group 1: (Not Marked & Not Past) -> Start time ASC
          // Group 2: (Marked OR Past) -> Start time ASC
          processed.sort((a, b) => {
            const aDone = a.isMarked || a.isPast;
            const bDone = b.isMarked || b.isPast;
            
            if (aDone && !bDone) return 1;
            if (!aDone && bDone) return -1;
            
            return a.start_time.localeCompare(b.start_time);
          });
          
          setTodayPlans(processed);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Welcome back, {userName ? <span className="text-amber-500 capitalize">{userName}</span> : "Friend"}
          </h1>
          <p className="mt-2 text-lg font-medium text-gray-500">
            Let&apos;s make today&apos;s study session productive.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/plan" className="inline-flex items-center px-6 py-3 bg-amber-500 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/10 hover:bg-amber-600 transition-all active:scale-95">
            Create Plan
          </Link>
          <Link href="/focus" className="inline-flex items-center px-6 py-3 bg-white text-amber-500 border border-amber-200 text-sm font-bold rounded-xl shadow-sm hover:bg-amber-50 transition-all active:scale-95">
            Start Timer
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Today's Schedule */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
                Today&apos;s Study Schedule
              </h2>
              <Link href="/check-in" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                Full Check-in →
              </Link>
            </div>
            <div className="p-6 sm:p-8">
              {todayPlans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No tasks planned for today</h3>
                  <p className="text-sm font-medium text-gray-500 mb-6">Start by creating a plan for your study sections.</p>
                  <Link href="/plan" className="inline-flex items-center px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all text-sm shadow-md shadow-amber-500/10">
                    Create Study Plan
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {todayPlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl transition-all border ${
                        plan.isActive 
                          ? 'bg-amber-50 border-amber-200 shadow-sm' 
                          : plan.isPast
                            ? 'bg-gray-50/50 opacity-60 border-transparent'
                            : 'bg-white border-gray-100 hover:border-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`w-1 h-10 rounded-full shrink-0 ${
                          plan.section === 'math' ? 'bg-blue-500' : 
                          plan.section === 'reading' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{plan.section}</span>
                            {plan.isActive && (
                              <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse uppercase tracking-tight">Active</span>
                            )}
                          </div>
                          <h3 className="text-md font-bold text-gray-900 leading-snug line-clamp-1">{plan.tasks_text}</h3>
                          <p className="text-xs font-bold text-gray-400 mt-1">
                            {plan.start_time} - {plan.end_time}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-0 w-full sm:w-auto flex justify-end">
                          <Link 
                            href={`/study-room?planId=${plan.id}`}
                            className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-all text-xs active:scale-95 ${
                              plan.isActive 
                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20' 
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            Enter Study Room
                          </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-500 rounded-3xl p-8 text-white shadow-lg shadow-amber-500/10">
              <h3 className="text-xl font-bold mb-2">Build Your Streak</h3>
              <p className="text-amber-50 font-medium mb-6 text-sm">Consistent study is the key to a high score. Check in daily to build your momentum.</p>
              <Link href="/check-in" className="inline-flex items-center px-5 py-2.5 bg-white text-amber-600 rounded-lg text-xs font-bold hover:scale-105 transition-all">
                Go to Check-in →
              </Link>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Study Room</h3>
              <p className="text-gray-500 font-medium mb-6 text-sm">Execute your scheduled objectives with integrated piece-by-piece management.</p>
              <Link href="/study-room" className="inline-flex items-center px-5 py-2.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10">
                Go to Study Room →
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/plan" className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 group border border-transparent hover:border-gray-100 transition-all">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Study Planner</span>
              </Link>
              <Link href="/check-in" className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 group border border-transparent hover:border-gray-100 transition-all">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Check-in Hub</span>
              </Link>
              <Link href="/archive" className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 group border border-transparent hover:border-gray-100 transition-all">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Study Archive</span>
              </Link>
            </div>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <h3 className="font-bold text-amber-800 text-sm mb-3">Study Tip</h3>
            <p className="text-xs font-medium text-amber-700 leading-relaxed italic">&quot;The secret of getting ahead is getting started.&quot; — Stay consistent with your daily plans to reach your target score.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
