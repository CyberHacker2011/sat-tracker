import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full bg-gradient-to-b from-white to-amber-50">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Boost Your SAT Study
            <span className="block text-amber-600">Productivity</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
            Plan your daily SAT study sessions, track your progress, and build consistent study habits. 
            Increase your productivity and maximize your SAT preparation with our intuitive platform.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/login"
              className="rounded-lg bg-amber-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Get Started
            </a>
            <a
              href="/#features"
              className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Our platform helps you increase your SAT study productivity through smart planning and consistent tracking.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div className="flex flex-col gap-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold leading-7 text-gray-900">Smart Planning</h3>
            <p className="text-base leading-7 text-gray-600">
              Create structured daily study plans with specific time blocks. Plan your Math, Reading, and Writing sections efficiently.
            </p>
          </div>

          <div className="flex flex-col gap-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold leading-7 text-gray-900">Daily Check-ins</h3>
            <p className="text-base leading-7 text-gray-600">
              Track your progress with simple daily check-ins. Mark tasks as done or missed to maintain accountability.
            </p>
          </div>

          <div className="flex flex-col gap-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold leading-7 text-gray-900">Progress Tracking</h3>
            <p className="text-base leading-7 text-gray-600">
              Build consistent study habits by tracking your daily progress. See your productivity improve over time.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Increase Your Productivity
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Maximize your SAT study efficiency with our proven approach
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                Structured Study Sessions
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Break down your SAT prep into manageable daily sessions with clear time boundaries, helping you stay focused and avoid burnout.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Time Management
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Allocate specific time slots for each section, ensuring balanced coverage of Math, Reading, and Writing skills.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Consistent Habits
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Build and maintain daily study habits through regular check-ins, creating a sustainable preparation routine.
              </dd>
            </div>

            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                Accountability
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                Track your daily progress and hold yourself accountable, making it easier to identify areas that need more attention.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl rounded-3xl bg-amber-600 px-6 py-16 text-center sm:px-12 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to boost your SAT productivity?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-amber-100">
            Start planning your study sessions today and build the consistency you need to excel on the SAT.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-amber-600 shadow-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign Up Free
            </Link>
            <Link
              href="/plan"
              className="rounded-lg bg-amber-500 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
