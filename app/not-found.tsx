import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-white">
      <h1 className="text-6xl font-extrabold text-amber-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Page Not Found</h2>
      <p className="text-gray-500 mb-10 max-w-md font-medium">
        Oops! The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-amber-500 px-8 py-3 text-base font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95"
      >
        Go back home
      </Link>
    </div>
  );
}
