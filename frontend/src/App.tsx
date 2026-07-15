import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { RealtimeProvider } from "./hooks/useRealtime";
import AiEventsPage from "./pages/AiEventsPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import CamerasPage from "./pages/CamerasPage";
import ExecutiveDashboardPage from "./pages/ExecutiveDashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import IncidentsPage from "./pages/IncidentsPage";
import LoginPage from "./pages/LoginPage";
import OperationsDashboardPage from "./pages/OperationsDashboardPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";

function LoginRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function PublicAuthRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/forgot-password"
        element={
          <PublicAuthRoute>
            <ForgotPasswordPage />
          </PublicAuthRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ExecutiveDashboardPage />} />
        <Route path="/operations" element={<OperationsDashboardPage />} />
        <Route path="/analytics" element={<AnalyticsDashboardPage />} />
        <Route path="/cameras" element={<CamerasPage />} />
        <Route path="/ai-events" element={<AiEventsPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <RealtimeProvider>
            <AppRoutes />
          </RealtimeProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
