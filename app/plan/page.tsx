"use client";

import { useEffect, useState, Suspense } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Section = "math" | "reading" | "writing";

function PlanContent() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  const [date, setDate] = useState("");
  const [section, setSection] = useState<Section>("math");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tasksText, setTasksText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set default date to today
    if (!editId) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);
    }
  }, [editId]);

  useEffect(() => {
    async function loadPlan() {
      if (!editId) return;
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("study_plan")
        .select("*")
        .eq("id", editId)
        .single();

      if (fetchError) {
        setError("Failed to load plan: " + fetchError.message);
      } else if (data) {
        setDate(data.date);
        setSection(data.section);
        setStartTime(data.start_time);
        setEndTime(data.end_time);
        setTasksText(data.tasks_text);
      }
      setLoading(false);
    }
    loadPlan();
  }, [editId, supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const { data: authData, error: userError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (userError || !user) {
      setError("You must be logged in to save a study plan.");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      date,
      section,
      start_time: startTime,
      end_time: endTime,
      tasks_text: tasksText,
    };

    let saveError;
    if (editId) {
      const { error: updateError } = await supabase
        .from("study_plan")
        .update(payload)
        .eq("id", editId)
        .eq("user_id", user.id);
      saveError = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("study_plan")
        .insert([payload]);
      saveError = insertError;
    }

    if (saveError) {
      setError(saveError.message);
    } else {
      setSuccess(true);
      if (!editId) {
        setTasksText("");
      }
      setTimeout(() => setSuccess(false), 2000);
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-10 bg-white">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-2">
          {editId ? "Edit Study Plan" : "Create New Study Plan"}
        </h1>
        <p className="text-gray-500 font-medium">
          Define your study sessions to stay organized and productive.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <form onSubmit={handleSave} className="p-8 sm:p-10 space-y-8">
          {/* Status Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-pulse">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-bold">
              Mission saved successfully! Redirecting...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 ml-1">Schedule Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:ring-0 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 ml-1">Study Section</label>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                {(["math", "reading", "writing"] as Section[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSection(s)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                      section === s 
                      ? "bg-white text-amber-600 shadow-sm border border-amber-100" 
                      : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 ml-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:ring-0 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 ml-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:ring-0 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 ml-1">Study Tasks & Objectives</label>
            <textarea
              required
              rows={4}
              value={tasksText}
              onChange={(e) => setTasksText(e.target.value)}
              placeholder="E.g., Complete Practice Test 1 Math Section, Review mistakes..."
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 text-sm font-medium focus:border-amber-500 focus:ring-0 transition-all resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-500 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-amber-600 shadow-md shadow-amber-500/10 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : editId ? "Update Plan" : "Create Plan"}
            </button>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-amber-50 border border-amber-100">
          <h3 className="text-sm font-bold text-amber-900 mb-2">Instructions</h3>
          <p className="text-xs font-medium text-amber-700 leading-relaxed">
            Choose the section you want to study and set a clear timeframe. Be specific about your tasks to maintain focus during the session. Once saved, these plans will be available for you to track in your dashboard and check-in hub.
          </p>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PlanContent />
    </Suspense>
  );
}
