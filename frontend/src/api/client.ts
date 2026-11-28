import type {
  CycleComplete,
  CycleCreate,
  CycleDetail,
  CycleSummary,
  EntryRead,
  EntryUpsert,
} from "./schema";

/** API が成功以外の状態を返したときのエラー。本文は含めません。 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (!response.ok) {
    throw new ApiError(response.status);
  }
  return (await response.json()) as T;
}

function jsonBody(method: string, body: unknown): RequestInit {
  return { method, body: JSON.stringify(body) };
}

export const api = {
  listCycles(status: CycleSummary["status"], signal?: AbortSignal) {
    return request<CycleSummary[]>(`/api/cycles?status=${status}`, { signal });
  },
  createCycle(body: CycleCreate) {
    return request<CycleDetail>("/api/cycles", jsonBody("POST", body));
  },
  getCycle(cycleId: number, signal?: AbortSignal) {
    return request<CycleDetail>(`/api/cycles/${cycleId}`, { signal });
  },
  upsertEntry(cycleId: number, entryDate: string, body: EntryUpsert) {
    return request<EntryRead>(`/api/cycles/${cycleId}/entries/${entryDate}`, jsonBody("PUT", body));
  },
  completeCycle(cycleId: number, body: CycleComplete) {
    return request<CycleDetail>(`/api/cycles/${cycleId}/complete`, jsonBody("POST", body));
  },
};
