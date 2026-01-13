"use client";

import { useEffect, useState, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Notification = {
  id: string;
  message: string;
  created_at: string;
  dismissed_at: string | null;
};

export function NotificationPopups() {
  const supabase = getSupabaseBrowserClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const playedSoundsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  function playNotificationSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback: silent if audio context fails
      console.error("Error playing notification sound:", error);
    }
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    let mounted = true;

    async function fetchNotifications() {
      if (!mounted) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("id, message, created_at, dismissed_at")
        .eq("user_id", user.id)
        .is("dismissed_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      if (data && mounted) {
        setNotifications(data as Notification[]);

        // Play sound logic
        if (isFirstLoadRef.current) {
            data.forEach((n) => playedSoundsRef.current.add(n.id));
            isFirstLoadRef.current = false;
        } else {
            let hasNew = false;
            data.forEach((notif) => {
                if (!playedSoundsRef.current.has(notif.id)) {
                    hasNew = true;
                    playedSoundsRef.current.add(notif.id);
                }
            });

            if (hasNew) {
                playNotificationSound();
            }
        }
      }
    }

    async function setupSubscription() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) return;

      await fetchNotifications();

      // Set up real-time subscription
      channel = supabase
        .channel(`notifications-popups:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('[NotificationPopups] Realtime event received:', payload);
            fetchNotifications();
          }
        )
        .subscribe((status) => {
          console.log('[NotificationPopups] Subscription status:', status);
        });
      
      // Reduced polling as fallback (60 seconds)
      intervalId = setInterval(fetchNotifications, 60000);
    }

    setupSubscription();

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [supabase]);

  async function handleDismiss(notificationId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Optimistic UI update - instant feedback
    const dismissedAt = new Date().toISOString();
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, dismissed_at: dismissedAt } : n))
    );

    // Update database - Realtime will propagate to other components
    const { error } = await supabase
      .from("notifications")
      .update({ dismissed_at: dismissedAt })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[NotificationPopups] Error dismissing:", error);
      // Revert optimistic update on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, dismissed_at: null } : n))
      );
    }
  }

  async function handleDismissAll() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const notificationIds = visibleNotifications.map((n) => n.id);
    const dismissedAt = new Date().toISOString();

    // Optimistic update - instant feedback
    setVisibleNotifications([]);
    setNotifications((prev) =>
      prev.map((n) => (notificationIds.includes(n.id) ? { ...n, dismissed_at: dismissedAt } : n))
    );

    // Update database - Realtime will propagate
    const { error } = await supabase
      .from("notifications")
      .update({ dismissed_at: dismissedAt })
      .in("id", notificationIds)
      .eq("user_id", user.id);

    if (error) {
      console.error("[NotificationPopups] Error dismissing all:", error);
      // Revert optimistic update on error
      setNotifications((prev) =>
        prev.map((n) => (notificationIds.includes(n.id) ? { ...n, dismissed_at: null } : n))
      );
    }
  }

  // Limit visible notifications: 2 for mobile, 3 for desktop
  useEffect(() => {
    const updateVisibleNotifications = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      const maxVisible = isMobile ? 2 : 3;

      const undismissed = notifications.filter((n) => !n.dismissed_at);
      setVisibleNotifications(undismissed.slice(0, maxVisible));
    };

    updateVisibleNotifications();
    window.addEventListener("resize", updateVisibleNotifications);
    return () => window.removeEventListener("resize", updateVisibleNotifications);
  }, [notifications]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {/* Dismiss All Button */}
      <button
        onClick={handleDismissAll}
        className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg transition-colors self-end"
      >
        Dismiss All
      </button>

      {/* Notifications */}
      {visibleNotifications.map((notification, index) => {
          // Check if notification is "new" (created < 5 mins ago)
          const isNew = new Date().getTime() - new Date(notification.created_at).getTime() < 5 * 60 * 1000;
          
          return (
            <div
            key={notification.id}
            className="bg-white rounded-lg shadow-lg ring-1 ring-gray-200 p-3 transform transition-all duration-300 ease-out relative overflow-hidden"
            style={{
                animation: `slideUp 0.3s ease-out ${index * 50}ms both`,
            }}
            >
            {isNew && (
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            )}
            <div className="flex items-start justify-between gap-2 pl-2">
                <div className="flex-1">
                    {isNew && (
                        <span className="inline-flex items-center rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 mb-1">
                            New
                        </span>
                    )}
                    <p className="text-xs text-gray-900 leading-relaxed">{notification.message}</p>
                </div>
                <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss notification"
                >
                <svg
                    className="h-4 w-4"
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
            <p className="text-[10px] text-gray-500 mt-1.5 pl-2">
                {new Date(notification.created_at).toLocaleString()}
            </p>
            </div>
          );
      })}
    </div>
  );
}

