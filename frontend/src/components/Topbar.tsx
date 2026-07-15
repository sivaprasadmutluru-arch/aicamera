import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useRealtime } from "../hooks/useRealtime";
import type { RealtimeNotification } from "../hooks/useRealtime";
import Button from "./Button";
import { BellIcon, LogoutIcon, MoonIcon, SunIcon } from "./icons";
import Modal from "./Modal";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Executive Dashboard",
  "/operations": "Live Monitoring",
  "/analytics": "Analytics",
  "/cameras": "Camera Management",
  "/ai-events": "AI Events",
  "/incidents": "Incident Management",
  "/reports": "Reports",
  "/users": "User Management",
  "/audit-logs": "Audit Logs",
};

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function roleLabel(role: string): string {
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function timeAgo(epochMs: number): string {
  const seconds = Math.floor((Date.now() - epochMs) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationRow({
  notification,
  onSelect,
}: {
  notification: RealtimeNotification;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
            notification.kind === "AI_EVENT" ? "bg-live-500" : "bg-red-500"
          }`}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{notification.title}</p>
          <p className="text-xs text-ink-500 dark:text-ink-400 truncate">{notification.detail}</p>
          <p className="text-[11px] text-ink-300 mt-0.5">{timeAgo(notification.receivedAt)}</p>
        </div>
      </div>
    </button>
  );
}

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, connected, clear } = useRealtime();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const title = PAGE_TITLES[location.pathname] ?? "Dashboard";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleSelectNotification(notification: RealtimeNotification) {
    setShowNotifications(false);
    navigate(notification.kind === "AI_EVENT" ? "/ai-events" : "/incidents");
  }

  return (
    <header className="h-[74px] shrink-0 bg-white dark:bg-ink-800 border-b border-[#edf1f7] dark:border-ink-700 flex items-center justify-between gap-5 px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-[17px] font-bold text-[#111827] dark:text-ink-100">{title}</h1>
          <p className="text-xs text-ink-400">Overview of your system</p>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 xl:flex">
        <div className="mr-2 border-l border-[#edf1f7] pl-5 text-right">
          <p className="text-[10px] font-bold text-ink-400">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="mt-0.5 text-[18px] font-black leading-none tracking-tight text-[#111827]">
            {now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        {[
          { label: "Dahua VMS", value: connected ? "Connected" : "Offline", healthy: connected },
          { label: "API Status", value: "Connected", healthy: true },
          { label: "System Status", value: "Healthy", healthy: true },
          { label: "Server Time", value: "Sync", healthy: true },
        ].map(({ label, value, healthy }) => (
          <div
            key={label}
            className="flex h-11 min-w-[118px] items-center gap-2 rounded-lg border border-[#edf1f7] bg-white px-3 shadow-[0_6px_16px_rgba(15,23,42,0.03)]"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                healthy ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${healthy ? "bg-emerald-500" : "bg-red-500"}`} />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[10px] font-black text-[#111827]">{label}</span>
              <span className={`block truncate text-[10px] font-bold ${healthy ? "text-emerald-600" : "text-red-600"}`}>
                {value}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={toggleTheme}
          className="text-ink-500 dark:text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative block"
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5 text-ink-500 dark:text-ink-400" />
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-ink-800 rounded-lg shadow-xl border border-ink-100 dark:border-ink-700 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-700">
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Notifications</p>
                  {notifications.length > 0 && (
                    <button
                      onClick={clear}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-ink-50 dark:divide-ink-700">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-ink-400 text-center py-8">No notifications yet</p>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationRow
                        key={notification.id}
                        notification={notification}
                        onSelect={() => handleSelectNotification(notification)}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-2.5 pl-1 border-l border-ink-100 dark:border-ink-700">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-semibold">
              {initials(user.fullName)}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{user.fullName}</p>
              <p className="text-xs text-ink-400">{roleLabel(user.role)}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-500 dark:text-ink-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <LogoutIcon className="h-4 w-4" />
          Logout
        </button>
      </div>

      {showLogoutConfirm && (
        <Modal title="Confirm Logout" onClose={() => setShowLogoutConfirm(false)}>
          <p className="text-sm text-ink-600 dark:text-ink-300 mb-6">
            Are you sure you want to log out of the dashboard?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </Modal>
      )}
    </header>
  );
}
