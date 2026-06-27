import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "RigCheck QA",
  description: "Hardware quality assurance and defect management for custom gaming PCs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-700">
              RigCheck QA
            </Link>
            <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/builds" className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                Builds
              </Link>
              <Link href="/builds/new" className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700">
                New inspection
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
