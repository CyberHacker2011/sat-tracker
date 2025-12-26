"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Section = "math" | "reading" | "writing";
type Status = "done" | "missed";

type StudyPlan = {
  id: string;
  user_id: string;
  date: string;
  section: Section;
  start_time: string;
  end_time: string;
  tasks_text: string;
};

type DailyLog = {
  id: string;
  user_id: string;
  plan_id: string;
  date: string;
  status: Status;
  checked_at: string | null;
};

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrowDateString() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hasTimePassed(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = h * 60 + m;

  return nowMinutes >= targetMinutes;
}

async function showNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, { body });
  } catch {
    // Ignore notification errors for MVP.
  }
}

export function NotificationTriggers() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const supabase = getSupabaseBrowserClient();

    async function checkAndNotify() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      const today = getTodayDateString();
      const tomorrow = getTomorrowDateString();

      // 1) No check-in by planned start_time and end_time.
      try {
        const { data: plans, error: plansError } = await supabase
          .from("study_plan")
          .select("id, user_id, date, section, start_time, end_time, tasks_text")
          .eq("user_id", user.id)
          .eq("date", today);

        if (plansError || !plans || cancelled) {
          // Skip on error for this run.
        } else if (plans.length > 0) {
          const planIds = plans.map((p) => p.id);

          const { data: logs, error: logsError } = await supabase
            .from("daily_log")
            .select("id, user_id, plan_id, date, status, checked_at")
            .eq("user_id", user.id)
            .eq("date", today)
            .in("plan_id", planIds);

          if (!logsError && !cancelled) {
            const logsByPlanId: Record<string, DailyLog> = {};
            (logs ?? []).forEach((log) => {
              logsByPlanId[log.plan_id] = log as DailyLog;
            });

            for (const plan of plans as StudyPlan[]) {
              const hasLog = !!logsByPlanId[plan.id];
              const startReached = hasTimePassed(plan.start_time);
              const endPassed = hasTimePassed(plan.end_time);

              const keyStart = `notified_start_${plan.id}_${today}`;
              const keyEnd = `notified_missed_${plan.id}_${today}`;

              // Notify when start_time is reached and there is no check-in yet.
              if (startReached && !hasLog && !localStorage.getItem(keyStart)) {
                await showNotification(
                  "SAT plan starting",
                  `Your ${plan.section} plan starting at ${plan.start_time} is scheduled now.`
                );
                localStorage.setItem(keyStart, "1");
              }

              // Notify when end_time has passed and there is still no check-in.
              if (endPassed && !hasLog && !localStorage.getItem(keyEnd)) {
                await showNotification(
                  "SAT plan not checked in",
                  `Your ${plan.section} plan ending at ${plan.end_time} has no check-in.`
                );
                localStorage.setItem(keyEnd, "1");
              }
            }
          }
        }
      } catch {
        // Ignore errors for this run.
      }

      // 2) No plan exists for tomorrow.
      try {
        const { data: tomorrowPlans, error: tomorrowError } = await supabase
          .from("study_plan")
          .select("id")
          .eq("user_id", user.id)
          .eq("date", tomorrow);

        const keyTomorrow = `notified_no_plan_${tomorrow}`;

        if (!tomorrowError && !cancelled) {
          if ((!tomorrowPlans || tomorrowPlans.length === 0) && !localStorage.getItem(keyTomorrow)) {
            await showNotification(
              "No SAT plan for tomorrow",
              "You have not created a SAT study plan for tomorrow."
            );
            localStorage.setItem(keyTomorrow, "1");
          }
        }
      } catch {
        // Ignore errors for this run.
      }
    }

    // Check immediately, then every minute.
    checkAndNotify();
    const intervalId = window.setInterval(checkAndNotify, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}


