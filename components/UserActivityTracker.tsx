"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export function UserActivityTracker() {
  useEffect(() => {
    async function updateActivity() {
      const supabase = getSupabaseBrowserClient();
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const now = new Date().toISOString();

      // Update or create user_activity record
      await supabase
        .from("user_activity")
        .upsert(
          {
            user_id: user.id,
            last_seen_at: now,
          },
          { onConflict: "user_id" }
        );
    }

    updateActivity();
  }, []);

  return null;
}

