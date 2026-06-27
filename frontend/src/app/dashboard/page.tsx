"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardSummary, listBuilds, type Build, type BuildSummary } from "@/lib/api";

const summaryCards = [
  { key: "total_builds", label: "Total builds", accent: "from-slate-700 to-slate-900" },
  { key: "pending_inspections", label: "Pending", accent: "from-amber-500 to-orange-500" },
  { key: "passed_inspections", label: "Passed", accent: "from-emerald-500 to-green-600" },
  { key: "failed_inspections", label: "Failed", accent: "from-rose-500 to-red-600" },
  { key: "builds_in_rework", label: "Rework", accent: "from-indigo-500 to-violet-600" },
  { key: "open_defects", label: "Open defects", accent: "from-sky-500 to-cyan-600" },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<BuildSummary | null>(null);
  const [recentBuilds, setRecentBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, buildsData] = await Promise.all([getDashboardSummary(), listBuilds({ limit: 5 })]);
        setSummary(summaryData);
        setRecentBuilds(buildsData.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">RigCheck QA</p>
            <h1 className="mt-2 text-3xl font-semibold">Operations dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Track builds, defects, and inspection outcomes from a single view.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/builds" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">View builds</Link>
            <Link href="/builds/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">Create inspection</Link>
          </div>
        </header>

        {loading && <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading dashboard…</p>}
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</p>}

        {summary && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <div key={card.key} className={`rounded-2xl bg-gradient-to-br p-6 text-white shadow-sm ${card.accent}`}>
                <p className="text-sm font-medium text-white/80">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold">{summary[card.key as keyof BuildSummary]}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Pass rate</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{summary.pass_rate}%</p>
              <p className="mt-2 text-sm text-slate-600">This week’s completed inspections.</p>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent builds</h2>
              <p className="text-sm text-slate-600">Latest inspections captured in RigCheck QA.</p>
            </div>
            <Link href="/builds" className="text-sm font-medium text-slate-700 hover:text-slate-900">See all</Link>
          </div>
          {recentBuilds.length === 0 ? (
            <p className="text-sm text-slate-600">No builds have been recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-3 pr-4">Serial</th>
                    <th className="py-3 pr-4">Build</th>
                    <th className="py-3 pr-4">Inspector</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBuilds.map((build) => (
                    <tr key={build.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{build.serial_number}</td>
                      <td className="py-3 pr-4">{build.manufacturer} {build.model_name}</td>
                      <td className="py-3 pr-4">{build.inspector_name}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{build.inspection_status}</span>
                      </td>
                      <td className="py-3">
                        <Link href={`/builds/${build.id}`} className="text-sm font-medium text-slate-700 hover:text-slate-900">View details</Link>
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
