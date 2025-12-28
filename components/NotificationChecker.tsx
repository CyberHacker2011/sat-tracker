"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

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

function hasTimePassed(hhmm: string, dateString: string) {
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return false;

    const planDate = new Date(dateString + "T00:00:00");
    const targetDateTime = new Date(planDate);
    targetDateTime.setHours(h, m, 0, 0);

    const now = new Date();
    return now >= targetDateTime;
}

export function NotificationChecker() {
    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        async function checkAndCreateNotifications() {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) return;

                const today = getTodayDateString();
                const tomorrow = getTomorrowDateString();

                console.log("[NotificationChecker] Checking notifications at", new Date().toLocaleTimeString());

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

                        // Check if plan start time has passed
                        const startTimePassed = hasTimePassed(plan.start_time, today);
                        const endTimePassed = hasTimePassed(plan.end_time, today);

                        // Only notify about start if we're past start but before end
                        if (startTimePassed && !endTimePassed && !hasLog) {
                            const message = `Your ${plan.section} plan is starting at ${plan.start_time}.`;
                            console.log("[NotificationChecker] Plan has started:", message);

                            // Create notification via API
                            try {
                                await fetch("/api/create_notification", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ user_id: user.id, message }),
                                });
                            } catch (err) {
                                console.error("[NotificationChecker] Error creating start notification:", err);
                            }
                        }

                        // Check if plan has ended
                        // endTimePassed is already calculated above

                        if (endTimePassed && !hasLog) {
                            // Send one notification for missed check-in
                            const missedMessage = `Your ${plan.section} plan ending at ${plan.end_time} has no check-in.`;

                            try {
                                await fetch("/api/create_notification", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ user_id: user.id, message: missedMessage }),
                                });
                            } catch (err) {
                                console.error("[NotificationChecker] Error creating missed notification:", err);
                            }
                        }
                    }
                }

                // Check for no plan for tomorrow
                const { data: tomorrowPlans, error: tomorrowError } = await supabase
                    .from("study_plan")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("date", tomorrow);

                if (!tomorrowError) {
                    const hasPlanForTomorrow = tomorrowPlans && tomorrowPlans.length > 0;

                    if (!hasPlanForTomorrow) {
                        const message = "You have not created a SAT study plan for tomorrow.";

                        // Create notification via API
                        try {
                            await fetch("/api/create_notification", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ user_id: user.id, message }),
                            });
                        } catch (err) {
                            console.error("[NotificationChecker] Error creating no plan notification:", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking notifications:", error);
            }
        }

        // Check immediately on mount
        checkAndCreateNotifications();

        // Check every minute
        intervalId = setInterval(checkAndCreateNotifications, 60000);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [supabase]);

    // This component doesn't render anything
    return null;
}
