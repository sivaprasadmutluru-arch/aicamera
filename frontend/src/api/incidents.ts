import { api } from "./client";
import type { Incident, IncidentPriority, IncidentStatus, PageResponse } from "../types";

export interface IncidentRequest {
  title: string;
  description?: string;
  cameraId?: number;
  priority?: IncidentPriority;
}

export const incidentsApi = {
  list: (status?: IncidentStatus, page = 0, size = 25) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set("status", status);
    return api.get<PageResponse<Incident>>(`/incidents?${params.toString()}`);
  },
  get: (id: number) => api.get<Incident>(`/incidents/${id}`),
  create: (payload: IncidentRequest) => api.post<Incident>("/incidents", payload),
  assign: (id: number, userId: number) => api.patch<Incident>(`/incidents/${id}/assign/${userId}`),
  updateStatus: (id: number, status: IncidentStatus) =>
    api.patch<Incident>(`/incidents/${id}/status/${status}`),
  resolve: (id: number, resolutionNotes: string) =>
    api.patch<Incident>(`/incidents/${id}/resolve`, { resolutionNotes }),
};
