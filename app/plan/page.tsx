"use client";

import { FormEvent, useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

type Section = "math" | "reading" | "writing";

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PlanPage() {
  const supabase = getSupabaseBrowserClient();

  const [section, setSection] = useState<Section>("math");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tasksText, setTasksText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize selected date to today
  useEffect(() => {
    const today = getTodayDateString();
    setSelectedDate(today);
  }, []);

  function getNext7Days() {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      days.push(`${year}-${month}-${day}`);
    }
    return days;
  }

  function formatDateForDisplay(dateString: string) {
    const date = new Date(dateString + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const diffTime = dateOnly.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    const formatted = date.toLocaleDateString("en-US", options);

    if (diffDays === 0) return `${formatted} (Today)`;
    if (diffDays === 1) return `${formatted} (Tomorrow)`;
    return formatted;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedDate || !startTime || !endTime || !tasksText.trim()) {
      setError("All fields are required.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("You must be signed in to create a plan.");
      }

      // No duplicate check - allow multiple plans for same section
      const { error: insertError } = await supabase
        .from("study_plan")
        .insert({
          user_id: user.id,
          date: selectedDate,
          section,
          start_time: startTime,
          end_time: endTime,
          tasks_text: tasksText.trim(),
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess("Plan saved successfully!");
      setTasksText("");
      setStartTime("");
      setEndTime("");
    } catch (err: any) {
      setError(err.message ?? "Failed to save plan.");
    } finally {
      setSubmitting(false);
    }
  }

  const availableDates = getNext7Days();
  const today = getTodayDateString();

  return (
    <div className="mx-auto max-w-4xl p-3 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Create Your Study Plan
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Plan your daily SAT study sessions with structured time blocks and clear tasks. You can create multiple plans for the same section.
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-8 rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
          <li>Select a date from the next 7 days for your study plan</li>
          <li>You can create multiple plans for the same section on the same day</li>
          <li>Set specific start and end times for your study session</li>
          <li>List the specific tasks or topics you plan to study</li>
          <li>After creating your plan, head to the <Link href="/check-in" className="font-semibold text-amber-600 hover:text-amber-700 underline">Check-in page</Link> to track your progress</li>
        </ul>
      </div>

      {/* Plan Form */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
              Date
            </label>
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full rounded-lg border-0 px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
              required
            >
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDateForDisplay(date)}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selection */}
          <div>
            <label htmlFor="section" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
              Section
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value as Section)}
              className="block w-full rounded-lg border-0 px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
            >
              <option value="math">Math</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
            </select>
          </div>

          {/* Time Selection Table */}
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                    Start Time
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <input
                      id="start_time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="block w-full rounded-lg border-0 px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                    End Time
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <input
                      id="end_time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="block w-full rounded-lg border-0 px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                      required
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tasks Textarea */}
          <div>
            <label htmlFor="tasks_text" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
              Study Tasks
            </label>
            <textarea
              id="tasks_text"
              value={tasksText}
              onChange={(e) => setTasksText(e.target.value)}
              rows={6}
              className="block w-full rounded-lg border-0 px-3.5 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
              placeholder="Enter the specific tasks or topics you plan to study (e.g., 'Practice algebra problems from chapter 5', 'Review reading comprehension strategies', etc.)"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Be specific about what you'll study to stay focused and track your progress effectively.
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800" role="alert">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800" role="status">
                {success}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/check-in"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
            >
              Go to Check-in →
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </form>
      </div>

      {/* Next Steps */}
      <div className="mt-8 rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Next Steps</h3>
        <p className="text-sm text-gray-600 mb-4">
          After creating your study plan, visit the <Link href="/check-in" className="font-semibold text-amber-600 hover:text-amber-700 underline">Check-in page</Link> to mark your tasks as done or missed. 
          This helps you track your progress and build consistent study habits.
        </p>
        <Link
          href="/check-in"
          className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          Go to Check-in Page
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
