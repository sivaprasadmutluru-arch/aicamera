import { api } from "./client";
import type { Role, User } from "../types";

export interface UpdateUserRequest {
  fullName?: string;
  role?: Role;
  department?: string;
  enabled?: boolean;
}

export const usersApi = {
  list: () => api.get<User[]>("/users"),
  get: (id: number) => api.get<User>(`/users/${id}`),
  update: (id: number, payload: UpdateUserRequest) => api.put<User>(`/users/${id}`, payload),
  assignCameras: (id: number, cameraIds: number[]) =>
    api.post<User>(`/users/${id}/cameras`, { cameraIds }),
  remove: (id: number) => api.delete<void>(`/users/${id}`),
};
