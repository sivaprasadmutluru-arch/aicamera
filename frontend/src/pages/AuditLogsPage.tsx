import { useState } from "react";
import { auditLogsApi } from "../api/auditLogs";
import Button from "../components/Button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateViews";
import { useFetch } from "../hooks/useFetch";

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const { data, loading, error } = useFetch(() => auditLogsApi.list(page, 50), [page]);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!data) return null;
  if (data.content.length === 0) return <EmptyBlock message="No audit log entries yet." />;

  return (
    <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-400 text-xs uppercase border-b border-ink-100 dark:border-ink-700">
            <th className="px-5 py-3 font-medium">Timestamp</th>
            <th className="px-5 py-3 font-medium">User</th>
            <th className="px-5 py-3 font-medium">Action</th>
            <th className="px-5 py-3 font-medium">Entity</th>
            <th className="px-5 py-3 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {data.content.map((log) => (
            <tr key={log.id} className="border-b border-ink-50 dark:border-ink-800 last:border-0">
              <td className="px-5 py-3 text-ink-500 dark:text-ink-400 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="px-5 py-3 text-ink-700 dark:text-ink-200">{log.userEmail ?? "-"}</td>
              <td className="px-5 py-3 font-medium text-ink-800 dark:text-ink-100">{log.action}</td>
              <td className="px-5 py-3 text-ink-500 dark:text-ink-400">
                {log.entityType ? `${log.entityType} #${log.entityId}` : "-"}
              </td>
              <td className="px-5 py-3 text-ink-500 dark:text-ink-400 max-w-md truncate">{log.details ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-ink-100 dark:border-ink-700 text-sm text-ink-500 dark:text-ink-400">
        <span>
          Page {data.page + 1} of {Math.max(data.totalPages, 1)} &middot; {data.totalElements} total
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
    </div>
  );
}
