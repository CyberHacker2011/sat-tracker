"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    localStorage.setItem("language", "en");
    setLanguage("en");
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const translations: Record<Language, Record<string, string>> = {
    en: {
      // Settings
      settings: "Settings",
      language: "Language",
      theme: "Theme",
      "theme.light": "Light",
      "theme.dark": "Dark",
      "theme.blue": "Blue",

      // Hero
      "hero.badge": "Your Complete SAT Success Platform",
      "hero.title.master": "Master Your",
      "hero.title.journey": "SAT Journey",
      "hero.subtitle.plan": "Plan",
      "hero.subtitle.smarter": "smarter",
      "hero.subtitle.study": "Study",
      "hero.subtitle.focused": "focused",
      "hero.subtitle.track": "Track",
      "hero.subtitle.progress": "progress",
      "hero.subtitle.desc":
        "Your all-in-one preparation platform for SAT excellence.",

      // Stats
      "stats.active_students": "Active Students",
      "stats.study_sessions": "Study Sessions",
      "stats.user_rating": "User Rating",

      // Buttons
      "btn.get_started": "Get Started Free",
      "btn.dashboard": "Open Dashboard",
      "btn.explore": "Explore Features",
      "btn.signin": "Sign In",
      "login.already_account": "Already have an account?",

      // Features
      "features.title": "Everything You Need For",
      "features.subtitle": "SAT Excellence",
      "features.desc":
        "Smart tools designed to transform your study habits and maximize your SAT performance.",

      "feature.planning.title": "Easy Planning Tools",
      "feature.planning.desc":
        "Create custom schedules that fit your life. No complex setups, just effective planning.",

      "feature.pomodoro.title": "Pomodoro Focus Timer",
      "feature.pomodoro.desc":
        "Stay focused with proven Pomodoro intervals. Study in blocks with automatic breaks to avoid burnout.",

      "feature.analytics.title": "Progress Analytics",
      "feature.analytics.desc":
        "View detailed statistics about your study patterns. Track hours, sessions, and improvement trends.",

      "feature.daily.title": "Daily Check-Ins",
      "feature.daily.desc":
        "Log your daily study sessions and track progress. Mark topics as completed and maintain accountability.",

      "feature.room.title": "Study Room",
      "feature.room.desc":
        "Focused Study Environment. A dedicated space with a timer and essential tools to keep you in the zone.",

      "feature.profile.title": "Profile Customization",
      "feature.profile.desc":
        "Set your education level, target score, and study preferences. Customize your experience.",

      // Premium
      "premium.badge": "Premium Features",
      "premium.title": "Unlock Your Full Potential",
      "premium.subtitle":
        "Upgrade to Premium and get unlimited study plans, advanced analytics, and priority support.",
      "premium.footer":
        "Premium subscriptions are managed through direct contact. Once activated, you'll see a golden star icon.",

      "plan.monthly": "Monthly Plan",
      "plan.quarterly": "Quarterly Plan",
      "plan.per_month": "UZS per month",
      "plan.for_3_months": "UZS for 3 months",
      "plan.save": "Save 6,050 UZS ✨",
      "plan.choose_monthly": "Choose Monthly",
      "plan.choose_quarterly": "Choose Quarterly",

      "benefit.unlimited": "Unlimited Study Plans",
      "benefit.analytics": "Advanced Analytics",
      "benefit.support": "Priority Support",
      "benefit.everything": "Everything in Monthly",
      "benefit.lock": "Lock in current price for future features",
      "benefit.value": "Best Value 🔥",

      // Testimonials
      "reviews.title": "Real Results From",
      "reviews.subtitle": "Real Students",
      "reviews.desc":
        "Join thousands of students who are already achieving their SAT goals with our proven platform.",
      "reviews.sarah":
        '"SAT Tracker completely transformed my study routine. The Pomodoro timer kept me accountable."',
      "reviews.james":
        '"The study planning feature is incredible. I saw exactly what to study each day."',
      "reviews.emily":
        '"Premium was worth every penny. Unlimited plans helped me target my weak areas."',
      "reviews.david":
        '"The detailed analytics showed me where I was losing points. My score jumped 100 points."',
      "reviews.layla":
        '"I love the daily check-ins. It keeps me honest about how much I\'m actually studying."',
      "reviews.scored": "Scored",

      // Footer CTA
      "cta.title": "Ready to Ace Your SAT?",
      "cta.desc":
        "Join thousands of students using SAT Tracker to stay organized, focused, and motivated.",
      "cta.start": "Start Free Today",
      "cta.upgrade": "Upgrade to Premium",

      // Footer Links
      "footer.about": "About",
      "footer.privacy": "Privacy",
      "footer.contact": "Contact Support",
    },
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: changeLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
