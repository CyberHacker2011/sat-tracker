import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// This endpoint should be called by a cron job or scheduled task
// It evaluates notification conditions and creates notifications in the database

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

async function sendEmail(userEmail: string, subject: string, message: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || !userEmail) return;

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@yourdomain.com",
      to: userEmail,
      subject,
      html: `<p>${message}</p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Vercel Cron sends the secret in the Authorization header
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const today = getTodayDateString();
    const tomorrow = getTomorrowDateString();

    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    for (const user of users.users) {
      try {
        const now = new Date().toISOString();

        // 1. Check for missed check-ins (end_time has passed, no log exists)
        const { data: todayPlans, error: plansError } = await supabase
          .from("study_plan")
          .select("id, date, section, start_time, end_time")
          .eq("user_id", user.id)
          .eq("date", today);

        if (!plansError && todayPlans && todayPlans.length > 0) {
          const planIds = todayPlans.map((p) => p.id);

          const { data: logs, error: logsError } = await supabase
            .from("daily_log")
            .select("plan_id")
            .eq("user_id", user.id)
            .eq("date", today)
            .in("plan_id", planIds);

          if (!logsError) {
            const loggedPlanIds = new Set((logs || []).map((l) => l.plan_id));

            for (const plan of todayPlans) {
              const hasLog = loggedPlanIds.has(plan.id);
              const endTimePassed = hasTimePassed(plan.end_time, today);

              // Check if notification already exists for this plan today
              const { data: existingNotif } = await supabase
                .from("notifications")
                .select("id")
                .eq("user_id", user.id)
                .eq("message", `Your ${plan.section} plan ending at ${plan.end_time} has no check-in.`)
                .is("dismissed_at", null)
                .gte("created_at", new Date(today + "T00:00:00").toISOString())
                .limit(1)
                .single();

              if (endTimePassed && !hasLog && !existingNotif) {
                const message = `Your ${plan.section} plan ending at ${plan.end_time} has no check-in.`;
                
                // Insert notification
                const { data: notification, error: notifError } = await supabase
                  .from("notifications")
                  .insert({
                    user_id: user.id,
                    message,
                    created_at: now,
                  })
                  .select()
                  .single();

                if (!notifError && notification) {
                  // Check if user was active when notification was created
                  const { data: activity } = await supabase
                    .from("user_activity")
                    .select("last_seen_at")
                    .eq("user_id", user.id)
                    .single();

                  // If last_seen_at < notification.created_at, send email
                  if (activity && activity.last_seen_at) {
                    const lastSeen = new Date(activity.last_seen_at);
                    const notifCreated = new Date(notification.created_at);
                    if (lastSeen < notifCreated) {
                      // User was not active, send email
                      await sendEmail(
                        user.email || "",
                        "SAT Plan Not Checked In",
                        message
                      );
                    }
                  } else {
                    // No activity record, send email
                    await sendEmail(
                      user.email || "",
                      "SAT Plan Not Checked In",
                      message
                    );
                  }
                }
              }
            }
          }
        }

        // 2. Check for no plan for tomorrow
        const { data: tomorrowPlans, error: tomorrowError } = await supabase
          .from("study_plan")
          .select("id")
          .eq("user_id", user.id)
          .eq("date", tomorrow);

        if (!tomorrowError) {
          const hasPlanForTomorrow = tomorrowPlans && tomorrowPlans.length > 0;

          // Check if notification already exists for tomorrow
          const { data: existingNotif } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", user.id)
            .eq("message", "You have not created a SAT study plan for tomorrow.")
            .is("dismissed_at", null)
            .gte("created_at", new Date(tomorrow + "T00:00:00").toISOString())
            .limit(1)
            .single();

          if (!hasPlanForTomorrow && !existingNotif) {
            const message = "You have not created a SAT study plan for tomorrow.";
            const now = new Date().toISOString();

            // Insert notification
            const { data: notification, error: notifError } = await supabase
              .from("notifications")
              .insert({
                user_id: user.id,
                message,
                created_at: now,
              })
              .select()
              .single();

            if (!notifError && notification) {
              // Check if user was active when notification was created
              const { data: activity } = await supabase
                .from("user_activity")
                .select("last_seen_at")
                .eq("user_id", user.id)
                .single();

              // If last_seen_at < notification.created_at, send email
              if (activity && activity.last_seen_at) {
                const lastSeen = new Date(activity.last_seen_at);
                const notifCreated = new Date(notification.created_at);
                if (lastSeen < notifCreated) {
                  // User was not active, send email
                  await sendEmail(
                    user.email || "",
                    "No SAT Plan for Tomorrow",
                    message
                  );
                }
              } else {
                // No activity record, send email
                await sendEmail(
                  user.email || "",
                  "No SAT Plan for Tomorrow",
                  message
                );
              }
            }
          }
        }
      } catch (userError) {
        // Continue with next user if one fails
        console.error(`Error processing user ${user.id}:`, userError);
      }
    }

    return NextResponse.json({ success: true, processed: users.users.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

