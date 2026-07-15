import { api } from "./client";
import type { AnalyticsDashboard, ExecutiveDashboard, OperationsDashboard } from "../types";

export const dashboardApi = {
  executive: () => api.get<ExecutiveDashboard>("/dashboard/executive"),
  operations: () => api.get<OperationsDashboard>("/dashboard/operations"),
  analytics: () => api.get<AnalyticsDashboard>("/dashboard/analytics"),
};
