import { useState } from "react";
import type { FormEvent } from "react";
import { camerasApi } from "../api/cameras";
import { ApiError } from "../api/client";
import { incidentsApi, type IncidentRequest } from "../api/incidents";
import { usersApi } from "../api/users";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateViews";
import { INCIDENT_PRIORITIES, INCIDENT_STATUSES } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import type { Incident, IncidentStatus } from "../types";

const EMPTY_FORM: IncidentRequest = { title: "", description: "", priority: "MEDIUM" };

export default function IncidentsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "">("");
  const [page, setPage] = useState(0);
  const { data, loading, error, reload } = useFetch(
    () => incidentsApi.list(statusFilter || undefined, page, 20),
    [statusFilter, page]
  );
  const { data: cameras } = useFetch(() => camerasApi.list());
  const { data: users } = useFetch(() => (canManage ? usersApi.list() : Promise.resolve([])), [canManage]);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<IncidentRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [assigning, setAssigning] = useState<Incident | null>(null);
  const [resolving, setResolving] = useState<Incident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await incidentsApi.create(form);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create incident");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(incident: Incident, status: IncidentStatus) {
    await incidentsApi.updateStatus(incident.id, status);
    reload();
  }

  async function handleAssign(userId: number) {
    if (!assigning) return;
    await incidentsApi.assign(assigning.id, userId);
    setAssigning(null);
    reload();
  }

  async function handleResolve(e: FormEvent) {
    e.preventDefault();
    if (!resolving) return;
    await incidentsApi.resolve(resolving.id, resolutionNotes);
    setResolving(null);
    setResolutionNotes("");
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value as IncidentStatus | "");
          }}
          className="rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 text-sm text-ink-700 dark:text-ink-200"
        >
          <option value="">All Statuses</option>
          {INCIDENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button onClick={() => setShowCreate(true)}>+ Create Incident</Button>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}

      {data && (
        data.content.length === 0 ? (
          <EmptyBlock message="No incidents match this filter." />
        ) : (
          <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 text-xs uppercase border-b border-ink-100 dark:border-ink-700">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Camera</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Assigned To</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((incident) => (
                  <tr key={incident.id} className="border-b border-ink-50 dark:border-ink-800 last:border-0 align-top">
                    <td className="px-5 py-3 font-medium text-ink-800 dark:text-ink-100">{incident.title}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{incident.cameraName ?? "-"}</td>
                    <td className="px-5 py-3">
                      <Badge value={incident.priority} />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={incident.status}
                        onChange={(e) => handleStatusChange(incident, e.target.value as IncidentStatus)}
                        className="rounded border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-2 py-1 text-xs"
                      >
                        {INCIDENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{incident.assignedToName ?? "Unassigned"}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      {canManage && (
                        <button
                          onClick={() => setAssigning(incident)}
                          className="text-ink-500 dark:text-ink-400 hover:text-primary-600 text-sm font-medium"
                        >
                          Assign
                        </button>
                      )}
                      {incident.status !== "RESOLVED" && incident.status !== "CLOSED" && (
                        <button
                          onClick={() => setResolving(incident)}
                          className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-ink-100 dark:border-ink-700 text-sm text-ink-500 dark:text-ink-400">
              <span>
                Page {data.page + 1} of {Math.max(data.totalPages, 1)} &middot; {data.totalElements}{" "}
                total
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
        )
      )}

      {showCreate && (
        <Modal title="Create Incident" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <ErrorBlock message={formError} />}
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Camera</label>
                <select
                  value={form.cameraId ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, cameraId: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
                >
                  <option value="">None</option>
                  {cameras?.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as IncidentRequest["priority"] })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
                >
                  {INCIDENT_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {assigning && (
        <Modal title={`Assign: ${assigning.title}`} onClose={() => setAssigning(null)}>
          <div className="space-y-2">
            {(users ?? []).length === 0 && <EmptyBlock message="No users available." />}
            {(users ?? []).map((u) => (
              <button
                key={u.id}
                onClick={() => handleAssign(u.id)}
                className="w-full flex items-center justify-between rounded-md border border-ink-100 dark:border-ink-700 px-4 py-2.5 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-left"
              >
                <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{u.fullName}</span>
                <Badge value={u.role} />
              </button>
            ))}
          </div>
        </Modal>
      )}

      {resolving && (
        <Modal title={`Resolve: ${resolving.title}`} onClose={() => setResolving(null)}>
          <form onSubmit={handleResolve} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Resolution Notes</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Describe how this incident was resolved..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setResolving(null)}>
                Cancel
              </Button>
              <Button type="submit">Mark Resolved</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
