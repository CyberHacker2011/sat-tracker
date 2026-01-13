"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchNotificationCount() {
      if (!mounted) return;
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setNotificationCount(0);
        return;
      }

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("dismissed_at", null);

      if (mounted) {
        if (!error && count !== null) {
          setNotificationCount(count);
        } else {
          setNotificationCount(0);
        }
      }
    }

    async function setupSubscription() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) return;

      // Initial Fetch
      fetchNotificationCount();

      // Subscribe to ALL changes for this user
      channel = supabase
        .channel(`notification-count:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: { eventType: string; new?: { dismissed_at?: string | null }; old?: { dismissed_at?: string | null } }) => {
            console.log('[Navbar] Realtime event:', payload.eventType, payload);
            
            // Optimistic counter update based on event type
            if (payload.eventType === 'INSERT' && !payload.new?.dismissed_at) {
              // New notification created
              setNotificationCount((prev) => prev + 1);
            } else if (payload.eventType === 'UPDATE' && payload.new?.dismissed_at && !payload.old?.dismissed_at) {
              // Notification dismissed
              setNotificationCount((prev) => Math.max(0, prev - 1));
            }
            
            // Also fetch to ensure accuracy
            fetchNotificationCount();
          }
        )
        .subscribe((status) => {
          console.log('[Navbar] Subscription status:', status);
        });
    }

    setupSubscription();

    // Reduced polling as fallback (60 seconds)
    const intervalId = setInterval(fetchNotificationCount, 60000);

    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(intervalId);
    };
  }, [supabase, isAuthenticated]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/focus", label: "Pomodoro 🍅" },
    { href: "/plan", label: "Plan", requiresAuth: true },
    { href: "/check-in", label: "Check-in", requiresAuth: true },
    { href: "/archive", label: "Archive", requiresAuth: true },
    { href: "https://t.me/ibrohimfr", label: "Feedback", external: true },
  ];

  const filteredNavLinks = navLinks.filter(link => !link.requiresAuth || isAuthenticated);

  return (
    <header className="border-b border-gray-200 bg-white relative z-40">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-amber-600 transition-colors">
            SAT Tracker
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-8">
          {filteredNavLinks.map((link) => {
            const isActive = pathname === link.href;
            const isExternal = (link as any).external;
            
            if (isExternal) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-amber-600 transition-colors"
                  >
                    {link.label}
                  </a>
                );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold leading-6 transition-colors ${isActive
                  ? "text-amber-600"
                  : "text-gray-900 hover:text-amber-600"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          {isAuthenticated && (
            <Link
              href="/notifications"
              className="relative text-gray-900 hover:text-amber-600 transition-colors"
              aria-label="Notifications"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-amber-600 transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 lg:hidden">
          {isAuthenticated && (
            <Link
              href="/notifications"
              className="relative text-gray-900 hover:text-amber-600 transition-colors"
              aria-label="Notifications"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-gray-700"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {!isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-4 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-200">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-gray-900" onClick={() => setIsOpen(false)}>
                SAT Tracker
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="-m-2.5 rounded-lg p-2.5 text-gray-700 hover:bg-gray-100"
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-200">
                <div className="space-y-2 py-6">
                  {filteredNavLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const isExternal = (link as any).external;

                    if (isExternal) {
                        return (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                          >
                            {link.label}
                          </a>
                        );
                    }

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${isActive
                          ? "bg-amber-50 text-amber-600"
                          : "text-gray-900 hover:bg-gray-50"
                          }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="py-6">
                  {isAuthenticated ? (
                    <button
                      onClick={handleSignOut}
                      className="-mx-3 block w-full rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 text-left"
                    >
                      Sign out
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="-mx-3 block rounded-lg bg-amber-600 px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-amber-500 text-center"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
