import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../api/dashboard";
import { ErrorBlock, LoadingBlock } from "../components/StateViews";
import {
  CameraIcon,
  ChartIcon,
  IncidentIcon,
  MonitorIcon,
  ReportIcon,
} from "../components/icons";
import { useFetch } from "../hooks/useFetch";

const eventTrend = [
  { day: "May 14", intrusion: 280, line: 320, face: 160, vehicle: 90, other: 210 },
  { day: "May 15", intrusion: 220, line: 510, face: 240, vehicle: 150, other: 260 },
  { day: "May 16", intrusion: 590, line: 310, face: 380, vehicle: 130, other: 210 },
  { day: "May 17", intrusion: 410, line: 500, face: 260, vehicle: 190, other: 380 },
  { day: "May 18", intrusion: 680, line: 360, face: 300, vehicle: 160, other: 220 },
  { day: "May 19", intrusion: 710, line: 240, face: 310, vehicle: 510, other: 180 },
  { day: "May 20", intrusion: 560, line: 230, face: 350, vehicle: 540, other: 260 },
];

const eventTypes = [
  { name: "Intrusion", value: 398, color: "#2477f3" },
  { name: "Line Crossing", value: 311, color: "#20c997" },
  { name: "Face Detection", value: 249, color: "#7c3aed" },
  { name: "Vehicle Detection", value: 187, color: "#f59e0b" },
  { name: "Other Events", value: 101, color: "#14b8a6" },
];

const recentEvents = [
  { title: "Intrusion Detected", source: "Front Gate - Camera 02", time: "10:24:35 AM", risk: "High", color: "bg-red-500" },
  { title: "Line Crossing", source: "Parking Area - Camera 04", time: "10:21:18 AM", risk: "Medium", color: "bg-amber-500" },
  { title: "Face Recognized", source: "Lobby - Camera 01", time: "10:19:42 AM", risk: "Low", color: "bg-sky-500" },
  { title: "Vehicle Detected", source: "Entry Gate - Camera 08", time: "10:18:07 AM", risk: "Low", color: "bg-sky-500" },
];

const resourceUsage = [
  { label: "CPU Usage", sublabel: "CPU", value: 32, color: "#2477f3", icon: <ChartIcon className="h-4 w-4" /> },
  { label: "RAM Usage", sublabel: "RAM", value: 58, color: "#20c997", icon: <MonitorIcon className="h-4 w-4" /> },
  { label: "Disk Usage", sublabel: "Disk", value: 67, color: "#7c3aed", icon: <ReportIcon className="h-4 w-4" /> },
  { label: "Network", sublabel: "128 Mbps / 64 Mbps", value: 46, color: "#06b6d4", icon: <ChartIcon className="h-4 w-4" /> },
  { label: "Storage Usage", sublabel: "2.4 TB / 4 TB", value: 60, color: "#f59e0b", icon: <ReportIcon className="h-4 w-4" /> },
];

