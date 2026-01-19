"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse border border-gray-200" />
    );
  }

  const themes = [
    { id: "light", label: "Classic", icon: "☀️", color: "bg-amber-500" },
    { id: "dark", label: "Darker", icon: "🌑", color: "bg-slate-900" },
    { id: "blue", label: "Blue", icon: "💧", color: "bg-blue-500" },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-background hover:bg-card text-xl border border-default shadow-sm transition-all active:scale-95 group"
        aria-label="Change Theme"
      >
        <span className="group-hover:rotate-12 transition-transform duration-300">
            {currentTheme.icon}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-12 right-0 z-50 min-w-[150px] p-2 bg-card rounded-2xl shadow-xl border border-default flex flex-col gap-1 animate-in zoom-in-95 duration-200">
             {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => {
                        setTheme(t.id);
                        setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        theme === t.id 
                        ? "bg-background text-primary" 
                        : "text-secondary hover:bg-background hover:text-primary"
                    }`}
                >
                    <span className="text-base">{t.icon}</span>
                    {t.label}
                    {theme === t.id && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                </button>
             ))}
          </div>
        </>
      )}
    </div>
  );
}
