"use client";

import { useEffect, useState, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

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
      console.error("Error playing notification sound:", error);
    }
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    let mounted = true;

    async function fetchNotifications() {
      if (!mounted) return;

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

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
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user || !mounted) return;

      await fetchNotifications();

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
            fetchNotifications();
          }
        )
        .subscribe();
      
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
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) return;

    const dismissedAt = new Date().toISOString();
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, dismissed_at: dismissedAt } : n))
    );

    const { error } = await supabase
      .from("notifications")
      .update({ dismissed_at: dismissedAt })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error dismissing notification:", error);
    }
  }

  async function handleDismissAll() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) return;

    const notificationIds = visibleNotifications.map((n) => n.id);
    const dismissedAt = new Date().toISOString();

    setVisibleNotifications([]);
    setNotifications((prev) =>
      prev.map((n) => (notificationIds.includes(n.id) ? { ...n, dismissed_at: dismissedAt } : n))
    );

    const { error } = await supabase
      .from("notifications")
      .update({ dismissed_at: dismissedAt })
      .in("id", notificationIds)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error dismissing all notifications:", error);
    }
  }

  useEffect(() => {
    const updateVisibleNotifications = () => {
      const isMobile = window.innerWidth < 1024;
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
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 w-80 max-w-[calc(100vw-2rem)]">
      <button
        onClick={handleDismissAll}
        className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg transition-all self-end active:scale-95"
      >
        Clear All
      </button>

      {visibleNotifications.map((notification, index) => {
          const isNew = new Date().getTime() - new Date(notification.created_at).getTime() < 5 * 60 * 1000;
          const planMatch = notification.message.match(/{{planId:(.*?)}}/);
          const planId = planMatch?.[1];
          const cleanMessage = notification.message.replace(/{{planId:.*?}}/g, "").trim();
          
          return (
            <div
              key={notification.id}
              className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100 relative overflow-hidden group animate-in slide-in-from-right-full"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isNew && (
                      <span className="bg-amber-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full">
                        New
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                       {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-xs font-bold text-gray-700 leading-relaxed mb-4">
                    {cleanMessage}
                  </p>

                  {planId && (
                      <Link
                        href={`/study-room?planId=${planId}`}
                        onClick={() => handleDismiss(notification.id)}
                        className="bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all mb-1 inline-block"
                      >
                        Enter Study Room
                      </Link>
                  )}
                </div>
                
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="text-gray-300 hover:text-amber-500 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
      })}
    </div>
  );
}
