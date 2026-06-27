"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

function RigCheckWordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-md border border-cyan-300/35 bg-[#0f1a2b]">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12h8" />
          <path d="m10 12 2 2 8-8" />
          <rect x="3" y="6" width="8" height="12" rx="2" />
        </svg>
      </span>
      <span className="text-sm font-semibold uppercase tracking-[0.22em]">RigCheck QA</span>
    </span>
  );
}

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const onLanding = pathname === "/";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  useEffect(() => {
    if (!onLanding || user) {
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onLanding, user]);

  if (!loading && !user && onLanding) {
    return (
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-300/70 bg-[#f6f2ea]/92 shadow-sm backdrop-blur"
            : "border-slate-200/80 bg-[#f6f2ea]/72 backdrop-blur"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="focus-ring rounded-md p-1 text-slate-900">
            <RigCheckWordmark />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <Link href="#operations" className="focus-ring rounded-md px-2 py-1 transition hover:text-slate-900">
              Operations
            </Link>
            <Link href="#workflow" className="focus-ring rounded-md px-2 py-1 transition hover:text-slate-900">
              Workflow
            </Link>
            <Link href="#quality-metrics" className="focus-ring rounded-md px-2 py-1 transition hover:text-slate-900">
              Quality Metrics
            </Link>
            <Link href="/login" className="focus-ring rounded-md px-2 py-1 transition hover:text-slate-900">
              Sign In
            </Link>
          </nav>

          <Link
            href="/dashboard"
            className="focus-ring rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open Operations Dashboard
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/login"} className="focus-ring rounded-md p-1 text-slate-700">
          <RigCheckWordmark />
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
          {user && (
            <>
              <Link href="/dashboard" className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/builds" className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                Builds
              </Link>
              <Link href="/builds/new" className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700">
                New inspection
              </Link>
              {user.role === "admin" && (
                <Link href="/users" className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                  Users
                </Link>
              )}
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs uppercase tracking-wide text-slate-700">
                {user.role}
              </span>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Logout
              </button>
            </>
          )}

          {!loading && !user && (
            <Link href="/login" className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
