"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

type Section = "math" | "reading" | "writing";
type Status = "done" | "missed";

type StudyPlan = {
  id: string;
  date: string;
  section: Section;
  start_time: string;
  end_time: string;
  tasks_text: string;
  isActive?: boolean;
  isPast?: boolean;
};

type DailyLog = {
  id: string;
  plan_id: string;
  status: Status;
};

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

function formatDateForDisplay(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  const diffTime = dateOnly.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" };
  const formatted = date.toLocaleDateString("en-US", options);

  if (diffDays === 0) return `Today - ${formatted}`;
  if (diffDays === 1) return `Tomorrow - ${formatted}`;
  return formatted;
}

function isPastStartTime(dateString: string, startTime: string) {
  const [sh, sm] = startTime.split(":").map(Number);
  if (Number.isNaN(sh) || Number.isNaN(sm)) return false;

  const planDate = new Date(dateString + "T00:00:00");
  const startDateTime = new Date(planDate);
  startDateTime.setHours(sh, sm, 0, 0);

  const now = new Date();
  return now >= startDateTime;
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function CheckInPage() {
  const supabase = getSupabaseBrowserClient();
  const [plansByDate, setPlansByDate] = useState<Record<string, StudyPlan[]>>({});
  const [logsByPlanId, setLogsByPlanId] = useState<Record<string, DailyLog>>({});
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const next7Days = getNext7Days();
      const startDate = next7Days[0];
      const endDate = next7Days[next7Days.length - 1];

      try {
        const { data: authData, error: userError } = await supabase.auth.getUser();
        const user = authData?.user;

        if (userError || !user) {
          throw userError ?? new Error("You must be signed in to check in.");
        }

        const { data: plansData, error: plansError } = await supabase
          .from("study_plan")
          .select("id, date, section, start_time, end_time, tasks_text")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: true })
          .order("start_time", { ascending: true });

        if (plansError) {
          throw plansError;
        }

        const grouped: Record<string, StudyPlan[]> = {};
        (plansData ?? []).forEach((plan) => {
          if (!grouped[plan.date]) {
            grouped[plan.date] = [];
          }
          grouped[plan.date].push(plan as StudyPlan);
        });

        // Set isActive logic
        const now = new Date();
        const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const todayStr = next7Days[0];
        
        Object.keys(grouped).forEach(date => {
          grouped[date] = grouped[date].map((p: StudyPlan) => ({
            ...p,
            isActive: date === todayStr && currentTimeStr >= p.start_time && currentTimeStr <= p.end_time,
            isPast: date < todayStr || (date === todayStr && currentTimeStr > p.end_time)
          }));
        });

        setPlansByDate(grouped);

        if (plansData && plansData.length > 0) {
            const planIds = plansData.map((p) => p.id);
            const { data: logsData, error: logsError } = await supabase
              .from("daily_log")
              .select("id, plan_id, status")
              .eq("user_id", user.id)
              .in("plan_id", planIds);

            if (!logsError) {
              const byPlan: Record<string, DailyLog> = {};
              (logsData ?? []).forEach((log) => {
                byPlan[log.plan_id] = log as DailyLog;
              });
              
              // Apply Sort to each date group
              Object.keys(grouped).forEach(d => {
                grouped[d].sort((a, b) => {
                  const aMarked = !!byPlan[a.id];
                  const bMarked = !!byPlan[b.id];
                  const aDone = aMarked || a.isPast;
                  const bDone = bMarked || b.isPast;

                  if (aDone && !bDone) return 1;
                  if (!aDone && bDone) return -1;
                  return a.start_time.localeCompare(b.start_time);
                });
              });

              setLogsByPlanId(byPlan);
              setPlansByDate({ ...grouped });
            }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  async function handleCheckIn(plan: StudyPlan, status: Status) {
    if (!isPastStartTime(plan.date, plan.start_time)) {
      setError("You can only check in after the plan start time.");
      return;
    }

    setSavingPlanId(plan.id);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found.");

      const existingLog = logsByPlanId[plan.id];
      let response;

      if (existingLog) {
        response = await supabase
          .from("daily_log")
          .update({ status, checked_at: new Date().toISOString() })
          .eq("id", existingLog.id)
          .select()
          .single();
      } else {
        response = await supabase
          .from("daily_log")
          .insert({
            user_id: user.id,
            plan_id: plan.id,
            date: plan.date,
            status,
            checked_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (response.error) throw response.error;
      setLogsByPlanId(prev => ({ ...prev, [plan.id]: response.data as DailyLog }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save check-in.");
    } finally {
      setSavingPlanId(null);
    }
  }

  const next7Days = getNext7Days();
  const sortedDates = next7Days.filter(date => plansByDate[date] && plansByDate[date].length > 0);

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10 bg-white">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-3">
          Daily <span className="text-amber-500 underline decoration-amber-100 decoration-8 underline-offset-4">Check-in</span>
        </h1>
        <p className="text-lg font-medium text-gray-400 max-w-2xl leading-relaxed">
          Track your progress and build your study habit. Update your completed sessions here.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-gray-400">Loading your schedule...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="rounded-3xl bg-gray-50 p-12 text-center border border-gray-100">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-sm border border-gray-50">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">No active sessions</h3>
           <p className="text-sm font-medium text-gray-500 mb-8">Start your journey by creating a study plan.</p>
           <Link href="/plan" className="inline-flex items-center px-10 py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20">
             Create Study Plan
           </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">
                  {formatDateForDisplay(date)}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {plansByDate[date].map((plan) => {
                  const log = logsByPlanId[plan.id];
                  const startTimePassed = isPastStartTime(plan.date, plan.start_time);
                  const isActive = plan.isActive;
                  const currentStatus = log ? log.status : null;
                  const isSaving = savingPlanId === plan.id;

                  return (
                    <div 
                        key={plan.id} 
                        className={`group p-6 sm:p-8 rounded-3xl transition-all border ${
                            isActive 
                            ? 'bg-amber-50 border-amber-200 shadow-sm ring-1 ring-amber-100' 
                            : currentStatus === 'done' 
                                ? 'bg-green-50/30 border-green-100 opacity-80' 
                                : 'bg-white border-gray-100 hover:border-amber-100'
                        }`}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        plan.section === 'math' ? 'bg-blue-500 text-white' : 
                                        plan.section === 'reading' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                                    }`}>
                                        {plan.section}
                                    </span>
                                    {isActive && (
                                        <span className="flex items-center gap-1.5 bg-amber-500 text-white text-[9px] font-bold px-3 py-1 rounded-full animate-pulse uppercase tracking-tight">
                                            Active Now
                                        </span>
                                    )}
                                    {currentStatus === 'done' && (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 leading-snug">{plan.tasks_text}</h3>
                                <div className="text-sm font-bold text-amber-600/60 uppercase tracking-widest flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {formatTime(plan.start_time)} - {formatTime(plan.end_time)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 border-t pt-6 md:border-t-0 md:pt-0 md:border-l md:pl-8 border-gray-100">
                                {!currentStatus && (
                                    <Link
                                        href={`/study-room?planId=${plan.id}`}
                                        className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                                            isActive 
                                            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20' 
                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                        }`}
                                    >
                                        Enter Study Room
                                    </Link>
                                )}
                                
                                <div className="flex gap-2">
                                    <button
                                        disabled={!startTimePassed || isSaving}
                                        onClick={() => handleCheckIn(plan, "done")}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                            currentStatus === "done"
                                            ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                                            : "bg-green-50 text-green-500 hover:bg-green-500 hover:text-white border border-green-100"
                                        } disabled:opacity-30`}
                                    >
                                        {isSaving && currentStatus !== "done" ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)}
                                    </button>
                                    <button
                                        disabled={!startTimePassed || isSaving}
                                        onClick={() => handleCheckIn(plan, "missed")}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                            currentStatus === "missed"
                                            ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                                            : "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100"
                                        } disabled:opacity-30`}
                                    >
                                        {isSaving && currentStatus !== "missed" ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-16 p-8 rounded-3xl bg-amber-50 border border-amber-100">
        <h3 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
            How it works
        </h3>
        <p className="text-xs font-medium text-amber-700 leading-relaxed mb-4">
            Sessions become available for check-in after their scheduled start time. Mark your plans as "Completed" if you finished your tasks, or "Missed" if you couldn't make it.
        </p>
        <p className="text-xs font-medium text-amber-700 leading-relaxed">
            Consistent check-ins help you track your progress and maintain study accountability over time.
        </p>
      </div>
    </div>
  );
}