function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-[#edf1f7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)] ${className}`}>
      <div className="flex items-center justify-between border-b border-[#f0f3f8] px-4 py-3">
        <h2 className="text-[13px] font-bold text-[#111827]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  color,
  trend,
  to,
}: {
  label: string;
  value: number;
  helper: string;
  icon: ReactNode;
  color: string;
  trend: number[];
  to?: string;
}) {
  const chartData = trend.map((point, index) => ({ index, point }));
  const navigate = useNavigate();
  const clickable = Boolean(to);
  const openTarget = () => {
    if (to) navigate(to);
  };

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? openTarget : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openTarget();
              }
            }
          : undefined
      }
      className={`rounded-lg border border-[#edf1f7] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)] transition ${
        clickable ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#b8d5ff] hover:shadow-[0_12px_28px_rgba(17,103,238,0.12)] focus:outline-none focus:ring-2 focus:ring-[#1167ee]/30" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ backgroundColor: color }}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-500">{label}</p>
            <p className="mt-1 text-2xl font-black leading-none text-[#111827]">{value.toLocaleString()}</p>
          </div>
        </div>
        <div className="h-10 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <Area type="monotone" dataKey="point" stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-3 text-[11px] font-semibold text-emerald-600">{helper}</p>
    </div>
  );
}

function CameraMap() {
  const points = [
    { x: "19%", y: "40%", label: "1", color: "bg-red-500" },
    { x: "34%", y: "22%", label: "12", color: "bg-emerald-500" },
    { x: "45%", y: "52%", label: "8", color: "bg-emerald-500" },
    { x: "66%", y: "68%", label: "7", color: "bg-emerald-500" },
    { x: "78%", y: "44%", label: "15", color: "bg-emerald-500" },
  ];

  return (
    <div className="p-4">
      <div className="relative h-[214px] overflow-hidden rounded-md border border-[#edf1f7] bg-[#eef3f8]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 260" preserveAspectRatio="none">
          <rect width="640" height="260" fill="#eef3f8" />
          <path d="M0 58 C86 28 116 80 202 47 S350 35 420 72 542 112 640 66" stroke="#d9e2ee" strokeWidth="18" fill="none" />
          <path d="M0 164 C105 120 164 210 260 158 S431 122 520 166 596 194 640 178" stroke="#d9e2ee" strokeWidth="14" fill="none" />
          <path d="M86 0 L166 260M260 0 L228 260M407 0 L350 260M548 0 L466 260" stroke="#d6deea" strokeWidth="3" />
          <path d="M0 106 L640 120M0 215 L640 204" stroke="#d6deea" strokeWidth="3" />
          <path d="M80 56 L178 138 L284 114 L386 154 L502 92 L610 126" stroke="#b8d5ff" strokeWidth="3" fill="none" strokeDasharray="8 8" />
        </svg>
        <div className="absolute left-[50%] top-[32%] flex h-10 w-10 items-center justify-center rounded-full bg-[#2477f3] text-white shadow-lg">
          <CameraIcon className="h-5 w-5" />
        </div>
        {points.map((point) => (
          <span
            key={`${point.x}-${point.y}`}
            className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-black text-white shadow-lg ring-4 ring-white/70 ${point.color}`}
            style={{ left: point.x, top: point.y }}
          >
            {point.label}
          </span>
        ))}
        <div className="absolute right-3 top-3 grid gap-1">
          {["+", "-", "⛶"].map((control) => (
            <button key={control} className="h-7 w-7 rounded border border-[#dbe3ef] bg-white text-xs font-bold text-ink-500 shadow-sm">
              {control}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-5 text-xs font-medium text-ink-500">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Online</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-500" />Offline</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" />Maintenance</span>
      </div>
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  const { data, loading, error } = useFetch(() => dashboardApi.executive());

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!data) return null;

  const deviceTotal = data.totalCameras + 2;
  const health = [
    { name: "Online", value: data.onlineCameras, color: "#22c55e" },
    { name: "Offline", value: data.offlineCameras, color: "#ef4444" },
    { name: "Maintenance", value: Math.max(deviceTotal - data.totalCameras, 0), color: "#f59e0b" },
  ];

  return (
    <div className="mx-auto max-w-[1460px] space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Cameras" value={data.totalCameras} helper="+12 from yesterday" color="#2477f3" icon={<CameraIcon className="h-5 w-5" />} trend={[10, 18, 13, 22, 17, 28, 24]} to="/cameras" />
        <MetricCard label="Online Cameras" value={data.onlineCameras} helper={`${data.totalCameras ? Math.round((data.onlineCameras / data.totalCameras) * 100) : 0}% Online`} color="#16a34a" icon={<CameraIcon className="h-5 w-5" />} trend={[12, 16, 14, 19, 15, 21, 25]} to="/operations" />
        <MetricCard label="AI Events Today" value={data.aiEventsToday} helper="+18.5% from yesterday" color="#8b5cf6" icon={<ChartIcon className="h-5 w-5" />} trend={[8, 14, 22, 15, 26, 20, 31]} to="/ai-events" />
        <MetricCard label="Active Alerts" value={data.alertsToday || data.activeIncidents} helper="-8 from yesterday" color="#e11d48" icon={<IncidentIcon className="h-5 w-5" />} trend={[24, 17, 19, 14, 22, 29, 20]} to="/incidents" />
        <MetricCard label="Devices (NVR/DVR)" value={deviceTotal} helper={`${data.onlineCameras} Online | ${data.offlineCameras} Offline`} color="#2477f3" icon={<MonitorIcon className="h-5 w-5" />} trend={[16, 18, 17, 21, 19, 22, 24]} to="/cameras" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1.3fr]">
        <Panel title="Live Camera Map">
          <CameraMap />
        </Panel>

        <Panel
          title="AI Events Summary"
          action={<button className="rounded-md border border-[#edf1f7] px-3 py-1 text-xs font-semibold text-ink-500">This Week</button>}
        >
          <div className="h-[272px] px-4 pb-4 pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={eventTrend} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="intrusion" stroke="#2477f3" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="line" stroke="#20c997" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="face" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="vehicle" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="other" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 px-4 pb-4 text-[11px] font-semibold text-ink-500">
            {eventTypes.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1fr_0.9fr]">
        <Panel title="Events by Type (Today)">
          <div className="grid grid-cols-[180px_1fr] items-center gap-2 p-4">
            <div className="relative h-[178px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={eventTypes} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={1}>
                    {eventTypes.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#111827]">{data.aiEventsToday.toLocaleString()}</span>
                <span className="text-xs font-semibold text-ink-400">Total</span>
              </div>
            </div>
            <div className="space-y-2">
              {eventTypes.map((item) => (
                <div key={item.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs">
                  <span className="flex items-center gap-2 font-semibold text-ink-600"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                  <span className="font-bold text-ink-400">{Math.round((item.value / 1246) * 100)}%</span>
                  <span className="w-8 text-right font-bold text-ink-500">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Recent AI Events" action={<button className="text-xs font-bold text-[#1167ee]">View All</button>}>
          <div className="divide-y divide-[#f0f3f8] px-4">
            {recentEvents.map((event) => (
              <div key={`${event.title}-${event.time}`} className="flex items-center gap-3 py-3">
                <div className="h-10 w-14 rounded-md bg-gradient-to-br from-slate-200 to-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#111827]">{event.title}</p>
                  <p className="truncate text-[11px] font-medium text-ink-400">{event.source}</p>
                </div>
                <span className="text-[11px] font-semibold text-ink-400">{event.time}</span>
                <span className={`rounded px-2 py-1 text-[10px] font-black text-white ${event.color}`}>{event.risk}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Device Health" action={<button className="text-xs font-bold text-[#1167ee]">View All</button>}>
          <div className="grid grid-cols-[170px_1fr] items-center gap-3 p-4">
            <div className="relative h-[178px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={health} dataKey="value" innerRadius={54} outerRadius={78} startAngle={90} endAngle={450}>
                    {health.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#111827]">{deviceTotal}</span>
                <span className="text-xs font-semibold text-ink-400">Total</span>
              </div>
            </div>
            <div className="space-y-4">
              {health.map((item) => (
                <div key={item.name} className="grid grid-cols-[1fr_auto_auto] gap-3 text-xs font-semibold text-ink-500">
                  <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                  <span>{item.value}</span>
                  <span>{deviceTotal ? Math.round((item.value / deviceTotal) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="System Resource Usage">
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
          {resourceUsage.map((item) => (
            <div key={item.label} className="rounded-md border border-[#edf1f7] bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: `${item.color}16`, color: item.color }}>
                  {item.icon}
                </span>
                <span className="text-sm font-black text-[#111827]">{item.value}%</span>
              </div>
              <p className="mt-2 text-xs font-bold text-[#111827]">{item.label}</p>
              <p className="mt-0.5 text-[11px] font-medium text-ink-400">{item.sublabel}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf1f7]">
                <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
