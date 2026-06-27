"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBuild } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

const initialState = {
  serial_number: "",
  asset_tag: "",
  manufacturer: "",
  model_name: "",
  cpu: "",
  gpu: "",
  ram_gb: "",
  storage_gb: "",
  operating_system: "",
  inspection_status: "pending",
  inspector_name: "",
  notes: "",
};

export default function NewInspectionPage() {
  const { loading: authLoading, authorized } = useRequireAuth(["technician", "supervisor", "admin"]);
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!form.serial_number || !form.manufacturer || !form.model_name || !form.cpu || !form.gpu || !form.inspector_name || !form.ram_gb || !form.storage_gb) {
      setError("Please fill in the required build fields.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...form,
        ram_gb: Number(form.ram_gb),
        storage_gb: Number(form.storage_gb),
      };
      const build = await createBuild(payload);
      setSuccess(`Inspection ${build.serial_number} created.`);
      router.push(`/builds/${build.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create inspection");
      setSubmitting(false);
    }
  };

  if (authLoading || !authorized) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">New build</p>
            <h1 className="mt-2 text-3xl font-semibold">Create inspection record</h1>
          </div>
          <Link href="/builds" className="text-sm font-medium text-slate-700 hover:text-slate-900">Back to builds</Link>
        </header>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {success && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Serial number*
              <input required value={form.serial_number} onChange={(event) => handleChange("serial_number", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Asset tag
              <input value={form.asset_tag} onChange={(event) => handleChange("asset_tag", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Manufacturer*
              <input required value={form.manufacturer} onChange={(event) => handleChange("manufacturer", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Model name*
              <input required value={form.model_name} onChange={(event) => handleChange("model_name", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              CPU*
              <input required value={form.cpu} onChange={(event) => handleChange("cpu", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              GPU*
              <input required value={form.gpu} onChange={(event) => handleChange("gpu", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              RAM (GB)*
              <input required type="number" min="1" value={form.ram_gb} onChange={(event) => handleChange("ram_gb", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Storage (GB)*
              <input required type="number" min="1" value={form.storage_gb} onChange={(event) => handleChange("storage_gb", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Operating system
              <input value={form.operating_system} onChange={(event) => handleChange("operating_system", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Inspector*
              <input required value={form.inspector_name} onChange={(event) => handleChange("inspector_name", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Status
              <select value={form.inspection_status} onChange={(event) => handleChange("inspection_status", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500">
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="rework">Rework</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
              Notes
              <textarea value={form.notes} onChange={(event) => handleChange("notes", event.target.value)} rows={4} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Link href="/builds" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Cancel</Link>
            <button type="submit" disabled={submitting} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400">
              {submitting ? "Saving…" : "Save inspection"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
