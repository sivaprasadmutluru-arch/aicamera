import { useState } from "react";
import type { FormEvent } from "react";
import { camerasApi, type CameraRequest } from "../api/cameras";
import { ApiError } from "../api/client";
import Badge from "../components/Badge";
import Button from "../components/Button";
import LiveViewModal from "../components/LiveViewModal";
import Modal from "../components/Modal";
import RecordingsModal from "../components/RecordingsModal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateViews";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import type { Camera } from "../types";

const EMPTY_FORM: CameraRequest = {
  name: "",
  code: "",
  ipAddress: "",
  zone: "",
  dahuaDeviceId: "",
  dahuaChannelId: "",
  aiEnabled: true,
};

export default function CamerasPage() {
  const { user } = useAuth();
  const canManage = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const { data: cameras, loading, error, reload } = useFetch(() => camerasApi.list());

  const [editing, setEditing] = useState<Camera | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [playing, setPlaying] = useState<{ id: number; name: string } | null>(null);
  const [viewingRecordings, setViewingRecordings] = useState<{ id: number; name: string } | null>(null);
  const [form, setForm] = useState<CameraRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Camera | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(camera: Camera) {
    setEditing(camera);
    setForm({
      name: camera.name,
      code: camera.code,
      ipAddress: camera.ipAddress ?? "",
      zone: camera.zone ?? "",
      dahuaDeviceId: camera.dahuaDeviceId ?? "",
      dahuaChannelId: camera.dahuaChannelId ?? "",
      aiEnabled: camera.aiEnabled,
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await camerasApi.update(editing.id, form);
      } else {
        await camerasApi.create(form);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save camera");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await camerasApi.remove(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to remove camera");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500 dark:text-ink-400">{cameras?.length ?? 0} camera(s) registered</p>
        {canManage && <Button onClick={openCreate}>+ Register Camera</Button>}
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}

      {cameras && (
        cameras.length === 0 ? (
          <EmptyBlock message="No cameras registered yet." />
        ) : (
          <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 text-xs uppercase border-b border-ink-100 dark:border-ink-700">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Zone</th>
                  <th className="px-5 py-3 font-medium">IP Address</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Recording</th>
                  <th className="px-5 py-3 font-medium">AI</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cameras.map((camera) => (
                  <tr key={camera.id} className="border-b border-ink-50 dark:border-ink-800 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink-800 dark:text-ink-100">{camera.name}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400 font-mono text-xs">{camera.code}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{camera.zone ?? "-"}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{camera.ipAddress ?? "-"}</td>
                    <td className="px-5 py-3">
                      <Badge value={camera.status} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge value={camera.recordingStatus} />
                    </td>
                    <td className="px-5 py-3">{camera.aiEnabled ? "Enabled" : "Disabled"}</td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setPlaying({ id: camera.id, name: camera.name })}
                        className="text-ink-500 dark:text-ink-400 hover:text-primary-600 text-sm font-medium"
                      >
                        Live
                      </button>
                      <button
                        onClick={() => setViewingRecordings({ id: camera.id, name: camera.name })}
                        className="text-ink-500 dark:text-ink-400 hover:text-primary-600 text-sm font-medium"
                      >
                        Recordings
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={() => openEdit(camera)}
                            className="text-ink-500 dark:text-ink-400 hover:text-primary-600 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError(null);
                              setDeleting(camera);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {showForm && (
        <Modal title={editing ? "Edit Camera" : "Register Camera"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <ErrorBlock message={formError} />}

            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Code</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">IP Address</label>
                <input
                  value={form.ipAddress}
                  onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Zone</label>
                <input
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">
                  Dahua Device ID
                </label>
                <input
                  value={form.dahuaDeviceId}
                  onChange={(e) => setForm({ ...form, dahuaDeviceId: e.target.value })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">
                  Dahua Channel ID
                </label>
                <input
                  value={form.dahuaChannelId}
                  onChange={(e) => setForm({ ...form, dahuaChannelId: e.target.value })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
              <input
                type="checkbox"
                checked={form.aiEnabled}
                onChange={(e) => setForm({ ...form, aiEnabled: e.target.checked })}
                className="rounded border-ink-300 dark:border-ink-600 text-primary-500 focus:ring-primary-400"
              />
              AI analytics enabled
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {playing && (
        <LiveViewModal cameraId={playing.id} cameraName={playing.name} onClose={() => setPlaying(null)} />
      )}

      {viewingRecordings && (
        <RecordingsModal
          cameraId={viewingRecordings.id}
          cameraName={viewingRecordings.name}
          onClose={() => setViewingRecordings(null)}
        />
      )}

      {deleting && (
        <Modal title="Remove Camera" onClose={() => setDeleting(null)}>
          {deleteError && <ErrorBlock message={deleteError} />}
          <p className="text-sm text-ink-600 dark:text-ink-300 mb-6 mt-2">
            Are you sure you want to remove <span className="font-medium text-ink-800 dark:text-ink-100">{deleting.name}</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleteSubmitting}>
              {deleteSubmitting ? "Removing..." : "Remove"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
