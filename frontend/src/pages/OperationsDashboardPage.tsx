import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardApi } from "../api/dashboard";
import LiveViewModal from "../components/LiveViewModal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateViews";
import { AlertIcon, CameraIcon, ChartIcon, IncidentIcon, MonitorIcon } from "../components/icons";
import { useFetch } from "../hooks/useFetch";
import type { AiEvent, Camera } from "../types";

const peopleCountData = [
  { time: "00:00", visitors: 220, entries: 160, exits: 110 },
  { time: "04:00", visitors: 380, entries: 260, exits: 170 },
  { time: "08:00", visitors: 670, entries: 430, exits: 290 },
  { time: "12:00", visitors: 920, entries: 610, exits: 430 },
  { time: "16:00", visitors: 540, entries: 390, exits: 330 },
  { time: "20:00", visitors: 420, entries: 300, exits: 250 },
  { time: "24:00", visitors: 680, entries: 450, exits: 360 },
];

const cameraFallbackImages = [
   "https://whitepapers.axis.com/image/t10171473.jpg",
  "https://whitepapers.axis.com/image/t10171475.jpg",
 
  "https://whitepapers.axis.com/image/t10171474.jpg",
  "https://whitepapers.axis.com/image/t10171471.png",
  "https://www.camvex.com.au/samples/images/thumbs/thumb1b.jpg",
  "https://www.camvex.com.au/samples/images/thumbs/thumb2b.jpg",
];

