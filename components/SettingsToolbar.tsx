"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";

export function SettingsToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-50 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:scale-110 transition-transform duration-200 group"
        aria-label="Open Settings"
      >
        <svg 
          className="w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:rotate-90 transition-transform duration-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-slate-800 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {t("settings")}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            {/* Language Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                {t("language")}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setLanguage('uz')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    language === 'uz' 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                      : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="font-bold text-gray-900 dark:text-gray-100">O&apos;zbekcha</span>
                  {language === 'uz' && <span className="text-amber-500">✓</span>}
                </button>
                <button
                  onClick={() => setLanguage('ru')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    language === 'ru' 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                      : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="font-bold text-gray-900 dark:text-gray-100">Русский</span>
                  {language === 'ru' && <span className="text-amber-500">✓</span>}
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    language === 'en' 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                      : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="font-bold text-gray-900 dark:text-gray-100">English</span>
                  {language === 'en' && <span className="text-amber-500">✓</span>}
                </button>
              </div>
            </div>

            {/* Theme Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                {t("theme")}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    theme === 'light' 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                      : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 shadow-sm" 
                    style={{ backgroundColor: '#ffffff' }}
                  />
                  <span className="font-bold text-gray-900 dark:text-gray-100">{t("theme.light")}</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    theme === 'dark' 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                      : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full border border-slate-700 shadow-sm"
                    style={{ backgroundColor: '#0f172a' }}
                  />
                  <span className="font-bold text-gray-900 dark:text-gray-100">{t("theme.dark")}</span>
                </button>
                <button
                  onClick={() => setTheme('blue')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    theme === 'blue' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded-full border border-blue-400 shadow-sm"
                    style={{ backgroundColor: '#3b82f6' }}
                  />
                  <span className="font-bold text-gray-900 dark:text-gray-100">{t("theme.blue")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
