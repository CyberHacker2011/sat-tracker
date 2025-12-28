import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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
  if (!resendApiKey || !userEmail) return false;

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@yourdomain.com",
      to: userEmail,
      subject,
      html: `<p>${message}</p>`,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const runStartTime = new Date().toISOString();
  let usersProcessed = 0;
  let notificationsCreated = 0;
  let emailsSent = 0;
  let errorMessage: string | null = null;

  try {
    // Verify the request is authorized
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      errorMessage = "Missing Supabase configuration";
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

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
      errorMessage = usersError.message;
      throw new Error(errorMessage);
    }

    if (!users || users.users.length === 0) {
      // Log successful run with no users
      await supabase.from("cron_logs").insert({
        run_at: runStartTime,
        status: "success",
        users_processed: 0,
        notifications_created: 0,
        emails_sent: 0,
      });
      return NextResponse.json({ success: true, processed: 0 });
    }

    for (const user of users.users) {
      try {
        usersProcessed++;

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

              if (endTimePassed && !hasLog) {
                const message = `Your ${plan.section} plan ending at ${plan.end_time} has no check-in.`;
                
                // Idempotency: Check if notification already exists for this plan today
                const { data: existingNotif } = await supabase
                  .from("notifications")
                  .select("id")
                  .eq("user_id", user.id)
                  .eq("message", message)
                  .gte("created_at", new Date(today + "T00:00:00").toISOString())
                  .limit(1)
                  .single();

                if (!existingNotif) {
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
                    notificationsCreated++;

                    // Check if user was active when notification was created
                    const { data: activity } = await supabase
                      .from("user_activity")
                      .select("last_seen_at")
                      .eq("user_id", user.id)
                      .single();

                    // If last_seen_at < notification.created_at, send email
                    let shouldSendEmail = false;
                    if (activity && activity.last_seen_at) {
                      const lastSeen = new Date(activity.last_seen_at);
                      const notifCreated = new Date(notification.created_at);
                      shouldSendEmail = lastSeen < notifCreated;
                    } else {
                      // No activity record, send email
                      shouldSendEmail = true;
                    }

                    if (shouldSendEmail) {
                      const emailSent = await sendEmail(
                        user.email || "",
                        "SAT Plan Not Checked In",
                        message
                      );
                      if (emailSent) emailsSent++;
                    }
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

          if (!hasPlanForTomorrow) {
            const message = "You have not created a SAT study plan for tomorrow.";
            
            // Idempotency: Check if notification already exists for tomorrow
            const { data: existingNotif } = await supabase
              .from("notifications")
              .select("id")
              .eq("user_id", user.id)
              .eq("message", message)
              .gte("created_at", new Date(tomorrow + "T00:00:00").toISOString())
              .limit(1)
              .single();

            if (!existingNotif) {
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
                notificationsCreated++;

                // Check if user was active when notification was created
                const { data: activity } = await supabase
                  .from("user_activity")
                  .select("last_seen_at")
                  .eq("user_id", user.id)
                  .single();

                // If last_seen_at < notification.created_at, send email
                let shouldSendEmail = false;
                if (activity && activity.last_seen_at) {
                  const lastSeen = new Date(activity.last_seen_at);
                  const notifCreated = new Date(notification.created_at);
                  shouldSendEmail = lastSeen < notifCreated;
                } else {
                  // No activity record, send email
                  shouldSendEmail = true;
                }

                if (shouldSendEmail) {
                  const emailSent = await sendEmail(
                    user.email || "",
                    "No SAT Plan for Tomorrow",
                    message
                  );
                  if (emailSent) emailsSent++;
                }
              }
            }
          }
        }
      } catch (userError) {
        // Continue with next user if one fails
        console.error(`Error processing user ${user.id}:`, userError);
      }
    }

    // Log successful run
    await supabase.from("cron_logs").insert({
      run_at: runStartTime,
      status: "success",
      users_processed: usersProcessed,
      notifications_created: notificationsCreated,
      emails_sent: emailsSent,
    });

    return NextResponse.json({
      success: true,
      processed: usersProcessed,
      notifications_created,
      emails_sent: emailsSent,
    });
  } catch (error: any) {
    errorMessage = error.message || "Internal server error";

    // Log failed run
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
        await supabase.from("cron_logs").insert({
          run_at: runStartTime,
          status: "error",
          users_processed: usersProcessed,
          notifications_created: notificationsCreated,
          emails_sent: emailsSent,
          error_message: errorMessage,
        });
      }
    } catch (logError) {
      console.error("Error logging cron run:", logError);
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

