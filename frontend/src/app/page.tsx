"use client";

import { useEffect, useState } from "react";

type BackendHealthResponse = {
  status: string;
  service: string;
};

export default function Home() {
  const [data, setData] = useState<BackendHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/health");
        if (!response.ok) {
          throw new Error("Failed to reach backend");
        }

        const result: BackendHealthResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {loading && <p className="text-gray-600">Checking backend connection...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {data && (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-green-600">Backend connected</p>
            <p className="text-gray-700">Status: {data.status}</p>
            <p className="text-gray-700">Service: {data.service}</p>
          </div>
        )}
      </div>
    </main>
  );
}
