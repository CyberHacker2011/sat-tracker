"use client";

import { useEffect, useState, useRef } from "react";

export default function PomodoroPage() {
    // --- State ---
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<"focus" | "break" | "idle">("idle");
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Timer Precision
    const lastTimeRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- Timer Logic (Precisely handles background/throttling) ---
    useEffect(() => {
        const handleUnload = (e: BeforeUnloadEvent) => {
            if (isRunning && timeLeft > 0) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };
        window.addEventListener("beforeunload", handleUnload);

        if (isRunning && timeLeft > 0) {
            lastTimeRef.current = Date.now();
            timerIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const deltaMs = now - (lastTimeRef.current || now);
                if (deltaMs >= 1000) {
                    const secondsToSubtract = Math.floor(deltaMs / 1000);
                    setTimeLeft(prev => Math.max(0, prev - secondsToSubtract));
                    lastTimeRef.current = now - (deltaMs % 1000);
                }
            }, 100);
        } else if (timeLeft === 0 && isRunning) {
            handleTransition();
        }

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [isRunning, timeLeft === 0]);

    const handleTransition = () => {
        if (mode === "focus") {
            setMode("break");
            setTimeLeft(breakMinutes * 60);
            playSound(1000, 0.4);
        } else {
            setMode("focus");
            setTimeLeft(focusMinutes * 60);
            playSound(1000, 0.4);
        }
    };

    function playSound(freq: number, dur: number) {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.2, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
            osc.start(); osc.stop(ctx.currentTime + dur);
        } catch {}
    }

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? "0" : ""}${sec}`;
    };

    const circumference = 2 * Math.PI * 185;
    const limit = mode === "break" ? breakMinutes * 60 : focusMinutes * 60;
    const strokeOffset = ( (1 - timeLeft / (limit || 1)) ) * circumference;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-30 -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-30 -ml-48 -mb-48" />

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2">Focus Timer</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Pure Concentration Mode</p>
                </div>

                <div className="relative w-64 h-64 md:w-[28rem] md:h-[28rem] flex items-center justify-center mb-16">
                    <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 400 400">
                        <circle cx="200" cy="200" r="185" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                        <circle
                            cx="200" cy="200" r="185" 
                            stroke={mode === "break" ? "#10b981" : "#f59e0b"} 
                            strokeWidth="12" fill="none" strokeLinecap="round"
                            style={{ 
                                strokeDasharray: circumference, 
                                strokeDashoffset: strokeOffset, 
                                transition: isRunning ? "stroke-dashoffset 1s linear" : "none" 
                            }}
                        />
                    </svg>

                    <div className="text-center">
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${mode === "focus" ? "text-amber-500" : mode === "break" ? "text-emerald-500" : "text-slate-300"}`}>
                            {mode === "idle" ? "Ready" : mode === "focus" ? "Deep Work" : "Resting"}
                        </p>
                        <h2 className="text-7xl md:text-9xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{formatTime(timeLeft)}</h2>
                    </div>
                </div>

                <div className="w-full max-w-sm space-y-8 text-center">
                    <div className="flex items-center justify-center gap-6">
                        <button 
                            onClick={() => {
                                if (mode === "idle") {
                                    setMode("focus");
                                    setTimeLeft(focusMinutes * 60);
                                }
                                setIsRunning(!isRunning);
                            }} 
                            className={`flex-1 max-w-[14rem] py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${isRunning ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white shadow-amber-200'}`}
                        >
                            {isRunning ? "Freeze" : mode === "idle" ? "Execute" : "Resume"}
                        </button>
                        <button 
                            onClick={() => setShowResetConfirm(true)}
                            className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm group"
                        >
                            <svg className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                    </div>

                    {!isRunning && (
                        <div className="flex justify-center gap-12 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center group">
                                <label className="block text-[9px] font-black text-slate-300 group-hover:text-amber-500 uppercase tracking-widest mb-3 transition-colors">Study m</label>
                                <input type="number" value={focusMinutes} onChange={e => {
                                    const v = Math.max(1, parseInt(e.target.value) || 1);
                                    setFocusMinutes(v);
                                    if (mode === "idle" || mode === "focus") setTimeLeft(v * 60);
                                }} className="w-16 bg-transparent text-center text-3xl font-black text-slate-800 focus:outline-none" />
                            </div>
                            <div className="w-px h-10 bg-slate-200 self-center" />
                            <div className="text-center group">
                                <label className="block text-[9px] font-black text-slate-300 group-hover:text-emerald-500 uppercase tracking-widest mb-3 transition-colors">Rest m</label>
                                <input type="number" value={breakMinutes} onChange={e => {
                                    const v = Math.max(1, parseInt(e.target.value) || 1);
                                    setBreakMinutes(v);
                                    if (mode === "break") setTimeLeft(v * 60);
                                }} className="w-16 bg-transparent text-center text-3xl font-black text-slate-800 focus:outline-none" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reset Confirmation */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <div className="text-5xl mb-8">🌀</div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">Reset Timer?</h3>
                        <p className="text-slate-400 font-medium mb-10 leading-relaxed text-sm">This session progress will be cleared. Are you sure you want to start fresh?</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { setIsRunning(false); setMode("idle"); setTimeLeft(focusMinutes * 60); setShowResetConfirm(false); }} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-100 active:scale-95 transition-all">Yes, Reset</button>
                            <button onClick={() => setShowResetConfirm(false)} className="w-full py-5 bg-slate-50 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Go Back</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
