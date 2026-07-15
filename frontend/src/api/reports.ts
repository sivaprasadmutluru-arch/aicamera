import { api } from "./client";
import type { Camera, PeriodReport } from "../types";

export const reportsApi = {
  daily: () => api.get<PeriodReport>("/reports/daily"),
  weekly: () => api.get<PeriodReport>("/reports/weekly"),
  monthly: () => api.get<PeriodReport>("/reports/monthly"),
  devices: () => api.get<Camera[]>("/reports/devices"),
};
