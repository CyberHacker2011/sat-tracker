
import type { Metadata } from "next";

import { Inter, Roboto, Roboto_Condensed, Noto_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsToolbar } from "@/components/SettingsToolbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SAT Tracker - Master Your SAT With Confidence | Complete SAT Preparation Platform",
  description: "Transform your SAT preparation with SAT Tracker. Plan smarter, study focused, and track progress with our complete suite of tools. Join 120+ students already achieving their SAT goals with proven methods and real-time analytics.",
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
    "Pomodoro timer",
    "study focus timer",
    "SAT analytics"
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
    title: "SAT Tracker - Master Your SAT With Confidence",
    description: "Transform your SAT preparation with smart planning, focused study sessions, and real-time progress tracking. Join 120+ students achieving their SAT goals and become the very first user.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://satracker.uz",
    siteName: "SAT Tracker",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAT Tracker - Master Your SAT With Confidence",
    description: "Transform your SAT preparation with smart planning, focused study sessions, and real-time progress tracking.",
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#d97706" />
      </head>
      <body
        className={`${inter.variable} ${roboto.variable} ${robotoCondensed.variable} ${notoSerif.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "blue"]}
        >
          <LanguageProvider>
            <main className="min-h-screen">
              <SettingsToolbar />
              {children}
            </main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
