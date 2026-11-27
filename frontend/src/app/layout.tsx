import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07060B" },
    { media: "(prefers-color-scheme: light)", color: "#F8F6FF" },
  ],
};

export const metadata: Metadata = {
  title: "CueSpace — Autonomous Timezone & Celestial Event Scheduler",
  description: "Never miss a moment that matters. Celestial radar scheduler with automated multi-channel dispatch via Email, SMS & WhatsApp with 1-click snooze.",
  keywords: ["event reminders", "timezone scheduler", "celestial clock", "birthday tracker", "1-click snooze", "Next.js SaaS"],
  authors: [{ name: "CueSpace Core Team" }],
  openGraph: {
    title: "CueSpace — Celestial Clock & Autonomous Event Scheduler",
    description: "Timezone-aware reminders with 1-click snooze and multi-channel delivery.",
    url: "https://cuespace.app",
    siteName: "CueSpace",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CueSpace — Celestial Clock SaaS",
    description: "Timezone-aware reminders with 1-click snooze and multi-channel delivery.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
