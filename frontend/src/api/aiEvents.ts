import { api } from "./client";
import type { AiEvent, AiEventType, EventSeverity, PageResponse } from "../types";

export interface AiEventFilters {
  cameraId?: number;
  eventType?: AiEventType;
  severity?: EventSeverity;
  from?: string;
  to?: string;
  acknowledged?: boolean;
  page?: number;
  size?: number;
}

function buildQuery(filters: AiEventFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const aiEventsApi = {
  search: (filters: AiEventFilters = {}) =>
    api.get<PageResponse<AiEvent>>(`/ai-events${buildQuery(filters)}`),
  acknowledge: (id: number) => api.patch<AiEvent>(`/ai-events/${id}/acknowledge`),
};
