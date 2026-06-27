"use client";

import { useEffect, useState } from "react";
import { ApiError, createUser, listUsers, updateUserStatus, type User, type UserRole } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

const initialForm = {
  email: "",
  full_name: "",
  password: "",
  role: "technician" as UserRole,
};

export default function UsersPage() {
  const { loading, authorized } = useRequireAuth(["admin"]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await listUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load users");
      }
    }
  };

  useEffect(() => {
    if (loading || !authorized) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loading, authorized]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await createUser(form);
      setForm(initialForm);
      await loadUsers();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create user");
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (user: User) => {
    try {
      await updateUserStatus(user.id, !user.is_active);
      await loadUsers();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to update user status");
      }
    }
  };

  if (loading || !authorized) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold">User management</h1>
          <p className="mt-2 text-sm text-slate-600">Create users and activate or disable accounts by role.</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Create user</h2>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
            {error && <p className="md:col-span-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Full name
              <input
                required
                value={form.full_name}
                onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Password
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Role
              <select
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="technician">technician</option>
                <option value="supervisor">supervisor</option>
                <option value="admin">admin</option>
              </select>
            </label>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {creating ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Current users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 pr-4 text-slate-900">{user.full_name}</td>
                    <td className="py-3 pr-4">{user.email}</td>
                    <td className="py-3 pr-4 uppercase">{user.role}</td>
                    <td className="py-3 pr-4">{user.is_active ? "active" : "inactive"}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => void toggleActive(user)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
