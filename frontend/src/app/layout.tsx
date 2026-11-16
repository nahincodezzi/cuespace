import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CueSpace — Autonomous Timezone & Smart Event SaaS",
  description: "Never miss a moment. Timezone-aware smart event tracking for birthdays, anniversaries and deadlines with 1-click snooze and multi-channel delivery.",
  keywords: ["event reminders", "timezone scheduler", "smart calendar", "birthday tracker", "1-click snooze", "FastAPI Next.js SaaS"],
  authors: [{ name: "CueSpace Core Team" }],
  viewport: { width: "device-width", initialScale: 1, maximumScale: 1 },
  themeColor: "#08080d",
  openGraph: {
    title: "CueSpace — Autonomous Timezone & Smart Event SaaS",
    description: "Never miss a moment. High-reliability timezone-aware notifications across Email, WhatsApp & SMS.",
    url: "https://cuespace.app",
    siteName: "CueSpace",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CueSpace — Smart Event & Timezone SaaS",
    description: "Timezone-aware reminders with 1-click snooze and multi-channel delivery.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#08080d] text-[#ededed]">
        {children}
      </body>
    </html>
  );
}