function formatTime(value?: string | null) {
  if (!value) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function eventLabel(value: string) {
  return value.replaceAll("_", " ");
}

function statusColor(status: Camera["status"]) {
  if (status === "ONLINE") return "text-emerald-600 bg-emerald-50";
  if (status === "OFFLINE") return "text-red-600 bg-red-50";
  return "text-amber-600 bg-amber-50";
}

function severityColor(severity: AiEvent["severity"]) {
  if (severity === "CRITICAL" || severity === "HIGH") return "bg-red-50 text-red-600";
  if (severity === "MEDIUM") return "bg-amber-50 text-amber-600";
  return "bg-sky-50 text-sky-600";
}

function StatTile({ label, value, helper, icon, color }: { label: string; value: string | number; helper: string; icon: ReactNode; color: string }) {
  return (
    <div className="rounded-lg border border-[#edf1f7] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg text-white" style={{ backgroundColor: color }}>
          {icon}
        </span>
        <div>
          <p className="text-xs font-bold text-ink-500">{label}</p>
          <p className="mt-1 text-2xl font-black leading-none text-[#111827]">{value}</p>
          <p className="mt-1 text-[11px] font-semibold text-ink-400">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function CameraFeed({ camera, index, onPlay }: { camera: Camera; index: number; onPlay: () => void }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#edf1f7] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <div className="flex h-9 items-center justify-between border-b border-[#edf1f7] px-3 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded bg-[#f4f7fb] px-2 py-1 font-black text-ink-500">{String(index + 1).padStart(2, "0")}</span>
          <span className="truncate font-bold text-[#111827]">{camera.name}</span>
          <span className={`h-2 w-2 rounded-full ${camera.status === "ONLINE" ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className={camera.status === "ONLINE" ? "font-bold text-emerald-600" : "font-bold text-red-600"}>{camera.status === "ONLINE" ? "LIVE" : camera.status}</span>
        </div>
        <button onClick={onPlay} className="rounded p-1 text-ink-400 hover:bg-[#f4f7fb] hover:text-[#1167ee]" aria-label={`Open ${camera.name}`}>
          ⛶
        </button>
      </div>
      <button onClick={onPlay} className="relative block aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-800 via-slate-600 to-slate-900">
        <img
          src={cameraFallbackImages[index % cameraFallbackImages.length]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.38))]" />
        <span className="absolute left-2 top-2 rounded bg-black/55 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
          CAM {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[10px] font-black text-[#111827]">
          {formatTime(camera.lastHeartbeatAt)}
        </span>
        <span className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded bg-white/90 text-[#1167ee]">
          <CameraIcon className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
}

export default function OperationsDashboardPage() {
  const { data, loading, error } = useFetch(() => dashboardApi.operations());
  const [playing, setPlaying] = useState<{ id: number; name: string } | null>(null);

  const totals = useMemo(() => {
    const cameras = data?.cameras ?? [];
    const online = cameras.filter((camera) => camera.status === "ONLINE").length;
    const offline = cameras.filter((camera) => camera.status === "OFFLINE").length;
    return { cameras, online, offline };
  }, [data]);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!data) return null;

  const activeAlerts = data.recentEvents.filter((event) => !event.acknowledged).length;
  const occupancy = 68;
  const occupancyData = [
    { name: "occupied", value: occupancy, color: "#2477f3" },
    { name: "free", value: 100 - occupancy, color: "#e8eef7" },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatTile label="Total Cameras" value={totals.cameras.length} helper="All Cameras" color="#2477f3" icon={<CameraIcon className="h-5 w-5" />} />
        <StatTile label="Online Cameras" value={totals.online} helper="100% online" color="#22c55e" icon={<MonitorIcon className="h-5 w-5" />} />
        <StatTile label="Offline Cameras" value={totals.offline} helper="0% offline" color="#ef4444" icon={<CameraIcon className="h-5 w-5" />} />
        <StatTile label="Active Alerts" value={activeAlerts} helper="View All Alerts" color="#f59e0b" icon={<AlertIcon className="h-5 w-5" />} />
        <StatTile label="Visitors Today" value="2,358" helper="+12.5% vs yesterday" color="#0ea5e9" icon={<ChartIcon className="h-5 w-5" />} />
        <div className="rounded-lg border border-[#edf1f7] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-ink-500">Current Occupancy</p>
              <p className="mt-1 text-2xl font-black leading-none text-[#111827]">{occupancy}%</p>
              <p className="mt-1 text-[11px] font-semibold text-ink-400">1,632 / 2,400</p>
            </div>
            <div className="h-14 w-14">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={occupancyData} innerRadius={20} outerRadius={28} dataKey="value" startAngle={90} endAngle={450}>
                    {occupancyData.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <section>
          {data.cameras.length === 0 ? (
            <EmptyBlock message="No cameras registered yet." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {data.cameras.slice(0, 6).map((camera, index) => (
                <CameraFeed
                  key={camera.id}
                  camera={camera}
                  index={index}
                  onPlay={() => setPlaying({ id: camera.id, name: camera.name })}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-lg border border-[#edf1f7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
          <div className="flex items-center justify-between border-b border-[#edf1f7] px-4 py-3">
            <h2 className="text-[13px] font-black uppercase text-[#111827]">Real-Time Alerts</h2>
            <button className="text-xs font-bold text-[#1167ee]">View All</button>
          </div>
          <div className="divide-y divide-[#f0f3f8]">
            {data.recentEvents.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-lg ${severityColor(event.severity)}`}>
                  <IncidentIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-[#111827]">{eventLabel(event.eventType)}</p>
                  <p className="truncate text-[11px] font-semibold text-ink-400">{event.cameraName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-ink-400">{formatTime(event.detectedAt)}</p>
                  <span className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-[9px] font-black ${severityColor(event.severity)}`}>{event.severity}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#edf1f7] px-4 py-3 text-xs font-bold text-ink-500">
            Total Alerts: <span className="text-[#111827]">{data.recentEvents.length}</span>
          </div>
        </aside>
      </div>

      {playing && (
        <LiveViewModal cameraId={playing.id} cameraName={playing.name} onClose={() => setPlaying(null)} />
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <section className="rounded-lg border border-[#edf1f7] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-black uppercase text-[#111827]">People Count Analytics</h2>
            <button className="rounded-md border border-[#edf1f7] px-3 py-1 text-xs font-bold text-ink-500">Today</button>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peopleCountData} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="visitors" stroke="#2477f3" fill="#2477f3" fillOpacity={0.12} strokeWidth={2} />
                <Area type="monotone" dataKey="entries" stroke="#20c997" fill="#20c997" fillOpacity={0.08} strokeWidth={2} />
                <Area type="monotone" dataKey="exits" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
            {[
              ["Total Visitors", "2,358", "+12.5%"],
              ["Total Entries", "1,245", "+10.3%"],
              ["Total Exits", "1,113", "+9.8%"],
              ["Peak Hour", "10:00 AM", "456 Visitors"],
            ].map(([label, value, helper]) => (
              <div key={label}>
                <p className="font-semibold text-ink-400">{label}</p>
                <p className="mt-1 font-black text-[#111827]">{value}</p>
                <p className="text-[10px] font-bold text-emerald-600">{helper}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#edf1f7] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-black uppercase text-[#111827]">Occupancy & Heat Map</h2>
            <button className="rounded-md border border-[#edf1f7] px-3 py-1 text-xs font-bold text-ink-500">Today</button>
          </div>
          <div className="grid grid-cols-[130px_1fr] gap-4">
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-ink-400">Current Occupancy</p>
                <p className="mt-1 text-3xl font-black text-emerald-500">68%</p>
                <p className="font-semibold text-ink-500">1,632 / 2,400</p>
              </div>
              <div>
                <p className="font-semibold text-ink-400">Maximum Capacity</p>
                <p className="mt-1 text-lg font-black text-[#111827]">2,400</p>
              </div>
            </div>
            <div className="relative h-40 overflow-hidden rounded-lg border border-[#edf1f7] bg-[#eaf1f6]">
              <div className="absolute left-[12%] top-[18%] h-16 w-20 rounded-full bg-cyan-300 blur-xl" />
              <div className="absolute left-[24%] top-[46%] h-16 w-16 rounded-full bg-red-500 blur-xl" />
              <div className="absolute left-[62%] top-[16%] h-16 w-20 rounded-full bg-sky-400 blur-xl" />
              <div className="absolute left-[72%] top-[54%] h-20 w-20 rounded-full bg-amber-400 blur-xl" />
              <div className="absolute inset-5 rounded border border-white/60" />
              <div className="absolute right-3 top-3 h-28 w-2 rounded-full bg-gradient-to-t from-sky-500 via-amber-300 to-red-500" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <p><span className="font-semibold text-ink-400">Peak Time</span><br /><b>10:00 AM</b></p>
            <p><span className="font-semibold text-ink-400">Avg Dwell</span><br /><b>45 min</b></p>
            <p><span className="font-semibold text-ink-400">Trend</span><br /><b className="text-emerald-600">+8.2%</b></p>
          </div>
        </section>

        <section className="rounded-lg border border-[#edf1f7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
          <div className="border-b border-[#edf1f7] px-4 py-3">
            <h2 className="text-[13px] font-black uppercase text-[#111827]">Camera Health Status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#f8fafc] text-left text-ink-400">
                <tr>
                  <th className="px-3 py-2 font-bold">Camera</th>
                  <th className="px-3 py-2 font-bold">Status</th>
                  <th className="px-3 py-2 font-bold">FPS</th>
                  <th className="px-3 py-2 font-bold">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3f8]">
                {data.cameras.slice(0, 6).map((camera, index) => (
                  <tr key={camera.id}>
                    <td className="px-3 py-2 font-semibold text-[#111827]">{String(index + 1).padStart(2, "0")} {camera.name}</td>
                    <td className="px-3 py-2"><span className={`rounded px-2 py-1 text-[10px] font-black ${statusColor(camera.status)}`}>{camera.status}</span></td>
                    <td className="px-3 py-2 font-semibold text-ink-500">{camera.status === "ONLINE" ? 25 : 0}</td>
                    <td className="px-3 py-2"><span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">{camera.status === "ONLINE" ? 95 - index : 42}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
