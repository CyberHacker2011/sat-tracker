import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Boost Your SAT Productivity</p>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl mb-8 leading-tight">
            Plan. Track. <span className="text-amber-500">Succeed.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-gray-600 leading-relaxed sm:text-xl">
            A comprehensive tool for modern SAT preparation. Organize your daily sessions, maintain focus with the Pomodoro timer, and track your progress consistently.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-amber-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
            >
              Get Started Free
            </Link>
            <Link
              href="/#features"
              className="rounded-xl bg-white px-10 py-4 text-base font-bold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need For Your <span className="text-amber-500 text-nowrap">SAT Preperation</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 font-medium">
            Smart tools designed to increase your study habits and maximize efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-y-6 rounded-3xl bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-500/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Study Planning</h3>
            <p className="text-sm font-medium leading-relaxed text-gray-600">
              Create structured daily plans for Math, Reading, and Writing sections. Set specific time blocks for each task.
            </p>
          </div>

          <div className="flex flex-col gap-y-6 rounded-3xl bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-md shadow-blue-500/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Pomodoro Timer</h3>
            <p className="text-sm font-medium leading-relaxed text-gray-600">
              Increase focus with work-rest intervals. Integrated directly with your study plans for seamless session tracking.
            </p>
          </div>

          <div className="flex flex-col gap-y-6 rounded-3xl bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 shadow-md shadow-green-500/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Daily Check-ins</h3>
            <p className="text-sm font-medium leading-relaxed text-gray-600">
              Maintain accountability by marking your sessions as completed. Build a daily streak of productivity.
            </p>
          </div>

          <div className="flex flex-col gap-y-6 rounded-3xl bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 shadow-md shadow-purple-500/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Progress Tracker</h3>
            <p className="text-sm font-medium leading-relaxed text-gray-600">
              View your performance history. See exactly which sessions you completed and identify areas for improvement.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative rounded-[3rem] bg-amber-500 px-8 py-16 text-center shadow-2xl shadow-amber-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-40 pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl mb-6 leading-tight">
            Ready to Optimize Your SAT Study?
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-bold text-amber-50 mb-10">
            Join other students who are already using SAT Tracker to stay organized and motivated for their exam.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-white px-12 py-5 text-lg font-bold text-amber-600 shadow-xl hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 py-12 border-t border-gray-100 text-center">
        <p className="text-sm font-bold text-gray-400">
          © 2026 SAT Tracker. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
