import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { DataSync } from "@/components/providers/DataSync";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuantPulse | Commodity & Market Data",
  description: "High-frequency commodity and solar market intelligence platform",
};

// Inline theme script as a string to avoid React hydration warnings
const themeScript = `
  try {
    var storage = window.localStorage.getItem('quantpulse-ui-storage');
    var theme = 'dark';
    if (storage) {
      var parsed = JSON.parse(storage);
      if (parsed.state && parsed.state.theme) {
        theme = parsed.state.theme;
      }
    }
    var root = document.documentElement;
    if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    } else {
      root.classList.add(theme);
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <DataSync />
        {children}
      </body>
    </html>
  );
}
