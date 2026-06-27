const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = await response.text();
  let parsed: unknown = null;
  if (data) {
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = data;
    }
  }

  if (!response.ok) {
    const message = typeof parsed === "object" && parsed && "detail" in parsed && typeof parsed.detail === "string"
      ? parsed.detail
      : "Request failed";
    throw new Error(message);
  }

  return parsed as T;
}

export type InspectionStatus = "pending" | "passed" | "failed" | "rework";
export type DefectCategory = "wiring" | "gpu" | "cpu" | "memory" | "storage" | "cooling" | "cosmetic" | "software" | "other";
export type DefectSeverity = "low" | "medium" | "high" | "critical";
export type DefectStatus = "open" | "in_rework" | "resolved";

export type BuildSummary = {
  total_builds: number;
  pending_inspections: number;
  passed_inspections: number;
  failed_inspections: number;
  builds_in_rework: number;
  open_defects: number;
  pass_rate: number;
};

export type Build = {
  id: string;
  serial_number: string;
  asset_tag?: string | null;
  manufacturer: string;
  model_name: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  storage_gb: number;
  operating_system?: string | null;
  inspection_status: InspectionStatus;
  inspector_name: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type BuildListResponse = {
  items: Build[];
  total: number;
  limit: number;
  offset: number;
};

export type Defect = {
  id: string;
  build_id: string;
  defect_category: DefectCategory;
  severity: DefectSeverity;
  description: string;
  resolution_notes?: string | null;
  status: DefectStatus;
  created_at: string;
  resolved_at?: string | null;
};

export async function getHealth() {
  return request<{ status: string; service: string; database: string }>('/health');
}

export async function getDashboardSummary() {
  return request<BuildSummary>('/api/dashboard/summary');
}

export async function listBuilds(params?: { limit?: number; offset?: number; status?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  const queryString = searchParams.toString();
  return request<BuildListResponse>(`/api/builds${queryString ? `?${queryString}` : ''}`);
}

export async function createBuild(payload: Record<string, unknown>) {
  return request<Build>('/api/builds', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getBuild(buildId: string) {
  return request<Build>(`/api/builds/${buildId}`);
}

export async function updateBuild(buildId: string, payload: Record<string, unknown>) {
  return request<Build>(`/api/builds/${buildId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteBuild(buildId: string) {
  return request<void>(`/api/builds/${buildId}`, { method: 'DELETE' });
}

export async function listDefects(buildId: string) {
  return request<Defect[]>(`/api/builds/${buildId}/defects`);
}

export async function createDefect(buildId: string, payload: Record<string, unknown>) {
  return request<Defect>(`/api/builds/${buildId}/defects`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateDefect(defectId: string, payload: Record<string, unknown>) {
  return request<Defect>(`/api/defects/${defectId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteDefect(defectId: string) {
  return request<void>(`/api/defects/${defectId}`, { method: 'DELETE' });
}
