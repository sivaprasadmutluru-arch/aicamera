import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardApi } from "../api/dashboard";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateViews";
import { useTheme } from "../context/ThemeContext";
import { useFetch } from "../hooks/useFetch";

const CHART_SHADES_LIGHT = ["#2563eb", "#00aeef", "#60a5fa", "#1e40af", "#93c5fd", "#1e3a8a"];
const CHART_SHADES_DARK = ["#60a5fa", "#33c1f2", "#93c5fd", "#3b82f6", "#00aeef", "#bfdbfe"];

function toChartData(record: Record<string, number>) {
  return Object.entries(record).map(([name, value]) => ({
    name: name.replaceAll("_", " "),
    value,
  }));
}

export default function AnalyticsDashboardPage() {
  const { data, loading, error } = useFetch(() => dashboardApi.analytics());
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!data) return null;

  const eventsByType = toChartData(data.aiEventsByType);
  const incidentsByStatus = toChartData(data.incidentsByStatus);
  const incidentsByPriority = toChartData(data.incidentsByPriority);

  const gridStroke = isDark ? "#2f3a4d" : "#e5e5e7";
  const tickFill = isDark ? "#9aa7b8" : "#47536a";
  const barShade = isDark ? "#60a5fa" : "#2563eb";
  const priorityBarShade = isDark ? "#9aa7b8" : "#111c2a";
  const chartShades = isDark ? CHART_SHADES_DARK : CHART_SHADES_LIGHT;
  const tooltipStyle = isDark
    ? { backgroundColor: "#111c2a", border: "1px solid #1c2635", color: "#e7ebf0" }
    : { backgroundColor: "#fff", border: "1px solid #e7ebf0", color: "#111c2a" };
  const legendStyle = { color: tickFill };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-ink-700 dark:text-ink-200 uppercase tracking-wide mb-4">
          AI Detection Trends (This Month)
        </h2>
        {eventsByType.length === 0 ? (
          <EmptyBlock message="No AI events recorded this month." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventsByType}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: tickFill }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={70}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickFill }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={barShade} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-ink-700 dark:text-ink-200 uppercase tracking-wide mb-4">
          Incidents by Status
        </h2>
        {incidentsByStatus.length === 0 ? (
          <EmptyBlock message="No incidents recorded." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={incidentsByStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                {incidentsByStatus.map((_, index) => (
                  <Cell key={index} fill={chartShades[index % chartShades.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={legendStyle} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm p-6 lg:col-span-2">
        <h2 className="text-sm font-semibold text-ink-700 dark:text-ink-200 uppercase tracking-wide mb-4">
          Incidents by Priority
        </h2>
        {incidentsByPriority.length === 0 ? (
          <EmptyBlock message="No incidents recorded." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={incidentsByPriority} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: tickFill }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: tickFill }} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={priorityBarShade} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
