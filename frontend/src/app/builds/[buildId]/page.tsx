"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createDefect, getBuild, listDefects, updateBuild, updateDefect, type Build, type Defect } from "@/lib/api";

const defectInitialState = {
  defect_category: "other",
  severity: "medium",
  description: "",
  resolution_notes: "",
  status: "open",
};

export default function BuildDetailPage() {
  const params = useParams<{ buildId: string }>();
  const buildId = params?.buildId;
  const [build, setBuild] = useState<Build | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defectForm, setDefectForm] = useState(defectInitialState);
  const [defectSubmitting, setDefectSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadData = useCallback(async () => {
    if (!buildId) return;
    setLoading(true);
    try {
      const [buildData, defectsData] = await Promise.all([getBuild(buildId), listDefects(buildId)]);
      setBuild(buildData);
      setDefects(defectsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load build details");
    } finally {
      setLoading(false);
    }
  }, [buildId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const handleStatusUpdate = async (status: string) => {
    if (!build) return;
    setStatusUpdating(true);
    try {
      const updated = await updateBuild(build.id, { inspection_status: status });
      setBuild(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDefectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!build) return;
    setDefectSubmitting(true);
    try {
      const defect = await createDefect(build.id, defectForm);
      setDefects((current) => [defect, ...current]);
      setDefectForm(defectInitialState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create defect");
    } finally {
      setDefectSubmitting(false);
    }
  };

  const updateDefectStatus = async (defectId: string, status: string) => {
    try {
      const updated = await updateDefect(defectId, { status });
      setDefects((current) => current.map((item) => (item.id === defectId ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update defect");
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading build details…</div></main>;
  }

  if (error || !build) {
    return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">{error ?? "Build not found"}</div></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Build details</p>
            <h1 className="mt-2 text-3xl font-semibold">{build.serial_number}</h1>
            <p className="mt-2 text-sm text-slate-600">{build.manufacturer} {build.model_name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/builds" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Back to builds</Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Inspection summary</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-sm font-medium text-slate-500">Status</dt><dd className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-900">{build.inspection_status}</dd></div>
              <div><dt className="text-sm font-medium text-slate-500">Inspector</dt><dd className="mt-1 text-sm text-slate-900">{build.inspector_name}</dd></div>
              <div><dt className="text-sm font-medium text-slate-500">CPU</dt><dd className="mt-1 text-sm text-slate-900">{build.cpu}</dd></div>
              <div><dt className="text-sm font-medium text-slate-500">GPU</dt><dd className="mt-1 text-sm text-slate-900">{build.gpu}</dd></div>
              <div><dt className="text-sm font-medium text-slate-500">RAM</dt><dd className="mt-1 text-sm text-slate-900">{build.ram_gb} GB</dd></div>
              <div><dt className="text-sm font-medium text-slate-500">Storage</dt><dd className="mt-1 text-sm text-slate-900">{build.storage_gb} GB</dd></div>
              <div><dt className="text-sm font-medium text-slate-500">Operating system</dt><dd className="mt-1 text-sm text-slate-900">{build.operating_system ?? "—"}</dd></div>
              <div><dt className="text-sm font-medium text-slate-500">Asset tag</dt><dd className="mt-1 text-sm text-slate-900">{build.asset_tag ?? "—"}</dd></div>
            </dl>
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</h3>
              <p className="mt-2 text-sm text-slate-700">{build.notes ?? "No notes recorded."}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Update inspection status</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["pending", "passed", "failed", "rework"] as const).map((status) => (
                <button key={status} disabled={statusUpdating} onClick={() => void handleStatusUpdate(status)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70">
                  {status}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Add a defect</h2>
          <form onSubmit={handleDefectSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Category
              <select value={defectForm.defect_category} onChange={(event) => setDefectForm((current) => ({ ...current, defect_category: event.target.value as typeof current.defect_category }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500">
                {(["wiring", "gpu", "cpu", "memory", "storage", "cooling", "cosmetic", "software", "other"] as const).map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Severity
              <select value={defectForm.severity} onChange={(event) => setDefectForm((current) => ({ ...current, severity: event.target.value as typeof current.severity }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500">
                {(["low", "medium", "high", "critical"] as const).map((severity) => <option key={severity} value={severity}>{severity}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Description
              <textarea required value={defectForm.description} onChange={(event) => setDefectForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Resolution notes
              <textarea value={defectForm.resolution_notes} onChange={(event) => setDefectForm((current) => ({ ...current, resolution_notes: event.target.value }))} rows={2} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Status
              <select value={defectForm.status} onChange={(event) => setDefectForm((current) => ({ ...current, status: event.target.value as typeof current.status }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500">
                {(["open", "in_rework", "resolved"] as const).map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <div className="flex items-end justify-end">
              <button type="submit" disabled={defectSubmitting} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400">{defectSubmitting ? "Saving…" : "Save defect"}</button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Associated defects</h2>
          {defects.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No defects have been recorded for this build yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {defects.map((defect) => (
                <div key={defect.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{defect.description}</p>
                      <p className="text-sm text-slate-600">{defect.defect_category} • {defect.severity}</p>
                    </div>
                    <div className="flex gap-2">
                      {(["open", "in_rework", "resolved"] as const).map((status) => (
                        <button key={status} onClick={() => void updateDefectStatus(defect.id, status)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{defect.resolution_notes ?? "No resolution notes"}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
