"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

function StudyRoomContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planIdParam = searchParams.get("planId");
    const supabase = getSupabaseBrowserClient();

    // --- State: Core Timer ---
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<"idle" | "focus" | "break">("idle");
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);

    // --- State: Plan Management ---
    const [planId, setPlanId] = useState<string | null>(planIdParam);
    const [plan, setPlan] = useState<any>(null);
    const [availablePlans, setAvailablePlans] = useState<any[]>([]);
    const [currentSession, setCurrentSession] = useState(1);
    const [totalSessions, setTotalSessions] = useState(1);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [markingDone, setMarkingDone] = useState(false);
    
    // Timer Precision State
    const lastTimeRef = useRef<number | null>(null);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- Initialization: Fetch Plans & State ---
    useEffect(() => {
        async function initialize() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const [plansRes, logsRes] = await Promise.all([
                supabase.from("study_plan").select("*").eq("user_id", user.id).eq("date", today),
                supabase.from("daily_log").select("plan_id").eq("user_id", user.id).eq("date", today)
            ]);

            const logs = logsRes.data || [];
            const plans = plansRes.data || [];
            const now = new Date();
            const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            const processedPlans = plans.map(p => {
                const isMarked = logs.some(l => l.plan_id === p.id);
                const isPast = currentTimeStr > p.end_time;
                const isActive = !isMarked && !isPast;
                return { ...p, isActive, isMarked, isPast };
            });

            setAvailablePlans(processedPlans.filter(p => !p.isMarked).sort((a, b) => a.start_time.localeCompare(b.start_time)));

            if (planIdParam) {
                const selected = processedPlans.find(p => p.id === planIdParam);
                if (selected) {
                    setPlan(selected);
                    setPlanId(planIdParam);
                    
                    const saved = localStorage.getItem(`study_room_state_${planIdParam}`);
                    if (saved) {
                        const state = JSON.parse(saved);
                        setTimeLeft(state.timeLeft);
                        setMode(state.mode);
                        setCurrentSession(state.currentSession);
                        setTotalSessions(state.totalSessions);
                        setFocusMinutes(state.focusMinutes);
                        setBreakMinutes(state.breakMinutes);
                        setIsSettingUp(state.isSettingUp);
                        setIsCompleted(state.isCompleted);
                    } else {
                        setIsSettingUp(true);
                        setIsCompleted(false);
                        const [sh, sm] = selected.start_time.split(":").map(Number);
                        const [eh, em] = selected.end_time.split(":").map(Number);
                        const duration = (eh * 60 + em) - (sh * 60 + sm);
                        const initialSessions = 2;
                        setTotalSessions(initialSessions);
                        const unit = duration / (6 * initialSessions);
                        setFocusMinutes(Math.max(1, Math.round(unit * 5)));
                        setBreakMinutes(Math.max(1, Math.round(unit)));
                    }
                }
            } else {
                // Return to selection state
                setPlan(null);
                setPlanId(null);
                setIsRunning(false);
                setIsSettingUp(false);
                setIsCompleted(false);
                setShowSelectionModal(false);
                setShowResetModal(false);
            }
            setLoading(false);
        }
        initialize();
    }, [planIdParam]);

    const goBackToSelection = () => {
        setIsRunning(false);
        router.push("/study-room");
    };

    // --- Persistence ---
    useEffect(() => {
        if (loading || !planId) return;
        const state = {
            timeLeft, mode, currentSession, totalSessions,
            focusMinutes, breakMinutes, isSettingUp, isCompleted
        };
        localStorage.setItem(`study_room_state_${planId}`, JSON.stringify(state));
    }, [timeLeft, mode, currentSession, totalSessions, focusMinutes, breakMinutes, isSettingUp, isCompleted, planId, loading]);

    // --- Timer Logic (Precisely handles background/throttling) ---
    useEffect(() => {
        const handleUnload = (e: BeforeUnloadEvent) => {
            if (isRunning && timeLeft > 0) {
                e.preventDefault();
                e.returnValue = ""; // Required for Chrome/Firefox
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
                    lastTimeRef.current = now - (deltaMs % 1000); // Carry over remainder
                }
            }, 100); // Check more frequently for higher precision
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
            if (currentSession < totalSessions) {
                setMode("break");
                setTimeLeft(breakMinutes * 60);
                playSound(800, 0.4);
            } else {
                setMode("idle");
                setIsRunning(false);
                setIsCompleted(true);
                playSound(1200, 1.2);
            }
        } else if (mode === "break") {
            setMode("focus");
            setCurrentSession(prev => prev + 1);
            setTimeLeft(focusMinutes * 60);
            playSound(800, 0.4);
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

    const startPlan = () => {
        setIsSettingUp(false);
        setMode("focus");
        setTimeLeft(focusMinutes * 60);
        setIsRunning(true);
        setCurrentSession(1);
    };

    const markAsDone = async () => {
        if (!plan) return;
        setMarkingDone(true);
        const { error } = await supabase.from("daily_log").insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            plan_id: plan.id,
            date: plan.date,
            status: "done",
            checked_at: new Date().toISOString()
        });
        if (!error) {
            localStorage.removeItem(`study_room_state_${plan.id}`);
            router.push("/dashboard");
        } else {
            setMarkingDone(false);
        }
    };

    const getGlobalProgress = () => {
        if (!plan) return 0;
        const total = totalSessions * (focusMinutes + breakMinutes) * 60;
        const elapsed = ((currentSession - 1) * (focusMinutes + breakMinutes) * 60) + 
                        (mode === "focus" ? (focusMinutes * 60 - timeLeft) : (focusMinutes * 60 + (breakMinutes * 60 - timeLeft)));
        return Math.min(100, Math.round((elapsed / total) * 100));
    };

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) {
            return `${h}:${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
        }
        return `${m}:${sec < 10 ? "0" : ""}${sec}`;
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // --- View: Workplace / Selection ---
    if (!plan) {
        return (
            <div className="min-h-[calc(100vh-64px)] p-6 bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Study Room</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Select your scheduled objective</p>
                        </div>
                    </div>

                    <div className="grid gap-4 mb-10">
                        {availablePlans.length > 0 ? (
                            availablePlans.map(p => (
                                <button key={p.id} onClick={() => router.push(`/study-room?planId=${p.id}`)} className="group flex items-center justify-between p-6 bg-slate-50 hover:bg-white rounded-[2rem] border border-transparent hover:border-amber-200 hover:shadow-xl transition-all text-left">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">{p.section}</span>
                                            <span className="text-xs font-bold text-slate-400">{p.start_time} - {p.end_time}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 line-clamp-1">{p.tasks_text}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-16 text-center bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-lg mb-2">No active plans for today</p>
                                <p className="text-slate-300 text-sm mb-8">Schedule your study sessions in the mission control.</p>
                                <Link href="/plan" className="inline-flex px-10 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-sm border border-slate-200 hover:border-amber-500 transition-all text-sm uppercase tracking-widest">Create Plan</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- View: Setup ---
    if (isSettingUp) {
        const [sh, sm] = plan.start_time.split(":").map(Number);
        const [eh, em] = plan.end_time.split(":").map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 flex flex-col justify-between">
                        <div>
                            <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">Objective Summary</span>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 capitalize">{plan.section}</h2>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Duration</p>
                                    <p className="text-2xl font-black text-slate-800">{duration}m</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Window</p>
                                    <p className="text-lg font-black text-slate-800">{plan.start_time} - {plan.end_time}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-300 uppercase px-2 tracking-widest">Tasks Overview</p>
                                <div className="bg-slate-50 rounded-3xl p-6 max-h-64 overflow-y-auto border border-slate-100 custom-scrollbar">
                                    {plan.tasks_text.split('\n').map((t: string, i: number) => (
                                        <div key={i} className="flex gap-4 mb-4 last:mb-0">
                                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex-shrink-0 flex items-center justify-center font-black text-xs">{i+1}</div>
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed">{t}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={goBackToSelection} className="mt-8 text-slate-300 font-black text-xs uppercase tracking-widest hover:text-amber-500 transition-colors">← Back to selection</button>
                    </div>

                    <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl flex flex-col gap-10">
                        <div>
                            <h3 className="text-2xl font-black mb-2">Configure Pieces</h3>
                            <p className="text-slate-400 text-sm font-medium">Define your work-rest intervals</p>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Pieces</label>
                                    <span className="text-2xl font-black text-amber-500 tabular-nums">{totalSessions}</span>
                                </div>
                                <input type="range" min="1" max="10" value={totalSessions} onChange={e => {
                                    const v = parseInt(e.target.value);
                                    setTotalSessions(v);
                                    const unit = duration / (6 * v);
                                    setFocusMinutes(Math.max(1, Math.round(unit * 5)));
                                    setBreakMinutes(Math.max(1, Math.round(unit)));
                                }} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Work (m)</label>
                                    <input type="number" value={focusMinutes} onChange={e => setFocusMinutes(Math.min(720, Math.max(1, parseInt(e.target.value) || 1)))} className="w-full bg-slate-800 border-none rounded-2xl p-6 text-3xl font-black focus:ring-4 focus:ring-amber-500/20" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Rest (m)</label>
                                    <input type="number" value={breakMinutes} onChange={e => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-slate-800 border-none rounded-2xl p-6 text-3xl font-black focus:ring-4 focus:ring-emerald-500/20" />
                                </div>
                            </div>
                        </div>

                        <button onClick={startPlan} className="w-full py-6 bg-amber-500 hover:bg-amber-600 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-4">
                            Start Session
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- View: Completion ---
    if (isCompleted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full p-12 rounded-[4rem] bg-slate-50 border border-slate-100 shadow-sm animate-in zoom-in duration-500">
                    <div className="text-8xl mb-10">🏁</div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Session Finished!</h2>
                    <p className="text-slate-500 font-bold mb-10 leading-relaxed capitalize">
                        You have successfully executed your {plan.section} objective. Ready to update your log?
                    </p>
                    <div className="space-y-4">
                        <button onClick={markAsDone} disabled={markingDone} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                            {markingDone ? "Archiving..." : "Mark as Completed"}
                        </button>
                        <button onClick={() => { setIsCompleted(false); setMode("idle"); }} className="w-full py-2 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-400 transition-colors">Dismiss Details</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- View: Execution (Timer) ---
    const circumference = 2 * Math.PI * 185;
    const limit = mode === "focus" ? focusMinutes * 60 : mode === "break" ? breakMinutes * 60 : 1;
    const strokeOffset = ( (1 - timeLeft / limit) ) * circumference;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col items-center py-12 px-6">
            <div className="w-full max-w-6xl flex justify-between items-center mb-16">
                <button 
                  onClick={() => {
                    // Only show confirmation if we are actually in a session and have made progress/running
                    if (isRunning || timeLeft < (mode === "focus" ? focusMinutes * 60 : breakMinutes * 60)) {
                      setShowSelectionModal(true);
                    } else {
                      goBackToSelection();
                    }
                  }} 
                  className="px-8 py-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                >
                  Selection
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Live Objective</span>
                    <div className="px-6 py-2 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
                        <span className="text-xs font-black uppercase tracking-widest">{plan.section}</span>
                    </div>
                </div>
                <div className="w-[100px] hidden md:block" />
            </div>

            <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 mb-20">
                <div className="relative w-64 h-64 md:w-[28rem] md:h-[28rem] flex items-center justify-center shrink-0">
                    <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 400 400">
                        <circle cx="200" cy="200" r="185" stroke="#f8fafc" strokeWidth="4" fill="none" />
                        <circle
                            cx="200" cy="200" r="185" 
                            stroke={mode === "break" ? "#10b981" : "#f59e0b"} 
                            strokeWidth="12" fill="none" strokeLinecap="round"
                            style={{ strokeDasharray: circumference, strokeDashoffset: strokeOffset, transition: isRunning ? "stroke-dashoffset 1s linear" : "none" }}
                        />
                    </svg>
                    <div className="text-center">
                        <p className={`text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 ${isRunning ? "animate-pulse" : ""}`}>
                            {mode === "focus" ? "Studying Now" : mode === "break" ? "Rest Period" : "Paused"}
                        </p>
                        <h2 className={`font-black text-slate-900 tabular-nums tracking-tighter leading-none mb-6 transition-all ${timeLeft >= 3600 ? 'text-5xl md:text-7xl' : 'text-7xl md:text-9xl'}`}>{formatTime(timeLeft)}</h2>
                        <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full inline-block">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Piece {currentSession} of {totalSessions}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-sm hidden lg:block">
                    <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 flex flex-col h-[28rem]">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">Operational Tasks</h3>
                        <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                            {plan.tasks_text.split('\n').map((t: string, i: number) => (
                                <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-50 transition-all hover:scale-[1.02]">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{t}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-2xl text-center space-y-12">
                <div className="flex items-center justify-center gap-6">
                    <button onClick={() => setIsRunning(!isRunning)} className={`flex-1 max-w-[14rem] py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${isRunning ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white shadow-amber-200'}`}>
                        {isRunning ? "Pause" : "Resume Session"}
                    </button>
                    <button onClick={() => setShowResetModal(true)} className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm group">
                        <svg className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>

                <div className="px-4">
                    <div className="flex justify-between items-end mb-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Session Progress</p>
                        <span className="text-xs font-black text-amber-500 tabular-nums">{getGlobalProgress()}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-50 rounded-full border border-slate-100 p-1">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(245,158,11,0.3)] bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${getGlobalProgress()}%` }} />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showSelectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <div className="text-4xl mb-6">📌</div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Save Session?</h3>
                        <p className="text-sm font-medium text-slate-400 mb-8">Do you want to keep your current progress for this specific plan?</p>
                        <div className="space-y-3">
                            <button onClick={goBackToSelection} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Save & Exit</button>
                            <button onClick={() => { localStorage.removeItem(`study_room_state_${planId}`); goBackToSelection(); }} className="w-full py-5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Discard & Exit</button>
                            <button onClick={() => setShowSelectionModal(false)} className="w-full py-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <div className="text-4xl mb-6">🌀</div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Reset Piece?</h3>
                        <p className="text-sm font-medium text-slate-400 mb-8">This will restart the current timer. Total objective progress is saved.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { setTimeLeft(focusMinutes * 60); setIsRunning(false); setMode("focus"); setShowResetModal(false); }} className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all">Reset Now</button>
                            <button onClick={() => setShowResetModal(false)} className="w-full py-5 bg-slate-50 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Continue studying</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
}

export default function StudyRoomPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <StudyRoomContent />
        </Suspense>
    );
}
