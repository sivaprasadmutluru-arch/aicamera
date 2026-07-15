# Enterprise AI Video Analytics Dashboard — Frontend

React frontend for the [ai-video-analytics-backend](../ai-video-analytics-backend) API
(Project TP-2026-1830742). Themed in Dahua's red/black/white brand colors.

## Stack

- React 19 + TypeScript, Vite
- Tailwind CSS v4 (CSS-first theme, see `src/index.css`)
- React Router v6 for routing and role-gated pages
- `@stomp/stompjs` + `sockjs-client` for real-time AI event / incident push
- Recharts for the analytics dashboard

## Color scheme

Defined as CSS variables in `src/index.css` (`@theme` block), used as Tailwind utilities
`bg-brand-500`, `text-ink-700`, etc.:

- `brand-*` — Dahua red (`#d31f1a` primary), used for the logo mark, primary actions, alerts/critical badges.
- `ink-*` — near-black to light gray scale, used for the sidebar, text, and borders.

## Running locally

```bash
npm install
npm run dev
```

Configure the backend location via `.env`:

```
VITE_API_BASE_URL=http://localhost:8081/api
VITE_WS_URL=http://localhost:8081
```

The backend must be running (see the backend project's README) with CORS open to this
dev server's origin (already configured there via `allowedOriginPatterns=*`).

## Structure

| Path              | Purpose                                                              |
|-------------------|------------------------------------------------------------------------|
| `src/api/`        | One file per backend module, wrapping `fetch` + the `ApiResponse<T>`/`PageResponse<T>` envelope, JWT bearer header |
| `src/context/`    | `AuthContext` — login/logout, JWT + current user in `localStorage`    |
| `src/hooks/`      | `useFetch` (generic load/error/reload), `useRealtime` (STOMP context)  |
| `src/components/` | Shared shell (`Sidebar`, `Topbar`, `Layout`), `Modal`, `Badge`, `Button`, `StatCard` |
| `src/pages/`      | One page per backend module (see table below)                        |

## Pages ↔ backend modules

| Page                  | Route          | Backend endpoints                                  |
|-----------------------|----------------|-----------------------------------------------------|
| Login                 | `/login`       | `/api/auth/login`, `/api/auth/register`             |
| Executive Dashboard    | `/dashboard`   | `/api/dashboard/executive`                          |
| Live Monitoring        | `/operations`  | `/api/dashboard/operations`                         |
| Analytics              | `/analytics`   | `/api/dashboard/analytics`                          |
| Camera Management      | `/cameras`     | `/api/cameras`                                      |
| AI Events              | `/ai-events`   | `/api/ai-events`                                    |
| Incident Management    | `/incidents`   | `/api/incidents`                                    |
| Reports                | `/reports`     | `/api/reports/{daily,weekly,monthly,devices}`        |
| User Management (admin)| `/users`       | `/api/users`, `/api/auth/register`                  |
| Audit Logs (admin)     | `/audit-logs`  | `/api/audit-logs`                                   |

Real-time AI events/incidents arrive over STOMP (`/topic/ai-events`, `/topic/incidents`) and
surface as a live notification counter in the top bar.

## Roles

Camera/AI-event/incident/report pages are open to all authenticated roles (matching backend
`@PreAuthorize` rules); `/users` and `/audit-logs` are restricted to `SUPER_ADMIN`/`ADMIN` in
both the route guard (`ProtectedRoute`) and the sidebar.

## Known gaps

- No live video preview/playback — the backend doesn't expose a proxying endpoint for this yet.
- No automated tests.
- `sockjs-client` needs the `global: 'globalThis'` shim in `vite.config.ts` — a known
  requirement for Node-oriented CJS packages under Vite; already configured.
