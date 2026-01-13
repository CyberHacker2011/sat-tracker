"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";


function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getTimeDate(hhmm: string, dateString: string) {
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;

    const mkDate = new Date(dateString + "T00:00:00");
    const target = new Date(mkDate);
    target.setHours(h, m, 0, 0);
    return target;
}

export function NotificationChecker() {
    const supabase = getSupabaseBrowserClient();
    // Track notifications sent in this session to prevent duplicate API calls
    const sentPlanStartNotifications = useRef<Set<string>>(new Set());
    const sentPlanMissedNotifications = useRef<Set<string>>(new Set());

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        let isMounted = true;

        async function checkAndCreateNotifications() {
            if (!isMounted) return;

            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) return;

                const today = getTodayDateString();
                const now = new Date();

                // Get today's plans
                const { data: todayPlans, error: plansError } = await supabase
                    .from("study_plan")
                    .select("id, date, section, start_time, end_time")
                    .eq("user_id", user.id)
                    .eq("date", today);

                if (plansError) {
                    console.error("[NotificationChecker] Error fetching plans:", plansError);
                    return;
                }

                if (todayPlans && todayPlans.length > 0) {
                    const planIds = todayPlans.map((p) => p.id);

                    // Get logs for today
                    const { data: logs, error: logsError } = await supabase
                        .from("daily_log")
                        .select("plan_id")
                        .eq("user_id", user.id)
                        .eq("date", today)
                        .in("plan_id", planIds);

                    if (logsError) {
                        console.error("[NotificationChecker] Error fetching logs:", logsError);
                        return;
                    }

                    const loggedPlanIds = new Set((logs || []).map((l) => l.plan_id));

                    for (const plan of todayPlans) {
                        const hasLog = loggedPlanIds.has(plan.id);
                        
                        const startDateTime = getTimeDate(plan.start_time, today);
                        const endDateTime = getTimeDate(plan.end_time, today);

                        if (!startDateTime || !endDateTime) continue;

                        // Notify 1 minute BEFORE start time
                        const notifyTime = new Date(startDateTime.getTime() - 60000); // 1 minute before
                        
                        const isTimeForStart = now >= notifyTime && now < endDateTime;
                        const isTimeForMissed = now >= endDateTime;

                        // 1. Start Notification
                        if (isTimeForStart && !hasLog) {
                            if (!sentPlanStartNotifications.current.has(plan.id)) {
                                // Determine message based on whether it started or is about to start
                                const isLate = now >= startDateTime;
                                const message = isLate 
                                    ? `Your ${plan.section} plan has started (at ${plan.start_time}).`
                                    : `Your ${plan.section} plan is starting in 1 minute (at ${plan.start_time}).`;
                                
                                // Optimistically mark as sent
                                sentPlanStartNotifications.current.add(plan.id);

                                try {
                                    const res = await fetch("/api/create_notification", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ user_id: user.id, message }),
                                    });
                                    const json = await res.json();
                                    
                                    // If API fails and it wasn't a duplicate, potentially un-mark?
                                    // Un-marking can risk spam, so we assume if we tried, we tried.
                                    // But if the server says "exists", we are good.
                                    if (!res.ok && !json.exists) {
                                         console.error("Failed to create start notification:", json.error);
                                    }
                                } catch (err) {
                                    console.error("[NotificationChecker] Error creating start notification:", err);
                                }
                            }
                        }

                        // 2. Missed Check-in Notification (after end time)
                        if (isTimeForMissed && !hasLog) {
                             if (!sentPlanMissedNotifications.current.has(plan.id)) {
                                const message = `Your ${plan.section} plan ending at ${plan.end_time} has no check-in.`;
                                
                                sentPlanMissedNotifications.current.add(plan.id);

                                try {
                                    await fetch("/api/create_notification", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ user_id: user.id, message }),
                                    });
                                } catch (err) {
                                    console.error("[NotificationChecker] Error creating missed notification:", err);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking notifications:", error);
            } finally {
                // Schedule next check in 30 seconds if still mounted
                if (isMounted) {
                    timeoutId = setTimeout(checkAndCreateNotifications, 30000);
                }
            }
        }

        // Check immediately on mount
        checkAndCreateNotifications();

        // Check every 30 seconds to catch the 1-minute window accurately
        if (isMounted) {
            timeoutId = setInterval(() => {
                checkAndCreateNotifications();
            }, 30000);
        }

        // Realtime subscriptions
        const channel = supabase
            .channel("notification-checker-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "study_plan" }, // Filter by user_id not strictly necessary if we just re-check, but better for perf if we could. RLS handles security.
                () => checkAndCreateNotifications()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "daily_log" },
                () => checkAndCreateNotifications()
            )
            .subscribe();

        return () => {
            isMounted = false;
            if (timeoutId) {
                clearInterval(timeoutId);
            }
            supabase.removeChannel(channel);
        };
    }, [supabase]);
    
    return null;
}
