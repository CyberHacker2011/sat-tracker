"use client";

import { useState, useEffect, useRef } from "react";

type TimerMode = "focus" | "break" | "idle";

export default function PomodoroPage() {
    const [mode, setMode] = useState<TimerMode>("idle");
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // User-configurable timer settings (in minutes)
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);

    // Time left in seconds
    const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);

    // Calculate times in seconds from user input
    const FOCUS_TIME = focusMinutes * 60;
    const BREAK_TIME = breakMinutes * 60;

    function playSound(frequency: number, duration: number) {
        try {
            const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextClass) return;

            const audioContext = new AudioContextClass();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    }

    function startTimer() {
        if (mode === "idle") {
            setMode("focus");
            setTimeLeft(FOCUS_TIME);
        }
        setIsRunning(true);
        playSound(800, 0.2); // Start sound
    }

    function pauseTimer() {
        setIsRunning(false);
    }

    function resetTimer() {
        setIsRunning(false);
        setMode("idle");
        setTimeLeft(FOCUS_TIME); // Reset to current focus time setting
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }

    // State updates are now handled directly in the onChange handlers

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Timer finished
                        playSound(1000, 0.5); // End sound

                        if (mode === "focus") {
                            // Switch to break
                            setMode("break");
                            setIsRunning(false);
                            return BREAK_TIME;
                        } else {
                            // Break finished, go back to idle
                            setMode("idle");
                            setIsRunning(false);
                            return FOCUS_TIME;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, mode, FOCUS_TIME, BREAK_TIME]);

    // Timer display calculation
    const hours = Math.floor(timeLeft / 3600);
    const displayMinutes = Math.floor((timeLeft % 3600) / 60);
    const displaySeconds = timeLeft % 60;
    
    // Determine format and size
    const showHours = hours > 0;
    const timeDisplay = showHours 
        ? `${hours}:${String(displayMinutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`
        : `${String(displayMinutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`;
        
    // Adjust font size based on length/format
    const fontSizeClass = showHours 
        ? "text-5xl sm:text-6xl" 
        : "text-7xl sm:text-8xl";

    // Calculate progress for the ring
    // idle: 1 (full)
    // running: percentage
    const totalTime = mode === "focus" ? FOCUS_TIME : mode === "break" ? BREAK_TIME : FOCUS_TIME;
    const progress = mode === "idle" ? 1 : timeLeft / totalTime;
    const circumference = 2 * Math.PI * 180;
    const strokeDashoffset = circumference * (1 - progress);

    const isTimerActive = mode !== "idle";

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-white">

            {/* Subtle Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-50/50 via-white to-white pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4">

                {/* Main Timer Circle */}
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center mb-12">
                    {/* SVG Ring */}
                    <svg className="absolute w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]" viewBox="0 0 400 400">
                        {/* Background Circle */}
                        <circle
                            cx="200"
                            cy="200"
                            r="180"
                            stroke="#f3f4f6"
                            strokeWidth="6"
                            fill="none"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="200"
                            cy="200"
                            r="180"
                            stroke={mode === "break" ? "#10b981" : "#d97706"}
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>

                    {/* Timer Content */}
                    <div className="flex flex-col items-center justify-center z-10 text-slate-900">
                        <div className={`${fontSizeClass} font-mono font-light tracking-tighter tabular-nums select-none ${isRunning ? 'animate-pulse-slow' : ''}`}>
                            {timeDisplay}
                        </div>
                        <div className="text-xl font-medium text-slate-500 mt-4 tracking-widest uppercase">
                            {mode === "idle" ? "Ready" : mode === "focus" ? "Focusing" : "Resting"}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6 w-full mb-10">
                    {!isRunning && mode === "idle" && (
                        <button
                            onClick={startTimer}
                            className="group relative inline-flex items-center justify-center px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-semibold transition-all duration-200 shadow-[0_4px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_6px_30px_rgba(217,119,6,0.4)] hover:-translate-y-0.5"
                        >
                            Start Pomodoro
                        </button>
                    )}

                    {!isRunning && mode !== "idle" && (
                        <button
                            onClick={startTimer}
                            className="group relative inline-flex items-center justify-center px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-semibold transition-all duration-200 shadow-[0_4px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_6px_30px_rgba(217,119,6,0.4)] hover:-translate-y-0.5"
                        >
                            Resume
                        </button>
                    )}

                    {isRunning && (
                        <button
                            onClick={pauseTimer}
                            className="group relative inline-flex items-center justify-center px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-semibold transition-all duration-200 border border-slate-200"
                        >
                            Pause
                        </button>
                    )}

                    {mode !== "idle" && (
                        <button
                            onClick={resetTimer}
                            className="group relative inline-flex items-center justify-center px-8 py-3 text-slate-400 hover:text-slate-600 rounded-full font-semibold transition-all duration-200 hover:bg-slate-50"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* Timer Settings - Moved below controls */}
                {!isTimerActive && (
                    <div className="mb-8 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
                            <div className="flex-1">
                                <label htmlFor="focus-time" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 text-center">
                                    Focus Mode
                                </label>
                                <div className="relative">
                                    <input
                                        id="focus-time"
                                        type="number"
                                        min="1"
                                        max="1440" // 24 hours
                                        value={focusMinutes}
                                        onChange={(e) => {
                                            const val = Math.max(1, Math.min(1440, parseInt(e.target.value) || 1));
                                            setFocusMinutes(val);
                                            setTimeLeft(val * 60);
                                        }}
                                        className="w-full rounded-lg bg-amber-50 border-0 py-2 text-center text-xl font-bold text-amber-900 focus:ring-2 focus:ring-amber-500/20 placeholder-amber-300 pointer-events-auto"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-amber-600/50 pointer-events-none">min</span>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-gray-200"></div>
                            <div className="flex-1">
                                <label htmlFor="break-time" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 text-center">
                                    Short Break
                                </label>
                                <div className="relative">
                                    <input
                                        id="break-time"
                                        type="number"
                                        min="1"
                                        max="720" // 12 hours
                                        value={breakMinutes}
                                        onChange={(e) => setBreakMinutes(Math.max(1, Math.min(720, parseInt(e.target.value) || 1)))}
                                        className="w-full rounded-lg bg-emerald-50 border-0 py-2 text-center text-xl font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 placeholder-emerald-300 pointer-events-auto"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-emerald-600/50 pointer-events-none">min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isTimerActive && (
                    <div className="mt-2 flex gap-8 text-slate-400 text-sm font-medium animate-in fade-in duration-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]"></div>
                            <span>Focus {focusMinutes}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span>Break {breakMinutes}m</span>
                        </div>
                    </div>
                )}

            </div>

            <style jsx>{`
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }
      `}</style>
        </div>
    );
}
