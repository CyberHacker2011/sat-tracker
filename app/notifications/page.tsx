"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

type Notification = {
  id: string;
  message: string;
  created_at: string;
  dismissed_at: string | null;
};

export default function NotificationsPage() {
  const supabase = getSupabaseBrowserClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      setError(null);

      try {
        const { data: authData, error: userError } = await supabase.auth.getUser();
        const user = authData?.user;

        if (userError || !user) {
          throw userError ?? new Error("You must be signed in to view notifications.");
        }

        const { data, error: fetchError } = await supabase
          .from("notifications")
          .select("id, message, created_at, dismissed_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;
        setNotifications(data as Notification[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();

    // Subscribe to changes
    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleDismiss(id: string) {
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", id);
      if (updateError) throw updateError;
      setNotifications((prev) => 
        prev.map(n => n.id === id ? { ...n, dismissed_at: new Date().toISOString() } : n)
      );
    } catch (err) {
      console.error("Error dismissing notification:", err);
    }
  }

  const activeNotifications = notifications.filter(n => !n.dismissed_at);
  const pastNotifications = notifications.filter(n => !!n.dismissed_at);

  if (loading) {
      return (
          <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
      );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10 bg-white min-h-screen">
      <div className="mb-12 border-b border-gray-100 pb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Notification <span className="text-amber-500">Center</span>
        </h1>
        <p className="mt-2 text-lg font-medium text-gray-400">
          Stay updated with your study schedule and achievements.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications yet</h3>
          <p className="text-sm font-medium text-gray-400">We&apos;ll alert you when it&apos;s time to study.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Notifications */}
          {activeNotifications.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  New Updates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeNotifications.map((notification) => (
                  <PageNotificationItem
                    key={notification.id}
                    notification={notification}
                    isActive={true}
                    onDismiss={() => handleDismiss(notification.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Notifications */}
          {pastNotifications.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] px-2">History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastNotifications.map((notification) => (
                  <PageNotificationItem
                    key={notification.id}
                    notification={notification}
                    isActive={false}
                    onDismiss={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PageNotificationItem({ notification, isActive, onDismiss }: { notification: Notification, isActive: boolean, onDismiss: () => void }) {
  const [expanded, setExpanded] = useState(false);
  
  // Extract planId if present in message {{planId:xxx}}
  const planMatch = notification.message.match(/{{planId:(.*?)}}/);
  const planId = planMatch?.[1];
  const cleanMessage = notification.message.replace(/{{planId:.*?}}/g, "").trim();
  const isLong = cleanMessage.length > 100;

  return (
    <div
      className={`relative group flex flex-col p-6 rounded-3xl transition-all border ${
        isActive
          ? 'bg-white border-amber-100 shadow-sm hover:shadow-md'
          : 'bg-gray-50/50 border-transparent opacity-60'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isActive && (
                <button
                    onClick={onDismiss}
                    className="text-gray-300 hover:text-amber-500 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
        </div>
        
        <p className={`text-sm font-bold text-gray-700 leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
          {cleanMessage}
        </p>

        {isLong && (
            <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-[10px] font-bold text-amber-600 hover:underline uppercase tracking-tight"
            >
                {expanded ? "Show Less" : "Show Full Content"}
            </button>
        )}
      </div>

      {isActive && planId && (
        <div className="mt-6">
            <Link
                href={`/study-room?planId=${planId}`}
                className="inline-flex items-center justify-center w-full bg-amber-500 text-white text-[10px] font-bold py-3 rounded-xl uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10 active:scale-95"
            >
                Enter Study Room
            </Link>
        </div>
      )}
    </div>
  );
}
