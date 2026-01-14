import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-amber-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-10 max-w-md">
        Oops! The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-amber-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-500 transition-all"
      >
        Go back home
      </Link>
    </div>
  );
}
