"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    async function checkAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    }
    checkAuth();

    // Animate counters
    const animateCount = (target: number, setter: (val: number) => void, duration: number) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCount(132, setUserCount, 2000);
    animateCount(1451, setSessionCount, 2500);
    animateCount(4.97, setRating, 1500);
  }, []);

  const appUrl = "https://app.satracker.uz";

  return (
    <div className="w-full min-h-screen bg-background overflow-hidden relative">
      {/* Background - Clean & Static for Performance */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className={`relative text-center max-w-6xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Badge Element - Optimized */}
          <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 
                          rounded-full border border-primary/30 mb-10 shadow-xl shadow-primary/10 backdrop-blur-sm
                          animate-in fade-in slide-in-from-top-5 duration-700"
               style={{ animationDelay: '0.1s' }}>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <p className="text-xs font-extrabold text-primary uppercase tracking-[0.2em]">{t("hero.badge")}</p>
          </div>

          {/* Main Heading with Enhanced Gradient */}
          <h1 className="text-6xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-9xl mb-10 leading-[0.95] font-heading
                         animate-in fade-in slide-in-from-bottom-10 duration-1000"
              style={{ animationDelay: '0.2s' }}>
            <span className="block text-gray-900">
              {t("hero.title.master")}
            </span>
            <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 
                           animate-gradient bg-[length:200%_auto] drop-shadow-[0_0_30px_rgba(251,146,60,0.3)]">
              {t("hero.title.journey")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-4xl text-xl font-semibold text-secondary/90 leading-relaxed sm:text-2xl md:text-3xl mb-16 px-4
                        animate-in fade-in slide-in-from-bottom-8 duration-1000"
             style={{ animationDelay: '0.4s' }}>
            {t("hero.subtitle.plan")} <span className="text-amber-600 dark:text-amber-400 font-black">{t("hero.subtitle.smarter")}</span>. 
            {t("hero.subtitle.study")} <span className="text-blue-600 dark:text-blue-400 font-black">{t("hero.subtitle.focused")}</span>. 
            {t("hero.subtitle.track")} <span className="text-purple-600 dark:text-purple-400 font-black">{t("hero.subtitle.progress")}</span>.
            <br className="hidden sm:block" />
            <span className="text-lg sm:text-xl md:text-2xl opacity-70 mt-2 block">
              {t("hero.subtitle.desc")}
            </span>
          </p>

          {/* Stats Grid - Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14 max-w-5xl mx-auto
                          animate-in fade-in slide-in-from-bottom-6 duration-1000"
               style={{ animationDelay: '0.6s' }}>
            
            <div className="group relative bg-gradient-to-br from-card via-card to-background p-8 rounded-3xl border border-border 
                           hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300
                           overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-5xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-3">
                  {userCount.toLocaleString()}+
                </div>
                <div className="text-sm font-bold text-secondary uppercase tracking-[0.15em]">{t("stats.active_students")}</div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-card via-card to-background p-8 rounded-3xl border border-border 
                           hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300
                           overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-3">
                  {sessionCount.toLocaleString()}+
                </div>
                <div className="text-sm font-bold text-secondary uppercase tracking-[0.15em]">{t("stats.study_sessions")}</div>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-card via-card to-background p-8 rounded-3xl border border-border 
                           hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300
                           overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-5xl font-black bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                    {rating.toFixed(2)}
                  </span>
                  <svg className="w-10 h-10 text-amber-400 fill-current drop-shadow-lg" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-secondary uppercase tracking-[0.15em]">{t("stats.user_rating")}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 
                          animate-in fade-in slide-in-from-bottom-8 duration-1000"
               style={{ animationDelay: '0.8s' }}>
            <Link
              href={isAuthenticated ? `${appUrl}/dashboard` : `${appUrl}/login`}
              className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-lg shadow-xl shadow-amber-500/30 
                       hover:scale-105 active:scale-95 overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isAuthenticated ? t("btn.dashboard") : t("btn.get_started")}
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            <Link
              href="#features"
              className="group px-10 py-5 rounded-2xl bg-card text-primary border-2 border-amber-100 font-black text-lg 
                       hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-500 transition-all duration-300 hover:scale-105 active:scale-95 
                       flex items-center justify-center gap-3"
            >
              {t("btn.explore")}
              <svg className="w-6 h-6 group-hover:translate-y-1 transition-transform duration-300 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>

          {!isAuthenticated && (
            <p className="text-base text-secondary/80 font-semibold animate-in fade-in duration-1000"
               style={{ animationDelay: '1s' }}>
              {t("login.already_account")}{' '}
              <Link href={`${appUrl}/login`} className="text-amber-600 dark:text-amber-400 font-black hover:underline decoration-2 underline-offset-4 transition-all">
                {t("btn.signin")} →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <h2 className="text-5xl font-black tracking-tight sm:text-6xl font-heading mb-8">
            {t("features.title")}{' '}
            <span className="block mt-2 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              {t("features.subtitle")}
            </span>
          </h2>
          <p className="text-xl text-secondary/90 font-semibold leading-relaxed">
            {t("features.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Feature 1 */}
          <div className="group relative bg-gradient-to-br from-card to-background p-8 rounded-[2.5rem] border border-border transition-all duration-300 hover:shadow-2xl hover:border-amber-500/30 hover:-translate-y-2">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="relative">
              <h3 className="text-2xl font-black text-primary mb-4">{t("feature.planning.title")}</h3>
              <p className="text-base font-medium leading-relaxed text-secondary/80">
                {t("feature.planning.desc")}
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative bg-gradient-to-br from-card to-background p-8 rounded-[2.5rem] border border-border transition-all duration-300 hover:shadow-2xl hover:border-blue-500/30 hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="relative">
              <h3 className="text-2xl font-black text-primary mb-4">{t("feature.pomodoro.title")}</h3>
              <p className="text-base font-medium leading-relaxed text-secondary/80">
                {t("feature.pomodoro.desc")}
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative bg-gradient-to-br from-card to-background p-8 rounded-[2.5rem] border border-border transition-all duration-300 hover:shadow-2xl hover:border-purple-500/30 hover:-translate-y-2">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="relative">
              <h3 className="text-2xl font-black text-primary mb-4">{t("feature.analytics.title")}</h3>
              <p className="text-base font-medium leading-relaxed text-secondary/80">
                {t("feature.analytics.desc")}
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="group relative bg-gradient-to-br from-card to-background p-8 rounded-[2.5rem] border border-border transition-all duration-300 hover:shadow-2xl hover:border-green-500/30 hover:-translate-y-2">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="relative">
              <h3 className="text-2xl font-black text-primary mb-4">{t("feature.daily.title")}</h3>
              <p className="text-base font-medium leading-relaxed text-secondary/80">
                {t("feature.daily.desc")}
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="group relative bg-gradient-to-br from-card to-background p-8 rounded-[2.5rem] border border-border transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/30 hover:-translate-y-2">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="relative">
              <h3 className="text-2xl font-black text-primary mb-4">{t("feature.room.title")}</h3>
              <p className="text-base font-medium leading-relaxed text-secondary/80">
                {t("feature.room.desc")}
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="group relative bg-gradient-to-br from-card to-background p-8 rounded-[2.5rem] border border-border transition-all duration-300 hover:shadow-2xl hover:border-pink-500/30 hover:-translate-y-2">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mb-6 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="relative">
              <h3 className="text-2xl font-black text-primary mb-4">{t("feature.profile.title")}</h3>
              <p className="text-base font-medium leading-relaxed text-secondary/80">
                {t("feature.profile.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Section - Ultra Enhanced */}
      <section id="premium" className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="relative rounded-[3rem] bg-gradient-to-br from-amber-600 via-orange-500 to-amber-600 bg-[length:200%_200%] 
                        animate-gradient px-10 py-24 text-center shadow-2xl shadow-amber-500/40 overflow-hidden">
          {/* Decorative animated elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-10 left-10 w-24 h-24 border-3 border-white rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-10 right-10 w-32 h-32 border-3 border-white rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/4 w-20 h-20 border-3 border-white rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
            <div className="absolute top-20 right-1/4 w-16 h-16 border-3 border-white rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          </div>

          <div className="relative z-10">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 px-7 py-3.5 bg-white/20 backdrop-blur-md rounded-full mb-10 shadow-xl">
              <svg className="w-6 h-6 text-amber-200 fill-current animate-pulse" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-sm font-black text-white uppercase tracking-[0.2em]">{t("premium.badge")}</p>
            </div>

            <h2 className="text-5xl font-black text-white sm:text-6xl md:text-7xl mb-8 leading-tight font-heading drop-shadow-2xl">
              {t("premium.title")}
            </h2>
            <p className="mx-auto max-w-3xl text-2xl font-bold text-white/95 mb-16 leading-relaxed drop-shadow-lg">
              {t("premium.subtitle")}
            </p>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto mb-14">
              <div className="bg-white/10 backdrop-blur-lg p-10 rounded-[2rem] border-3 border-white/40 hover:bg-white/20 
                            transition-all duration-500 hover:scale-105 hover:shadow-2xl shadow-white/20 group">
                <div className="text-white/80 text-sm font-black uppercase tracking-[0.15em] mb-6">{t("plan.monthly")}</div>
                <div className="text-6xl font-black text-white mb-3 group-hover:scale-110 transition-transform duration-300">34,540</div>
                <div className="text-white/90 text-base font-bold mb-8">{t("plan.per_month")}</div>
                <ul className="text-left space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-white font-semibold text-base">
                    <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t("benefit.unlimited")}
                  </li>
                  <li className="flex items-center gap-3 text-white font-semibold text-base">
                    <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t("benefit.analytics")}
                  </li>
                  <li className="flex items-center gap-3 text-white font-semibold text-base">
                    <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t("benefit.support")}
                  </li>
                </ul>
                <Link 
                  href="https://t.me/@satrackerbot"
                  target="_blank"
                  className="block w-full py-5 bg-white text-amber-600 font-black text-lg rounded-2xl hover:bg-white/90 
                           transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  {t("plan.choose_monthly")}
                </Link>
              </div>

              <div className="relative bg-white/20 backdrop-blur-lg p-10 rounded-[2rem] border-3 border-amber-200 hover:bg-white/30 
                            transition-all duration-500 hover:scale-105 hover:shadow-2xl shadow-white/20 group">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-200 text-amber-900 px-6 py-2.5 
                              rounded-full text-xs font-black uppercase tracking-wider shadow-xl animate-bounce"
                     style={{ animationDuration: '2s' }}>
                  {t("plan.save")}
                </div>
                <div className="text-white/80 text-sm font-black uppercase tracking-[0.15em] mb-6">{t("plan.quarterly")}</div>
                <div className="text-6xl font-black text-white mb-3 group-hover:scale-110 transition-transform duration-300">97,570</div>
                <div className="text-white/90 text-base font-bold mb-8">{t("plan.for_3_months")}</div>
                <ul className="text-left space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-white font-semibold text-base">
                    <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t("benefit.everything")}
                  </li>
                  <li className="flex items-center gap-3 text-white font-semibold text-base">
                    <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t("benefit.lock")}
                  </li>
                  <li className="flex items-center gap-3 text-white font-semibold text-base">
                    <svg className="w-6 h-6 text-green-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t("benefit.value")}
                  </li>
                </ul>
                <Link 
                  href="https://t.me/@satrackerbot"
                  target="_blank"
                  className="block w-full py-5 bg-white text-amber-600 font-black text-lg rounded-2xl hover:bg-white/90 
                           transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  {t("plan.choose_quarterly")}
                </Link>
              </div>
            </div>

            <p className="text-white/90 text-base font-semibold max-w-3xl mx-auto leading-relaxed">
              {t("premium.footer")} 🌟
            </p>
          </div>
        </div>
      </section>

      {/* Results/Testimonials Section - Infinite Marquee */}
      <section className="relative w-full py-32 overflow-hidden bg-background">
        <div className="text-center mb-20 px-4">
          <h2 className="text-5xl font-black tracking-tight sm:text-6xl font-heading mb-8">
            {t("reviews.title")}<br/>
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              {t("reviews.subtitle")}
            </span>
          </h2>
          <p className="text-xl text-secondary/90 font-semibold max-w-3xl mx-auto leading-relaxed">
            {t("reviews.desc")}
          </p>
        </div>

        {/* Marquee Container */}
        <div className="flex w-full overflow-hidden mask-fade-sides">
          <div className="flex gap-8 animate-marquee w-max pl-8 hover:pause">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-8">
                {/* Review 1 */}
                <div className="w-[400px] flex-shrink-0 group bg-gradient-to-br from-card to-background p-10 rounded-[2rem] border border-border shadow-xl">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                       <svg key={i} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-secondary/90 font-semibold mb-6 leading-relaxed text-lg">{t("reviews.sarah")}</p>
                  <div className="font-black text-primary text-lg">Sarah M.</div>
                  <div className="text-base text-amber-600 dark:text-amber-400 font-bold">{t("reviews.scored")} 1480</div>
                </div>

                {/* Review 2 */}
                <div className="w-[400px] flex-shrink-0 group bg-gradient-to-br from-card to-background p-10 rounded-[2rem] border border-border shadow-xl">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                       <svg key={i} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-secondary/90 font-semibold mb-6 leading-relaxed text-lg">{t("reviews.james")}</p>
                  <div className="font-black text-primary text-lg">James K.</div>
                  <div className="text-base text-blue-600 dark:text-blue-400 font-bold">{t("reviews.scored")} 1520</div>
                </div>

                {/* Review 3 */}
                <div className="w-[400px] flex-shrink-0 group bg-gradient-to-br from-card to-background p-10 rounded-[2rem] border border-border shadow-xl">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                       <svg key={i} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-secondary/90 font-semibold mb-6 leading-relaxed text-lg">{t("reviews.emily")}</p>
                  <div className="font-black text-primary text-lg">Emily R.</div>
                  <div className="text-base text-purple-600 dark:text-purple-400 font-bold">{t("reviews.scored")} 1500</div>
                </div>

                {/* Review 4 */}
                <div className="w-[400px] flex-shrink-0 group bg-gradient-to-br from-card to-background p-10 rounded-[2rem] border border-border shadow-xl">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                       <svg key={i} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-secondary/90 font-semibold mb-6 leading-relaxed text-lg">{t("reviews.david")}</p>
                  <div className="font-black text-primary text-lg">David L.</div>
                  <div className="text-base text-green-600 dark:text-green-400 font-bold">{t("reviews.scored")} 1550</div>
                </div>

                {/* Review 5 */}
                <div className="w-[400px] flex-shrink-0 group bg-gradient-to-br from-card to-background p-10 rounded-[2rem] border border-border shadow-xl">
                  <div className="flex items-center gap-1 mb-5">
                     {[...Array(5)].map((_, i) => (
                       <svg key={i} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-secondary/90 font-semibold mb-6 leading-relaxed text-lg">{t("reviews.layla")}</p>
                  <div className="font-black text-primary text-lg">Layla A.</div>
                  <div className="text-base text-rose-600 dark:text-rose-400 font-bold">{t("reviews.scored")} 1420</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Ultra Enhanced */}
      <section className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="relative rounded-[3rem] bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-10 py-28 text-center 
                        shadow-2xl shadow-amber-500/40 overflow-hidden bg-[length:200%_auto] animate-gradient">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTAgMTRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
          
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white sm:text-6xl md:text-7xl mb-10 leading-tight font-heading drop-shadow-2xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto max-w-3xl text-2xl font-bold text-white/95 mb-16 leading-relaxed drop-shadow-lg">
              {t("cta.desc")}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6">
              <Link
                href={isAuthenticated ? `${appUrl}/dashboard` : `${appUrl}/login`}
                className="group relative rounded-2xl bg-white px-16 py-7 text-xl font-black text-amber-600 
                         shadow-2xl hover:shadow-white/40 transition-all duration-500 hover:scale-110 active:scale-95 
                         overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isAuthenticated ? t("btn.dashboard") : t("cta.start")}
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-600/10 to-transparent 
                              translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </Link>
              {!isAuthenticated && (
                <Link
                  href={`${appUrl}/premium`}
                  className="rounded-2xl bg-white/10 backdrop-blur-md px-16 py-7 text-xl font-black text-white 
                           border-3 border-white/40 hover:bg-white/20 transition-all duration-500 
                           hover:scale-110 active:scale-95 shadow-xl flex items-center justify-center gap-3"
                >
                  {t("cta.upgrade")}
                  <svg className="w-6 h-6 text-amber-200 fill-current animate-pulse" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="relative mx-auto max-w-7xl px-4 py-20 border-t-2 border-border">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-8 mb-8">
            <Link href={`${appUrl}/about`} className="text-base font-black text-secondary hover:text-primary transition-colors hover:scale-110 transition-transform duration-300">
              {t("footer.about")}
            </Link>
            <span className="text-border font-bold">|</span>
            <Link href={`${appUrl}/privacy`} className="text-base font-black text-secondary hover:text-primary transition-colors hover:scale-110 transition-transform duration-300">
              {t("footer.privacy")}
            </Link>
            <span className="text-border font-bold">|</span>
            <Link href={`${appUrl}/login`} className="text-base font-black text-secondary hover:text-primary transition-colors hover:scale-110 transition-transform duration-300">
              {t("btn.signin")}
            </Link>
            <span className="text-border font-bold">|</span>
            <Link href={`${appUrl}/premium`} className="text-base font-black text-secondary hover:text-amber-600 dark:hover:text-amber-400 transition-colors hover:scale-110 transition-transform duration-300">
              Premium
            </Link>
            <span className="text-border font-bold">|</span>
            <a href="https://t.me/@satrackerbot" target="_blank" rel="noopener noreferrer" 
               className="text-base font-black text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:scale-110 transition-transform duration-300">
              {t("footer.contact")}
            </a>
          </div>
          <p className="text-base font-bold text-secondary/70">
            © 2026 SAT Tracker. Built with ❤️ to help students achieve their SAT goals.
          </p>
        </div>
      </footer>
    </div>
  );
}
