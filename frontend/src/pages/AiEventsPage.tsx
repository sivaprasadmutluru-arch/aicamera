import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { aiEventsApi } from "../api/aiEvents";
import Button from "../components/Button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateViews";
import { AlertIcon, CameraIcon, ChartIcon, IncidentIcon, UsersIcon } from "../components/icons";
import { AI_EVENT_TYPES, EVENT_SEVERITIES } from "../constants";
import { useFetch } from "../hooks/useFetch";
import type { AiEvent, AiEventType, EventSeverity } from "../types";

const kpiConfig = [
  { type: "FACE_DETECTION", label: "Face Detection", value: 342, color: "#2477f3", icon: <UsersIcon className="h-5 w-5" />, trend: [14, 20, 17, 28, 23, 34, 31] },
  { type: "FACE_RECOGNITION", label: "Face Recognition", value: 128, color: "#22c55e", icon: <UsersIcon className="h-5 w-5" />, trend: [10, 16, 13, 19, 15, 26, 24] },
  { type: "INTRUSION_DETECTION", label: "Intrusion Detection", value: 87, color: "#8b5cf6", icon: <IncidentIcon className="h-5 w-5" />, trend: [8, 12, 19, 14, 22, 18, 28] },
  { type: "LINE_CROSSING", label: "Line Crossing", value: 236, color: "#f59e0b", icon: <ChartIcon className="h-5 w-5" />, trend: [20, 18, 25, 22, 31, 28, 35] },
  { type: "VEHICLE_DETECTION", label: "Vehicle Detection", value: 184, color: "#14b8a6", icon: <CameraIcon className="h-5 w-5" />, trend: [12, 18, 16, 23, 21, 30, 27] },
  { type: "PPE_DETECTION", label: "PPE Detection", value: 64, color: "#eab308", icon: <AlertIcon className="h-5 w-5" />, trend: [18, 12, 16, 10, 15, 12, 20] },
  { type: "FIRE_DETECTION", label: "Fire & Smoke Alerts", value: 15, color: "#ef4444", icon: <AlertIcon className="h-5 w-5" />, trend: [4, 7, 5, 9, 6, 12, 10] },
] as const;

const similarMatches = [
  { name: "John Doe", match: "92%", color: "from-emerald-200 to-slate-500" },
  { name: "Michael Smith", match: "88%", color: "from-amber-200 to-slate-500" },
  { name: "David Brown", match: "83%", color: "from-sky-200 to-slate-500" },
  { name: "Chris Wilson", match: "81%", color: "from-rose-200 to-slate-500" },
];

const eventFallbackImages = [
  "https://whitepapers.axis.com/image/t10171475.jpg",
  "https://whitepapers.axis.com/image/t10171473.jpg",
  "https://whitepapers.axis.com/image/t10171474.jpg",
  "https://whitepapers.axis.com/image/t10171471.png",
  "https://www.camvex.com.au/samples/images/thumbs/thumb1b.jpg",
  "https://www.camvex.com.au/samples/images/thumbs/thumb2b.jpg",
];

function eventLabel(value: string) {
  return value.replaceAll("_", " ");
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function severityClass(severity: EventSeverity) {
  if (severity === "CRITICAL") return "text-red-600 bg-red-50 border-red-100";
  if (severity === "HIGH") return "text-rose-600 bg-rose-50 border-rose-100";
  if (severity === "MEDIUM") return "text-amber-600 bg-amber-50 border-amber-100";
  return "text-sky-600 bg-sky-50 border-sky-100";
}

function confidenceFor(index: number) {
  return [92, 87, 89, 94, 77, 88, 84, 91, 80, 86][index % 10];
}

function snapshotImageFor(event?: AiEvent, index = 0) {
  return event?.snapshotUrl || eventFallbackImages[index % eventFallbackImages.length];
}

function KpiCard({
  label,
  value,
  helper,
  icon,
  color,
  trend,
}: {
  label: string;
  value: number;
  helper: string;
  icon: ReactNode;
  color: string;
  trend: readonly number[];
}) {
  return (
    <div className="rounded-lg border border-[#edf1f7] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: color }}>
            {icon}
          </span>
          <div>
            <p className="text-[11px] font-bold text-ink-500">{label}</p>
            <p className="mt-1 text-2xl font-black leading-none text-[#111827]">{value}</p>
          </div>
        </div>
        <div className="h-9 w-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend.map((point, index) => ({ index, point }))}>
              <Area type="monotone" dataKey="point" stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-bold text-emerald-600">{helper}</p>
    </div>
  );
}

function Snapshot({ event, large = false, index = 0 }: { event?: AiEvent; large?: boolean; index?: number }) {
  const eventKind = event?.eventType ?? "FACE_RECOGNITION";
  const imageUrl = snapshotImageFor(event, index);

  return (
    <div
      className={`relative overflow-hidden rounded-md bg-gradient-to-br from-slate-800 via-slate-600 to-slate-900 ${
        large ? "h-[226px] w-full" : "h-14 w-20"
      }`}
    >
      <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.44))]" />
      {large && (
        <>
          <span className="absolute left-3 top-3 rounded bg-emerald-500 px-2 py-1 text-[10px] font-black text-white">
            {eventLabel(eventKind)}
          </span>
          <span className="absolute bottom-3 left-3 rounded bg-black/55 px-2 py-1 text-[10px] font-bold text-white">
            {event?.cameraName ?? "Front Gate - Camera 01"}
          </span>
          <span className="absolute bottom-3 right-3 rounded bg-black/55 px-2 py-1 text-[10px] font-bold text-white">
            {event ? `${shortDate(event.detectedAt)} ${formatTime(event.detectedAt)}` : "May 20, 2025 10:24:35 AM"}
          </span>
        </>
      )}
      {!large && (
        <span className="absolute bottom-1 right-1 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-black text-[#111827]">
          {event ? formatTime(event.detectedAt) : `10:2${index}:36`}
        </span>
      )}
    </div>
  );
}

