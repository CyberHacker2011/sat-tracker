import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserActivityTracker } from "@/components/UserActivityTracker";
import { NotificationPopups } from "@/components/NotificationPopups";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAT Tracker - Boost Your SAT Study Productivity | Daily Study Planner",
  description: "Plan your daily SAT study sessions, track progress, and build consistent study habits. Increase SAT productivity with smart planning, daily check-ins, and progress tracking for Math, Reading, and Writing sections.",
  themeColor: "#d97706",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SAT Tracker",
  },
  keywords: [
    "SAT study planner",
    "SAT preparation",
    "SAT study tracker",
    "daily SAT study",
    "SAT productivity",
    "SAT study schedule",
    "SAT test prep",
    "SAT practice planner",
    "SAT study habits",
    "SAT progress tracker",
    "SAT Math study",
    "SAT Reading study",
    "SAT Writing study",
    "study plan tracker",
    "academic planning",
    "test preparation tool",
    "SAT exam prep",
  ],
  authors: [{ name: "SAT Tracker" }],
  creator: "SAT Tracker",
  publisher: "SAT Tracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL 
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL) 
    : undefined,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SAT Tracker - Boost Your SAT Study Productivity",
    description: "Plan your daily SAT study sessions, track progress, and build consistent study habits. Increase your SAT preparation productivity with our intuitive platform.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://sat-tracker.vercel.app",
    siteName: "SAT Tracker",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAT Tracker - Boost Your SAT Study Productivity",
    description: "Plan your daily SAT study sessions, track progress, and build consistent study habits.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#d97706" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-white to-amber-50">
          {children}
        </main>
        <UserActivityTracker />
        <NotificationPopups />
      </body>
    </html>
  );
}
