"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function TopNav() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/login"} className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-700">
          RigCheck QA
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
