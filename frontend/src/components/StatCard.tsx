import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export default function StatCard({
  label,
  value,
  icon,
  accent = false,
  to,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: boolean;
  /** If set, the card becomes clickable and navigates to this route. */
  to?: string;
}) {
  const navigate = useNavigate();
  const clickable = Boolean(to);

  return (
    <div
      onClick={clickable ? () => navigate(to!) : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") navigate(to!);
            }
          : undefined
      }
      className={`bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm p-5 flex items-center gap-4 ${
        clickable ? "cursor-pointer hover:border-primary-300 hover:shadow-md transition-all" : ""
      }`}
    >
      {icon && (
        <div
          className={`shrink-0 h-11 w-11 rounded-lg flex items-center justify-center ${
            accent ? "bg-primary-600 text-white" : "bg-ink-50 dark:bg-ink-700 text-ink-600 dark:text-ink-300"
          }`}
        >
          {icon}
        </div>
      )}
      <div>
        <p className="text-ink-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-ink-800 dark:text-ink-100 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
