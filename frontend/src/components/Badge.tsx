const COLOR_MAP: Record<string, string> = {
  // camera / recording status
  ONLINE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  RECORDING: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  OFFLINE: "bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-300",
  NOT_RECORDING: "bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-300",
  MAINTENANCE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",

  // severity / priority
  LOW: "bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",

  // incident status
  OPEN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ASSIGNED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  INVESTIGATING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  RESOLVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CLOSED: "bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-300",

  // roles
  SUPER_ADMIN: "bg-primary-600 text-white",
  ADMIN: "bg-ink-700 text-white",
  SECURITY_OPERATOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEWER: "bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300",
};

export default function Badge({ value }: { value: string }) {
  const classes = COLOR_MAP[value] ?? "bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
