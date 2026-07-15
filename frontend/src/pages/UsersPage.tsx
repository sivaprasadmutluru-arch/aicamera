import { useState } from "react";
import type { FormEvent } from "react";
import { authApi, type RegisterRequest } from "../api/auth";
import { camerasApi } from "../api/cameras";
import { ApiError } from "../api/client";
import { usersApi, type UpdateUserRequest } from "../api/users";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateViews";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import type { Role, User } from "../types";

const ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "SECURITY_OPERATOR", "VIEWER"];

const EMPTY_REGISTER: RegisterRequest = {
  fullName: "",
  email: "",
  password: "",
  role: "VIEWER",
  department: "",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, loading, error, reload } = useFetch(() => usersApi.list());
  const { data: cameras } = useFetch(() => camerasApi.list());

  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterRequest>(EMPTY_REGISTER);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editing, setEditing] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});

  const [assigningCameras, setAssigningCameras] = useState<User | null>(null);
  const [selectedCameraIds, setSelectedCameraIds] = useState<number[]>([]);

  const [deleting, setDeleting] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setRegisterError(null);
    try {
      await authApi.register(registerForm);
      setShowRegister(false);
      setRegisterForm(EMPTY_REGISTER);
      reload();
    } catch (err) {
      setRegisterError(err instanceof ApiError ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(user: User) {
    setEditing(user);
    setEditForm({
      fullName: user.fullName,
      role: user.role,
      department: user.department ?? "",
      enabled: user.enabled,
    });
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await usersApi.update(editing.id, editForm);
    setEditing(null);
    reload();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await usersApi.remove(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete user");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  function openAssignCameras(user: User) {
    setAssigningCameras(user);
    setSelectedCameraIds(user.assignedCameraIds);
  }

  async function handleSaveCameras() {
    if (!assigningCameras) return;
    await usersApi.assignCameras(assigningCameras.id, selectedCameraIds);
    setAssigningCameras(null);
    reload();
  }

  function toggleCamera(id: number) {
    setSelectedCameraIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500 dark:text-ink-400">{users?.length ?? 0} user(s)</p>
        <Button onClick={() => setShowRegister(true)}>+ Add User</Button>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}

      {users && (
        users.length === 0 ? (
          <EmptyBlock message="No users found." />
        ) : (
          <div className="bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 text-xs uppercase border-b border-ink-100 dark:border-ink-700">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Cameras</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-ink-50 dark:border-ink-800 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink-800 dark:text-ink-100">{user.fullName}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge value={user.role} />
                    </td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{user.department ?? "-"}</td>
                    <td className="px-5 py-3 text-ink-500 dark:text-ink-400">
                      {user.assignedCameraIds.length === 0 ? "All" : user.assignedCameraIds.length}
                    </td>
                    <td className="px-5 py-3">
                      {user.enabled ? (
                        <span className="text-green-600 text-xs font-medium">Enabled</span>
                      ) : (
                        <span className="text-red-500 text-xs font-medium">Disabled</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openAssignCameras(user)}
                        className="text-ink-500 dark:text-ink-400 hover:text-primary-600 text-sm font-medium"
                      >
                        Cameras
                      </button>
                      <button
                        onClick={() => openEdit(user)}
                        className="text-ink-500 dark:text-ink-400 hover:text-primary-600 text-sm font-medium"
                      >
                        Edit
                      </button>
                      {currentUser?.role === "SUPER_ADMIN" && user.id !== currentUser.userId && (
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setDeleting(user);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {showRegister && (
        <Modal title="Add User" onClose={() => setShowRegister(false)}>
          <form onSubmit={handleRegister} className="space-y-4">
            {registerError && <ErrorBlock message={registerError} />}
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Full Name</label>
              <input
                required
                value={registerForm.fullName}
                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Email</label>
              <input
                required
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Role</label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as Role })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Department</label>
                <input
                  value={registerForm.department}
                  onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowRegister(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit ${editing.fullName}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Full Name</label>
              <input
                value={editForm.fullName ?? ""}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Role</label>
                <select
                  value={editForm.role ?? editing.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-300 mb-1">Department</label>
                <input
                  value={editForm.department ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full rounded-md border border-ink-200 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 px-3 py-2"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
              <input
                type="checkbox"
                checked={editForm.enabled ?? editing.enabled}
                onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                className="rounded border-ink-300 dark:border-ink-600 text-primary-500 focus:ring-primary-400"
              />
              Account enabled
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}

      {assigningCameras && (
        <Modal title={`Camera Access: ${assigningCameras.fullName}`} onClose={() => setAssigningCameras(null)}>
          <p className="text-xs text-ink-400 mb-3">
            Leave all unchecked to grant access to every camera (default for most roles).
          </p>
          <div className="max-h-72 overflow-y-auto space-y-1 mb-4">
            {(cameras ?? []).map((camera) => (
              <label
                key={camera.id}
                className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200 px-2 py-1.5 rounded hover:bg-ink-50 dark:hover:bg-ink-900"
              >
                <input
                  type="checkbox"
                  checked={selectedCameraIds.includes(camera.id)}
                  onChange={() => toggleCamera(camera.id)}
                  className="rounded border-ink-300 dark:border-ink-600 text-primary-500 focus:ring-primary-400"
                />
                {camera.name}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAssigningCameras(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCameras}>Save</Button>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete User" onClose={() => setDeleting(null)}>
          {deleteError && <ErrorBlock message={deleteError} />}
          <p className="text-sm text-ink-600 dark:text-ink-300 mb-6 mt-2">
            Are you sure you want to delete <span className="font-medium text-ink-800 dark:text-ink-100">{deleting.fullName}</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleteSubmitting}>
              {deleteSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
