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

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateForDisplay(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function ArchivePage() {
  const supabase = getSupabaseBrowserClient();
  const [plansByDate, setPlansByDate] = useState<Record<string, StudyPlan[]>>({});
  const [logsByPlanId, setLogsByPlanId] = useState<Record<string, DailyLog>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const today = getTodayDateString();

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw userError ?? new Error("You must be signed in to view archive.");
        }

        const { data: plansData, error: plansError } = await supabase
          .from("study_plan")
          .select("id, date, section, start_time, end_time, tasks_text")
          .eq("user_id", user.id)
          .lt("date", today)
          .order("date", { ascending: false })
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

        // Get all logs for archived plans
        const { data: logsData, error: logsError } = await supabase
          .from("daily_log")
          .select("id, plan_id, status")
          .eq("user_id", user.id)
          .in("plan_id", planIds);

        if (logsError) {
          throw logsError;
        }

        const byPlan: Record<string, DailyLog> = {};
        (logsData ?? []).forEach((log) => {
          byPlan[log.plan_id] = log as DailyLog;
        });
        setLogsByPlanId(byPlan);
      } catch (err: any) {
        setError(err.message ?? "Failed to load archive.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const sortedDates = Object.keys(plansByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="mx-auto max-w-6xl p-3 md:p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Archive
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          View your past study plans and their completion status.
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
          <p className="text-sm text-gray-600">Loading archive…</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
          <p className="text-sm text-gray-600">No archived plans found.</p>
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
                      const status = log ? log.status : null;

                      return (
                        <tr key={plan.id}>
                          {/* Status Display */}
                          <td className="whitespace-nowrap px-6 py-4">
                            {status ? (
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                  status === "done"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {status === "done" ? "Done" : "Missed"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800">
                                Unmarked
                              </span>
                            )}
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
    </div>
  );
}

