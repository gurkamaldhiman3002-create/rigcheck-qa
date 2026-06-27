"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { listBuilds, type Build } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function BuildsPage() {
  const { loading: authLoading, authorized } = useRequireAuth(["technician", "supervisor", "admin"]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadBuilds = useCallback(async (searchValue = search, statusValue = status) => {
    setLoading(true);
    try {
      const response = await listBuilds({ limit: 50, search: searchValue || undefined, status: statusValue || undefined });
      setBuilds(response.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load builds");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    if (authLoading || !authorized) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadBuilds();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBuilds, authLoading, authorized]);

  const visibleBuilds = useMemo(() => builds, [builds]);

  if (authLoading || !authorized) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Build inventory</p>
            <h1 className="mt-2 text-3xl font-semibold">Computer builds</h1>
            <p className="mt-2 text-sm text-slate-600">Browse all inspections and open the details view for a build.</p>
          </div>
          <Link href="/builds/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">New inspection</Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search serial, asset, manufacturer, or model"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500"
              />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="rework">Rework</option>
              </select>
            </div>
            <button
              onClick={() => void loadBuilds(search, status)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Apply filters
            </button>
          </div>

          {loading && <p className="mt-6 text-sm text-slate-600">Loading builds…</p>}
          {error && <p className="mt-6 text-sm text-rose-700">{error}</p>}

          {!loading && !error && visibleBuilds.length === 0 && (
            <p className="mt-6 text-sm text-slate-600">No builds match the current filters.</p>
          )}

          {!loading && !error && visibleBuilds.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 pr-4">Serial</th>
                    <th className="py-3 pr-4">Build</th>
                    <th className="py-3 pr-4">CPU</th>
                    <th className="py-3 pr-4">GPU</th>
                    <th className="py-3 pr-4">RAM</th>
                    <th className="py-3 pr-4">Storage</th>
                    <th className="py-3 pr-4">Inspector</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBuilds.map((build) => (
                    <tr key={build.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{build.serial_number}</td>
                      <td className="py-3 pr-4">{build.manufacturer} {build.model_name}</td>
                      <td className="py-3 pr-4">{build.cpu}</td>
                      <td className="py-3 pr-4">{build.gpu}</td>
                      <td className="py-3 pr-4">{build.ram_gb} GB</td>
                      <td className="py-3 pr-4">{build.storage_gb} GB</td>
                      <td className="py-3 pr-4">{build.inspector_name}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{build.inspection_status}</span>
                      </td>
                      <td className="py-3">
                        <Link href={`/builds/${build.id}`} className="text-sm font-medium text-slate-700 hover:text-slate-900">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
