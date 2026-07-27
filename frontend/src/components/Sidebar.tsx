import { NavLink } from "react-router-dom";
import type { ComponentType } from "react";
import elmntxLogo from "../assets/elmntx-logo.png";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";
import {
  AlertIcon,
  AuditIcon,
  CameraIcon,
  ChartIcon,
  DashboardIcon,
  IncidentIcon,
  MonitorIcon,
  ReportIcon,
  UsersIcon,
} from "./icons";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Executive", icon: DashboardIcon },
  { to: "/operations", label: "Live Monitoring", icon: MonitorIcon },
  { to: "/analytics", label: "Analytics", icon: ChartIcon },
  { to: "/cameras", label: "Cameras", icon: CameraIcon },
  { to: "/ai-events", label: "AI Events", icon: AlertIcon },
  { to: "/incidents", label: "Incidents", icon: IncidentIcon },
  { to: "/reports", label: "Reports", icon: ReportIcon },
  { to: "/users", label: "Users", icon: UsersIcon, roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/audit-logs", label: "Audit Logs", icon: AuditIcon, roles: ["SUPER_ADMIN", "ADMIN"] },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-[218px] shrink-0 bg-white text-ink-600 flex flex-col h-screen sticky top-0 border-r border-[#edf1f7] shadow-[6px_0_24px_rgba(17,24,39,0.03)]">
      <div className="h-[96px] flex items-center justify-center px-3 border-b border-[#edf1f7]">
        <img src={elmntxLogo} alt="ELMNTX" className="h-10 w-auto object-contain" />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map(
          (item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "bg-[#1167ee] text-white shadow-[0_8px_18px_rgba(17,103,238,0.22)]"
                    : "text-[#526174] hover:bg-[#f4f8ff] hover:text-[#1167ee]"
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="m-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs">
        <p className="font-bold text-emerald-700">System Status</p>
        <p className="mt-0.5 text-emerald-600">All systems operational</p>
      </div>
    </aside>
  );
}
