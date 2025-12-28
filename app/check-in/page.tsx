"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Section = "math" | "reading" | "writing";
type Status = "done" | "missed";

type StudyPlan = {
  id: string;
  date: string;
  section: Section;
  start_time: string;
  end_time: string;
  tasks_text: string;
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

  const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
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

function canCheckIn(dateString: string, startTime: string) {
  // Can only check in after start time has passed
  return isPastStartTime(dateString, startTime);
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for real-time start time checks
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const next7Days = getNext7Days();
      const startDate = next7Days[0];
      const endDate = next7Days[next7Days.length - 1];

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

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

        // Group plans by date
        const grouped: Record<string, StudyPlan[]> = {};
        (plansData ?? []).forEach((plan) => {
          if (!grouped[plan.date]) {
            grouped[plan.date] = [];
          }
          grouped[plan.date].push(plan as StudyPlan);
        });
        setPlansByDate(grouped);

        if (!plansData || plansData.length === 0) {
          setLogsByPlanId({});
          return;
        }

        const planIds = plansData.map((p) => p.id);

        // Get logs for all dates in the range
        const { data: logsData, error: logsError } = await supabase
          .from("daily_log")
          .select("id, plan_id, status")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lte("date", endDate)
          .in("plan_id", planIds);

        if (logsError) {
          throw logsError;
        }

        const byPlan: Record<string, DailyLog> = {};
        (logsData ?? []).forEach((log) => {
          byPlan[log.plan_id] = log as DailyLog;
        });
        setLogsByPlanId(byPlan);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plans.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  async function handleCheckIn(plan: StudyPlan, status: Status) {
    if (!canCheckIn(plan.date, plan.start_time)) {
      setError("Check-in is only allowed after the plan start time.");
      return;
    }

    setSavingPlanId(plan.id);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("You must be signed in to check in.");
      }

      const existingLog = logsByPlanId[plan.id];

      if (existingLog) {
        const { data, error: updateError } = await supabase
          .from("daily_log")
          .update({
            status,
            checked_at: new Date().toISOString(),
          })
          .eq("id", existingLog.id)
          .eq("user_id", user.id)
          .select("id, plan_id, status")
          .single();

        if (updateError) {
          throw updateError;
        }

        setLogsByPlanId((prev) => ({
          ...prev,
          [plan.id]: data as DailyLog,
        }));
      } else {
        const { data, error: insertError } = await supabase
          .from("daily_log")
          .insert({
            user_id: user.id,
            plan_id: plan.id,
            date: plan.date,
            status,
            checked_at: new Date().toISOString(),
          })
          .select("id, plan_id, status")
          .single();

        if (insertError) {
          throw insertError;
        }

        setLogsByPlanId((prev) => ({
          ...prev,
          [plan.id]: data as DailyLog,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save check-in.");
    } finally {
      setSavingPlanId(null);
    }
  }

  const next7Days = getNext7Days();
  const sortedDates = next7Days.filter(date => plansByDate[date] && plansByDate[date].length > 0);

  return (
    <div className="mx-auto max-w-6xl p-3 md:p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Daily Check-in
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Mark your study plans as done or missed. Plans are shown for the next 7 days, ordered by date and time.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800" role="alert">
            {error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
          <p className="text-sm text-gray-600">Loading plans…</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-4">No plans found for the next 7 days.</p>
          <a
            href="/plan"
            className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
          >
            Create a Plan
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDateForDisplay(date)}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">
                        Section
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-900">
                        Tasks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {plansByDate[date].map((plan) => {
                      const log = logsByPlanId[plan.id];
                      const startTimePassed = isPastStartTime(plan.date, plan.start_time);
                      const disabled = !startTimePassed;
                      const currentStatus = log ? log.status : null;

                      return (
                        <tr key={plan.id} className={disabled ? "bg-gray-50" : ""}>
                          {/* Status Selection */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                disabled={disabled || savingPlanId === plan.id}
                                onClick={() => handleCheckIn(plan, "done")}
                                className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${currentStatus === "done"
                                    ? "bg-green-600 text-white"
                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {savingPlanId === plan.id && currentStatus !== "done" ? "Saving..." : "Done"}
                              </button>
                              <button
                                type="button"
                                disabled={disabled || savingPlanId === plan.id}
                                onClick={() => handleCheckIn(plan, "missed")}
                                className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${currentStatus === "missed"
                                    ? "bg-red-600 text-white"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {savingPlanId === plan.id && currentStatus !== "missed" ? "Saving..." : "Missed"}
                              </button>
                              {disabled && (
                                <span className="text-xs text-gray-500">
                                  Not started
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Section */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 capitalize">
                              {plan.section}
                            </span>
                          </td>

                          {/* Time */}
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            <div className="font-medium">
                              {formatTime(plan.start_time)} – {formatTime(plan.end_time)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {plan.start_time} – {plan.end_time}
                            </div>
                          </td>

                          {/* Tasks */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 whitespace-pre-wrap">
                              {plan.tasks_text}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-2">How to Check-in</h3>
        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Click &quot;Done&quot; if you completed the study plan</li>
          <li>Click &quot;Missed&quot; if you were unable to complete it</li>
          <li>Plans are grouped by date and ordered by start time</li>
          <li>You can check in after the plan&apos;s start time (even after the end time)</li>
          <li>If you do nothing, plans remain unmarked</li>
        </ul>
      </div>
    </div>
  );
}