export default function AiEventsPage() {
  const [eventType, setEventType] = useState<AiEventType | "">("");
  const [severity, setSeverity] = useState<EventSeverity | "">("");
  const [acknowledged, setAcknowledged] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const { data, loading, error, reload } = useFetch(
    () =>
      aiEventsApi.search({
        eventType: eventType || undefined,
        severity: severity || undefined,
        acknowledged: acknowledged === "" ? undefined : acknowledged === "true",
        page,
        size: 20,
      }),
    [eventType, severity, acknowledged, page]
  );

  const events = useMemo(() => data?.content ?? [], [data]);
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0] ?? null;

  useEffect(() => {
    if (events.length > 0 && !events.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  async function handleAcknowledge(id: number) {
    await aiEventsApi.acknowledge(id);
    reload();
  }

  const stats = useMemo(() => {
    const typeCounts = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] ?? 0) + 1;
      return acc;
    }, {});

    return kpiConfig.map((card) => ({
      ...card,
      value: typeCounts[card.type] ?? card.value,
      helper: card.type === "PPE_DETECTION" ? "-4.5% from yesterday" : "+12.5% from yesterday",
    }));
  }, [events]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">
        {stats.map((card) => (
          <KpiCard key={card.type} {...card} />
        ))}
      </div>

      <section className="rounded-lg border border-[#edf1f7] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-black text-[#111827]">AI Events</h2>
            <p className="text-xs font-medium text-ink-400">Dashboard / AI Events</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="h-10 w-64 rounded-md border border-[#dbe3ef] bg-white px-3 text-sm font-semibold text-ink-600 outline-none focus:border-[#1167ee]"
              placeholder="Search events, cameras, locations..."
            />
            <select
              value={eventType}
              onChange={(e) => {
                setPage(0);
                setEventType(e.target.value as AiEventType | "");
              }}
              className="h-10 rounded-md border border-[#dbe3ef] bg-white px-3 text-sm font-semibold text-ink-600 outline-none focus:border-[#1167ee]"
            >
              <option value="">All Event Types</option>
              {AI_EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {eventLabel(type)}
                </option>
              ))}
            </select>
            <select
              value={severity}
              onChange={(e) => {
                setPage(0);
                setSeverity(e.target.value as EventSeverity | "");
              }}
              className="h-10 rounded-md border border-[#dbe3ef] bg-white px-3 text-sm font-semibold text-ink-600 outline-none focus:border-[#1167ee]"
            >
              <option value="">All Severities</option>
              {EVENT_SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
            <select
              value={acknowledged}
              onChange={(e) => {
                setPage(0);
                setAcknowledged(e.target.value as "" | "true" | "false");
              }}
              className="h-10 rounded-md border border-[#dbe3ef] bg-white px-3 text-sm font-semibold text-ink-600 outline-none focus:border-[#1167ee]"
            >
              <option value="">All Status</option>
              <option value="false">Unacknowledged</option>
              <option value="true">Acknowledged</option>
            </select>
            <button className="h-10 rounded-md border border-[#dbe3ef] px-3 text-sm font-black text-ink-600">Export</button>
          </div>
        </div>
      </section>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}

      {data && (
        data.content.length === 0 ? (
          <EmptyBlock message="No AI events match these filters." />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
            <section className="rounded-lg border border-[#edf1f7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
              <div className="flex items-center justify-between border-b border-[#edf1f7] px-4 py-3">
                <h2 className="text-[13px] font-black text-[#111827]">Real-Time AI Event Feed</h2>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-500">
                  <i className="h-2 w-2 rounded-full bg-red-500" />
                  Live
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#edf1f7] bg-[#f8fafc] text-left text-[11px] text-ink-400">
                      <th className="px-4 py-3 font-black">Time</th>
                      <th className="px-4 py-3 font-black">Event Type</th>
                      <th className="px-4 py-3 font-black">Camera</th>
                      <th className="px-4 py-3 font-black">Location</th>
                      <th className="px-4 py-3 font-black">Confidence</th>
                      <th className="px-4 py-3 font-black">Snapshot</th>
                      <th className="px-4 py-3 text-right font-black">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f3f8]">
                    {data.content.map((event, index) => (
                      <tr
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`cursor-pointer hover:bg-[#f8fbff] ${selectedEvent?.id === event.id ? "bg-[#f4f8ff]" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-black text-[#111827]">{formatTime(event.detectedAt)}</p>
                          <p className="text-[10px] font-semibold text-ink-400">{shortDate(event.detectedAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${severityClass(event.severity)}`}>
                              <IncidentIcon className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-xs font-black text-[#111827]">{eventLabel(event.eventType)}</p>
                              <p className="text-[10px] font-semibold text-red-500">{event.description ?? "Detected by AI"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-ink-600">{event.cameraName}</td>
                        <td className="px-4 py-3 text-xs font-bold text-ink-500">{event.cameraName.split("-")[0]?.trim() || "Main Entrance"}</td>
                        <td className="px-4 py-3 text-xs font-black" style={{ color: confidenceFor(index) > 85 ? "#16a34a" : "#f59e0b" }}>
                          {confidenceFor(index)}%
                        </td>
                        <td className="px-4 py-3">
                          <Snapshot event={event} index={index} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button className="h-8 w-8 rounded-md border border-[#edf1f7] text-ink-400 hover:text-[#1167ee]">⊙</button>
                            <button className="h-8 w-8 rounded-md border border-[#edf1f7] text-ink-400 hover:text-[#1167ee]">▣</button>
                            {!event.acknowledged && (
                              <Button variant="secondary" onClick={(clickEvent) => {
                                clickEvent.stopPropagation();
                                handleAcknowledge(event.id);
                              }}>
                                Ack
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#edf1f7] px-4 py-3 text-sm text-ink-500">
                <span>
                  Showing {data.page * data.size + 1} to {Math.min((data.page + 1) * data.size, data.totalElements)} of {data.totalElements} events
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button variant="ghost" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </section>

            <aside className="rounded-lg border border-[#edf1f7] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
              <div className="border-b border-[#edf1f7] px-4 py-3">
                <h2 className="text-[13px] font-black text-[#111827]">Event Details</h2>
              </div>
              <div className="space-y-4 p-4">
                <Snapshot event={selectedEvent ?? undefined} large />

                <div className="flex items-center gap-3">
                  <Snapshot event={selectedEvent ?? undefined} index={1} />
                  <div>
                    <p className="text-[11px] font-bold text-ink-400">Matched With</p>
                    <p className="text-sm font-black text-[#111827]">John Doe</p>
                    <p className="text-xs font-bold text-emerald-600">92% match confidence</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    ["Event Time", selectedEvent ? `${shortDate(selectedEvent.detectedAt)} ${formatTime(selectedEvent.detectedAt)}` : "-"],
                    ["Camera", selectedEvent?.cameraName ?? "-"],
                    ["Location", selectedEvent?.cameraName.split("-")[0]?.trim() ?? "Main Entrance"],
                    ["Event Type", selectedEvent ? eventLabel(selectedEvent.eventType) : "-"],
                    ["Source", "AI Engine"],
                    ["Event ID", selectedEvent ? `EVT${String(selectedEvent.id).padStart(8, "0")}` : "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[100px_1fr] gap-2">
                      <span className="font-bold text-ink-400">{label}</span>
                      <span className="font-bold text-[#111827]">{value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-black text-[#111827]">Quick Actions</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {["View Full", "Add Incident", "Download", "Share"].map((action) => (
                      <button key={action} className="rounded-lg border border-[#edf1f7] px-2 py-3 text-[10px] font-black text-[#1167ee] hover:bg-[#f4f8ff]">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-black text-[#111827]">Similar Matches</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {similarMatches.map((match) => (
                      <div key={match.name} className="text-center">
                        <div className={`mx-auto h-16 w-14 rounded-md bg-gradient-to-br ${match.color}`} />
                        <p className="mt-1 truncate text-[10px] font-black text-[#111827]">{match.name}</p>
                        <p className="text-[10px] font-bold text-emerald-600">{match.match}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )
      )}
    </div>
  );
}
