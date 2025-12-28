"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

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
    async function fetchNotifications() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw userError ?? new Error("You must be signed in to view notifications.");
        }

        const { data, error: fetchError } = await supabase
          .from("notifications")
          .select("id, message, created_at, dismissed_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setNotifications((data as Notification[]) || []);
      } catch (err: any) {
        setError(err.message ?? "Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [supabase]);

  async function handleDismiss(notificationId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      setError(error.message);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, dismissed_at: new Date().toISOString() } : n
      )
    );
  }

  const activeNotifications = notifications.filter((n) => !n.dismissed_at);
  const dismissedNotifications = notifications.filter((n) => n.dismissed_at);

  return (
    <div className="mx-auto max-w-6xl p-3 md:p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Notifications
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          View all your notifications. Active notifications appear in-app as popups.
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
          <p className="text-sm text-gray-600">Loading notifications…</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
          <p className="text-sm text-gray-600">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Notifications */}
          {activeNotifications.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active ({activeNotifications.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {activeNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Dismiss notification"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dismissed Notifications */}
          {dismissedNotifications.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dismissed ({dismissedNotifications.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {dismissedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-6 py-4 opacity-60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <div className="flex gap-4 mt-1">
                          <p className="text-xs text-gray-500">
                            Created: {new Date(notification.created_at).toLocaleString()}
                          </p>
                          {notification.dismissed_at && (
                            <p className="text-xs text-gray-500">
                              Dismissed: {new Date(notification.dismissed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

