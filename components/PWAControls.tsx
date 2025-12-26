"use client";

import { useEffect, useState } from "react";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }
}

export function PWAControls() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installAvailable, setInstallAvailable] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .catch(() => {
          // Ignore registration errors in MVP.
        });
    }

    // Listen for install prompt.
    const handler = (event: Event) => {
      const e = event as BeforeInstallPromptEvent;
      e.preventDefault();
      setInstallEvent(e);
      setInstallAvailable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Notification support.
    if (typeof Notification !== "undefined") {
      setNotificationsSupported(true);
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function handleInstallClick() {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallAvailable(false);
    setInstallEvent(null);
  }

  async function handleRequestNotificationPermission() {
    if (!notificationsSupported) return;
    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
    } catch {
      // Ignore errors for MVP.
    }
  }

  if (!installAvailable && !notificationsSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 text-xs text-slate-900">
      {installAvailable && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Install SAT Tracker
        </button>
      )}

      {notificationsSupported && notificationPermission === "default" && (
        <button
          type="button"
          onClick={handleRequestNotificationPermission}
          className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Enable notifications
        </button>
      )}
    </div>
  );
}


