"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Palette,
  ChevronRight,
  Zap,
  Target,
  Flame,
} from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    }
    checkAuth();
  }, []);

  if (!mounted) return null;

  const appUrl = "https://app.satracker.uz";

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("blue");
    else setTheme("light");
  };

  const FeatureRow = ({
    title,
    desc,
    image,
    reverse = false,
  }: {
    title: string;
    desc: string;
    image: string;
    reverse?: boolean;
  }) => (
    <div
      className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 py-24`}
    >
      <div className="flex-1 space-y-8">
        <div className="inline-block p-3 rounded-2xl bg-primary/5 text-primary">
          {reverse ? <Target size={32} /> : <Zap size={32} />}
        </div>
        <h3 className="text-4xl md:text-6xl font-black text-primary tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-xl text-secondary leading-relaxed font-semibold max-w-xl">
          {desc}
        </p>
      </div>
      <div className="flex-1 w-full relative">
        <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
        <div className="relative group overflow-hidden rounded-[3rem] border-8 border-card shadow-2xl transition-all duration-700 hover:scale-[1.03] hover:rotate-1">
          <img
            src={`/${image}`}
            alt={title}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center rotate-3 shadow-xl shadow-primary/20">
              <span className="text-white font-black text-2xl group-hover:rotate-12 transition-transform">
                S
              </span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary">
              SAT TRACKER
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10 font-black text-secondary/70 text-sm uppercase tracking-widest">
            <Link
              href="#features"
              className="hover:text-primary transition-all hover:scale-105"
            >
              {t("btn.explore")}
            </Link>
            <Link
              href="#why"
              className="hover:text-primary transition-all hover:scale-105"
            >
              {t("footer.about")}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-primary/5 transition-all active:scale-90"
              title="Change Theme"
            >
              {theme === "light" && (
                <Sun size={20} className="text-amber-500" />
              )}
              {theme === "dark" && (
                <Moon size={20} className="text-indigo-400" />
              )}
              {theme === "blue" && (
                <Palette size={20} className="text-blue-500" />
              )}
            </button>

            <Link
              href={isAuthenticated ? `${appUrl}/dashboard` : `${appUrl}/login`}
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
            >
              <span className="hidden sm:inline">
                {isAuthenticated ? t("btn.dashboard") : t("btn.signin")}
              </span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-20">
        {/* Dynamic Gen Z Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />

          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-card/50 backdrop-blur-md text-primary rounded-full text-xs font-black uppercase tracking-[0.25em] border border-border/50 animate-bounce">
              <Flame size={14} className="text-orange-500" />
              {t("hero.badge")}
            </div>

            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-primary transition-all">
              GO MODE <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient bg-[length:200%_auto]">
                ON YOUR SAT
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-secondary font-bold max-w-3xl mx-auto leading-relaxed">
              Stop guessing, start{" "}
              <span className="text-primary italic underline underline-offset-8 decoration-4">
                slaying
              </span>
              . The ultimate GPS for your 1600 journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link
              href={isAuthenticated ? `${appUrl}/dashboard` : `${appUrl}/login`}
              className="group relative px-12 py-6 bg-primary text-white font-black text-2xl rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">{t("btn.get_started")}</span>
            </Link>
          </div>

          <div className="relative mt-20 max-w-6xl mx-auto">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 blur-[60px] rounded-full animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/10 blur-[80px] rounded-full animate-pulse delay-700" />
            <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-card shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-primary/10 transition-all duration-1000 hover:scale-[1.02] bg-card">
              <img
                src="/dashboard.png"
                alt="Dashboard"
                className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </section>

        {/* Feature Showcase */}
        <section id="features" className="max-w-7xl mx-auto px-6 mt-60">
          <div className="flex flex-col items-center gap-4 mb-20 text-center">
            <span className="text-sm font-black text-primary uppercase tracking-[0.5em]">
              The Suite
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-primary tracking-tighter">
              Everything to win.
            </h2>
          </div>

          <FeatureRow
            title="Supreme Dashboard"
            desc="Vibe check your progress daily. Everything you need is right there—clean, fast, and focused."
            image="dashboard.png"
          />

          <FeatureRow
            title={t("feature.planning.title")}
            desc={t("feature.planning.desc")}
            image="study-plan.png"
            reverse
          />

          <FeatureRow
            title={t("feature.room.title")}
            desc={t("feature.room.desc")}
            image="study-room.png"
          />

          <FeatureRow
            title="The Archives"
            desc="Keep the receipts. Check your growth history and track how you've leveled up over time."
            image="archive.png"
            reverse
          />
        </section>

        {/* The Study Room - One Workspace, All Sessions */}
        <section className="bg-primary/5 pt-32 pb-0 my-8 overflow-hidden">
          <div className="space-y-20">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
              <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter italic font-heading">
                THE WORKSPACE.
              </h2>
              <p className="text-2xl md:text-3xl text-secondary font-bold leading-relaxed">
                No context switching. Everything you need is right here in{" "}
                <span className="text-primary italic">
                  one unified workspace
                </span>
                . Your journey is divided into focused{" "}
                <span className="bg-primary/10 px-2 rounded-lg">
                  Study Sessions
                </span>{" "}
                to maximize retention and keep your flow state unbroken.
              </p>
            </div>

            <div className="relative flex overflow-hidden">
              <div className="flex animate-marquee py-12 w-max hover:[animation-play-state:paused]">
                {[...Array(2)].map((_, listIdx) => (
                  <div key={listIdx} className="flex gap-8 px-4">
                    {[
                      "Screenshot 2026-01-28 203204.png",
                      "Screenshot 2026-01-28 203210.png",
                      "Screenshot 2026-01-28 203156.png",
                      "Screenshot 2026-01-28 202951.png",
                      "Screenshot 2026-01-28 203300.png",
                      "Screenshot 2026-01-28 203328.png",
                    ].map((img, i) => (
                      <div
                        key={i}
                        className="w-[600px] h-[346px] bg-card rounded-[1rem] border border-border overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105 shadow-xl flex-shrink-0"
                      >
                        <img
                          src={`/${img}`}
                          className="w-full h-full object-cover"
                          alt="Social proof"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Grid */}
        <section id="why" className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                id: "01",
                title: "No Cap UI",
                desc: "No bloat. No noise. Just the tools you actually use, wrapped in a design that doesn't hurt your eyes.",
                color: "primary",
              },
              {
                id: "02",
                title: "Goat Speed",
                desc: "Native-level performance. Because waiting for pages to load is so last decade.",
                color: "accent",
              },
              {
                id: "03",
                title: "Main Character Energy",
                desc: "Own your preparation. Track streaks, archive wins, and control your own destiny.",
                color: "green-500",
              },
            ].map((card) => (
              <div
                key={card.id}
                className="group p-12 bg-card rounded-[3rem] border border-border space-y-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4"
              >
                <div
                  className={`w-16 h-16 bg-${card.color}/10 text-primary rounded-2xl flex items-center justify-center font-black text-2xl group-hover:rotate-12 transition-transform`}
                >
                  {card.id}
                </div>
                <h4 className="text-3xl font-black text-primary tracking-tight">
                  {card.title}
                </h4>
                <p className="text-xl text-secondary/80 font-semibold leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Major CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="relative overflow-hidden bg-primary rounded-[4rem] p-20 text-center space-y-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary opacity-50" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <div className="relative z-10 space-y-8">
              <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-none">
                READY TO <br /> ASCEND?
              </h2>
              <p className="text-2xl text-white/80 font-bold">
                Secure your 1600 future right now.
              </p>

              <Link
                href={
                  isAuthenticated ? `${appUrl}/dashboard` : `${appUrl}/login`
                }
                className="inline-block px-16 py-8 bg-white text-primary font-black text-2xl rounded-[2.5rem] shadow-3xl hover:scale-110 active:scale-95 transition-all"
              >
                {t("cta.start")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-border/50 py-20 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg text-center">
                  S
                </span>
              </div>
              <span className="text-xl font-black tracking-tighter text-primary">
                SAT TRACKER
              </span>
            </div>
            <p className="text-secondary/60 font-bold text-center md:text-left">
              © 2026 SAT Tracker. All caps. All wins. 💛
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 uppercase tracking-[0.2em] text-xs font-black text-secondary/70">
            <Link
              href={`${appUrl}/about`}
              className="hover:text-primary transition-colors"
            >
              {t("footer.about")}
            </Link>
            <Link
              href={`${appUrl}/privacy`}
              className="hover:text-primary transition-colors"
            >
              {t("footer.privacy")}
            </Link>
            <a
              href="https://t.me/satrackerbot"
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              {t("footer.contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
