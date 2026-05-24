import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { GlassNavBar } from "@/components/glass";
import { HTML_LANG } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";

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
  title: {
    default: "Perso",
    template: "%s · Perso",
  },
  description:
    "Perso is a friendship-first CRM. Remember names, follow up with friends, and never lose touch with the people who matter.",
  applicationName: "Perso",
  appleWebApp: {
    capable: true,
    title: "Perso",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-sans text-foreground">
        {/* Decorative mesh-gradient background. Lives behind everything so
            our glass surfaces have rich content to refract. */}
        <div aria-hidden className="app-bg" />
        <LocaleProvider initialLocale={locale}>
          {children}
          <GlassNavBar />
        </LocaleProvider>
      </body>
    </html>
  );
}
