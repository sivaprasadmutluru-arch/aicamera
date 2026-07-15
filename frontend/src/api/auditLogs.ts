import { api } from "./client";
import type { AuditLog, PageResponse } from "../types";

export const auditLogsApi = {
  list: (page = 0, size = 50) =>
    api.get<PageResponse<AuditLog>>(`/audit-logs?page=${page}&size=${size}`),
};
