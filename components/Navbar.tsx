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
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
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
      
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

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
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

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

  interface NavLink {
    href: string;
    label: string;
    requiresAuth?: boolean;
    external?: boolean;
  }

  const navLinks: NavLink[] = [
    { href: isAuthenticated ? "/dashboard" : "/", label: "Home" },
    { href: "/study-room", label: "Study Room", requiresAuth: true },
    { href: "/focus", label: "Pomodoro" },
    { href: "/plan", label: "Plan", requiresAuth: true },
    { href: "/check-in", label: "Check-in", requiresAuth: true },
    { href: "/archive", label: "Archive", requiresAuth: true },
    { href: "https://t.me/ibrohimfr", label: "Feedback", external: true },
  ];

  const filteredNavLinks = navLinks.filter(link => !link.requiresAuth || isAuthenticated);

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="group flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">S</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-amber-500 transition-colors">
              SAT TRACKER
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          {filteredNavLinks.map((link) => {
            const isActive = pathname === link.href;
            const isExternal = link.external;
            
            if (isExternal) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gray-600 hover:text-amber-500 transition-colors"
                  >
                    {link.label}
                  </a>
                );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold px-3 py-2 rounded-lg transition-all ${isActive
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "text-gray-600 hover:text-amber-500 hover:bg-amber-50"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="flex items-center gap-4 ml-2 pl-4 border-l border-gray-100">
            {isAuthenticated && (
              <Link
                href="/notifications"
                className="relative text-gray-600 hover:text-amber-500 transition-colors"
                aria-label="Notifications"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Link>
            )}
            
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold text-gray-600 hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-all shadow-md active:scale-95"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-4 lg:hidden">
          {isAuthenticated && (
            <Link
              href="/notifications"
              className="relative text-gray-600 hover:text-amber-500 transition-colors"
              aria-label="Notifications"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600"
          >
            <span className="sr-only">Open main menu</span>
            {!isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50 bg-gray-500/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm border-l border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">S</div>
                <span className="text-xl font-bold text-gray-900">SAT Tracker</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-600"
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="divide-y divide-gray-100">
                <div className="space-y-2 py-6">
                  {filteredNavLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const isExternal = link.external;

                    if (isExternal) {
                        return (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-3 text-base font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
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
                        className={`block px-3 py-3 text-base font-semibold rounded-lg transition-all ${isActive
                          ? "bg-amber-500 text-white shadow-md"
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
                      className="w-full px-3 py-3 text-base font-semibold text-red-500 bg-red-50 rounded-lg text-left"
                    >
                      Sign out
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full bg-amber-500 text-white py-3 rounded-lg text-base font-semibold text-center shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      Sign In
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
