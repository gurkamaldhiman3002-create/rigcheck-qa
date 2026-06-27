const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
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
    throw new ApiError(message, response.status);
  }

  return parsed as T;
}

export type InspectionStatus = "pending" | "passed" | "failed" | "rework";
export type DefectCategory = "wiring" | "gpu" | "cpu" | "memory" | "storage" | "cooling" | "cosmetic" | "software" | "other";
export type DefectSeverity = "low" | "medium" | "high" | "critical";
export type DefectStatus = "open" | "in_rework" | "resolved";
export type UserRole = "technician" | "supervisor" | "admin";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthMeResponse = {
  user: User;
};

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

export async function login(payload: { email: string; password: string }) {
  return request<{ message: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export async function logout() {
  return request<{ message: string }>("/api/auth/logout", { method: "POST" });
}

export async function getMe() {
  return request<AuthMeResponse>("/api/auth/me");
}

export async function listUsers() {
  return request<User[]>("/api/users");
}

export async function createUser(payload: { email: string; full_name: string; password: string; role: UserRole }) {
  return request<User>("/api/users", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateUser(userId: string, payload: Partial<{ email: string; full_name: string; password: string; role: UserRole }>) {
  return request<User>(`/api/users/${userId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  return request<User>(`/api/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
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
