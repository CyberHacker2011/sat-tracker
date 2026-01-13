"use client";

import { useState, useEffect, useRef } from "react";

type TimerMode = "focus" | "break" | "idle";

export default function FocusPage() {
    const [mode, setMode] = useState<TimerMode>("idle");
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const FOCUS_TIME = 25 * 60; // 25 minutes
    const BREAK_TIME = 5 * 60; // 5 minutes

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
        setTimeLeft(FOCUS_TIME);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }

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

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Calculate progress for the ring
    // idle: 1 (full)
    // running: percentage
    const totalTime = mode === "focus" ? FOCUS_TIME : mode === "break" ? BREAK_TIME : FOCUS_TIME;
    const progress = mode === "idle" ? 1 : timeLeft / totalTime;
    const circumference = 2 * Math.PI * 180;
    const strokeDashoffset = circumference * (1 - progress);

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
                        <div className={`text-7xl sm:text-8xl font-mono font-light tracking-tighter tabular-nums select-none ${isRunning ? 'animate-pulse-slow' : ''}`}>
                            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                        </div>
                        <div className="text-xl font-medium text-slate-500 mt-4 tracking-widest uppercase">
                            {mode === "idle" ? "Ready" : mode === "focus" ? "Focusing" : "Resting"}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6 w-full">
                    {!isRunning && mode === "idle" && (
                        <button
                            onClick={startTimer}
                            className="group relative inline-flex items-center justify-center px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-semibold transition-all duration-200 shadow-[0_4px_20px_rgba(217,119,6,0.3)] hover:shadow-[0_6px_30px_rgba(217,119,6,0.4)] hover:-translate-y-0.5"
                        >
                            Start Focus
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

                {/* Helper Text */}
                <div className="mt-12 flex gap-8 text-slate-400 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]"></div>
                        <span>Focus 25m</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span>Break 5m</span>
                    </div>
                </div>

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
