import { API_BASE_URL, api } from "./client";
import type { AuthResponse, Role } from "../types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

function authServerUrl(path: string) {
  const serverBaseUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${serverBaseUrl}${path}`;
}

export const authApi = {
  login: (payload: LoginRequest) => api.post<AuthResponse>("/auth/login", payload),
  register: (payload: RegisterRequest) => api.post<AuthResponse>("/auth/register", payload),
  forgotPassword: (payload: ForgotPasswordRequest) => api.post<void>("/auth/forgot-password", payload),
  socialLoginUrl: (provider: "google" | "microsoft") =>
    authServerUrl(`/oauth2/authorization/${provider}`),
};
