import { useState } from "react";
import { reportsApi } from "../api/reports";
import Badge from "../components/Badge";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateViews";
import StatCard from "../components/StatCard";
import { useFetch } from "../hooks/useFetch";
import type { PeriodReport } from "../types";

type ReportPeriod = "daily" | "weekly" | "monthly";

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  daily: "Daily Report",
  weekly: "Weekly Report",
  monthly: "Monthly Report",
};

function PeriodReportView({ report }: { report: PeriodReport }) {
  const byType = Object.entries(report.aiEventsByType);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total AI Events" value={report.totalAiEvents} accent />
        <StatCard label="Total Incidents" value={report.totalIncidents} />
      </div>
      <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 uppercase tracking-wide mb-3">
          AI Events by Type
        </h3>
        {byType.length === 0 ? (
          <EmptyBlock message="No AI events in this period." />
        ) : (
          <ul className="divide-y divide-ink-50 dark:divide-ink-800">
            {byType.map(([type, count]) => (
              <li key={type} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-700 dark:text-ink-200">{type.replaceAll("_", " ")}</span>
                <span className="font-semibold text-ink-800 dark:text-ink-100">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-ink-400">
        {new Date(report.from).toLocaleString()} &rarr; {new Date(report.to).toLocaleString()}
      </p>
    </div>
  );
}

function PeriodReportTab({ period }: { period: ReportPeriod }) {
  const { data, loading, error } = useFetch(() => reportsApi[period](), [period]);
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!data) return null;
  return <PeriodReportView report={data} />;
}

function DeviceReportTab() {
  const { data, loading, error } = useFetch(() => reportsApi.devices());
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!data) return null;
  if (data.length === 0) return <EmptyBlock message="No devices registered." />;

  return (
    <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-400 text-xs uppercase border-b border-ink-100 dark:border-ink-700">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Zone</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Recording</th>
            <th className="px-5 py-3 font-medium">Last Heartbeat</th>
          </tr>
        </thead>
        <tbody>
          {data.map((camera) => (
            <tr key={camera.id} className="border-b border-ink-50 dark:border-ink-800 last:border-0">
              <td className="px-5 py-3 font-medium text-ink-800 dark:text-ink-100">{camera.name}</td>
              <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{camera.zone ?? "-"}</td>
              <td className="px-5 py-3">
                <Badge value={camera.status} />
              </td>
              <td className="px-5 py-3">
                <Badge value={camera.recordingStatus} />
              </td>
              <td className="px-5 py-3 text-ink-500 dark:text-ink-400">
                {camera.lastHeartbeatAt ? new Date(camera.lastHeartbeatAt).toLocaleString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportPeriod | "devices">("daily");

  const tabs: Array<{ id: ReportPeriod | "devices"; label: string }> = [
    { id: "daily", label: PERIOD_LABELS.daily },
    { id: "weekly", label: PERIOD_LABELS.weekly },
    { id: "monthly", label: PERIOD_LABELS.monthly },
    { id: "devices", label: "Device Report" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-ink-100 dark:border-ink-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-ink-400 hover:text-ink-600 dark:hover:text-ink-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "devices" ? <DeviceReportTab /> : <PeriodReportTab period={tab} />}
    </div>
  );
}
