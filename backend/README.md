# Enterprise AI Video Analytics Dashboard — Backend

Backend service for the **Enterprise AI Video Analytics Dashboard integrated with Dahua VMS**
(Project TP-2026-1830742, proposed by Prabha Technologies for Middle East L.L.C FZE).

This is a single Spring Boot service organized into feature modules, built so it can later be
split into independent microservices (gateway + per-module services) if scale requires it.

## Stack

- Java 21, Spring Boot 4
- Spring Web MVC, Spring Data JPA, Spring Security (JWT), Spring WebSocket (STOMP)
- PostgreSQL
- springdoc-openapi (Swagger UI at `/swagger-ui.html`)
- Docker / docker-compose

## Modules

| Package        | Covers (proposal section)                                              |
|----------------|--------------------------------------------------------------------------|
| `auth`         | Login / register / JWT issuance                                          |
| `user`         | User accounts, roles (RBAC), department & camera-level access            |
| `camera`       | Camera Management: registration, status, recording status, health        |
| `aievent`      | AI Analytics: ingestion, filtering, acknowledgement of AI/alarm events    |
| `incident`     | Incident Management: creation, assignment, investigation, resolution     |
| `dashboard`    | Executive / Operations / Analytics dashboard aggregation endpoints       |
| `report`       | Daily / weekly / monthly / AI event / device reports                     |
| `notification` | Real-time push (WebSocket/STOMP) of new AI events & incidents            |
| `dahua`        | Dahua VMS integration: DSS platform client + direct-device client        |
| `audit`        | Audit log of security-relevant actions (login, register, etc.)           |
| `security`     | JWT filter, user details, security config                                |
| `common`       | Base entity, API response envelope, exception handling                   |

## Running locally

```bash
docker compose up -d postgres
./mvnw spring-boot:run
```

The API listens on `http://localhost:8081`. Swagger UI: `http://localhost:8081/swagger-ui.html`.

Or run everything (app + Postgres) via Docker:

```bash
docker compose up --build
```

## Configuration

All configuration lives in [application.properties](src/main/resources/application.properties)
with environment variable overrides (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`,
`DAHUA_BASE_URL`, `DAHUA_USERNAME`, `DAHUA_PASSWORD`, `DAHUA_ENABLED`, `DAHUA_CALLBACK_BASE_URL`,
`UPLOAD_DIR`).

## Dahua VMS integration

Implemented against two Dahua API references: `Dahua_HTTP_API_for_DSS_V8.7` (the enterprise VMS
platform proper) and `DAHUA_HTTP_API_V4.04` (the classic single camera/NVR CGI API). Both are real,
protocol-correct clients — not stubs — but neither has been run against live Dahua hardware; they
were verified against a mock server that reproduces the documented request/response shapes
(including the MD5 login signature, checked against the worked example in section 5.1.1 of the DSS
doc). Point `app.dahua.base-url` at a real DSS box and set `app.dahua.enabled=true` to go live.

### DSS platform path (primary — `com.prabhatech.videoanalytics.dahua.dss`)

Matches "Dahua Video Management System (VMS)" in the proposal. All pieces run as scheduled
background jobs, gated by `app.dahua.enabled`:

- [`DssSessionManager`](src/main/java/com/prabhatech/videoanalytics/dahua/dss/DssSessionManager.java) + [`DssSessionScheduler`](src/main/java/com/prabhatech/videoanalytics/dahua/dss/DssSessionScheduler.java) — real login (section 3.1): two-step challenge/response, 5-round MD5 signature, heartbeat keep-alive every ~20s, token refresh every ~2/3 of `tokenRate`, all self-healing (a failed call just triggers a re-login on the next tick).
- [`DssDeviceSyncService`](src/main/java/com/prabhatech/videoanalytics/dahua/dss/DssDeviceSyncService.java) — every 5 minutes, pages through `GET /brms/api/v1.1/device/page` and batches `POST /brms/api/v1.1/device/status/fetch/batch/list` (section 3.3) to upsert one `Camera` row per DSS channel (`dahuaChannelId` format `deviceCode$unit$0$index`) with live online/offline status.
- [`DssAlarmSubscriptionService`](src/main/java/com/prabhatech/videoanalytics/dahua/dss/DssAlarmSubscriptionService.java) — registers `app.dahua.callback-base-url + /api/integrations/dahua/events` as the platform's alarm push target (section 3.6.1).
- [`DahuaWebhookController`](src/main/java/com/prabhatech/videoanalytics/dahua/controller/DahuaWebhookController.java) / [`DahuaIntegrationService.handleDssAlarm`](src/main/java/com/prabhatech/videoanalytics/dahua/DahuaIntegrationService.java) — receives the real DSS callback shape (`callbackType`, `alarmCode`, `sourceCode`, `alarmType`/`alarmTypeName`, `alarmGrade`, `alarmStatus`, `alarmTime`, base64 `alarmPictures`), decodes+saves the first snapshot under `${app.upload.dir}/dahua-events/`, and feeds it into the normal AI event pipeline (auto-creating an incident for HIGH/CRITICAL severity, same as manually-posted events).
- [`DahuaEventTypeMapper.mapDssAlarmType`](src/main/java/com/prabhatech/videoanalytics/dahua/DahuaEventTypeMapper.java) — the DSS alarm type dictionary (section 6.1.7) reuses numeric sub-category codes across unrelated categories (e.g. "7" means different things in different categories), so this matches on `alarmTypeName` text first and only trusts a handful of numeric ranges documented as globally unique (Open AI Event 16000000-16999999, Smart Object Abandoned/Missing 900002-900005).
- The AES/RSA session-key exchange offered by DSS login (used to decrypt the ActiveMQ password for the platform's MQ push channel) is intentionally skipped — this integration uses the simpler HTTP callback subscription instead of consuming the MQ, and the docs confirm the key-exchange fields are optional/backward-compatible when left empty.

### Direct-device path (secondary — `com.prabhatech.videoanalytics.dahua.direct`)

For a standalone camera/NVR not (yet) registered on DSS. Credentials are supplied per-call, not
persisted (Camera has no password field):

- [`DigestAuthUtil`](src/main/java/com/prabhatech/videoanalytics/dahua/direct/DigestAuthUtil.java) + [`DahuaDirectDeviceClient`](src/main/java/com/prabhatech/videoanalytics/dahua/direct/DahuaDirectDeviceClient.java) — RFC 2617 HTTP Digest auth handshake against the device's classic CGI endpoints.
- [`MultipartEventStreamParser`](src/main/java/com/prabhatech/videoanalytics/dahua/direct/MultipartEventStreamParser.java) + [`DahuaDirectDeviceListenerManager`](src/main/java/com/prabhatech/videoanalytics/dahua/direct/DahuaDirectDeviceListenerManager.java) — opens a long-lived `GET /cgi-bin/eventManager.cgi?action=attach&codes=All` connection per camera (section 4.9.17) and parses the `multipart/x-mixed-replace` `Code=...;action=...;data={...}` event stream on a background thread, with automatic reconnect.
- [`DahuaDirectDeviceController`](src/main/java/com/prabhatech/videoanalytics/dahua/direct/DahuaDirectDeviceController.java) (admin-only) — `POST /api/integrations/dahua/direct/{cameraId}/listen` / `DELETE .../listen` to start/stop the event listener, `POST /api/integrations/dahua/direct/{cameraId}/snapshot` for an on-demand `snapshot.cgi` capture.
- [`DahuaEventTypeMapper.mapDirectDeviceCode`](src/main/java/com/prabhatech/videoanalytics/dahua/DahuaEventTypeMapper.java) — maps the fixed English event codes (`CrossLineDetection`, `FireWarning`, etc.) from this API onto `AiEventType`.

Cameras must be registered (`POST /api/cameras`, or synced automatically via DSS) with their
`dahuaChannelId` populated so inbound events can be matched to a camera record.

## Roles (RBAC)

`SUPER_ADMIN`, `ADMIN`, `SECURITY_OPERATOR`, `VIEWER`. Camera-level access can additionally be
restricted per user via `POST /api/users/{id}/cameras`.

## Live video & recorded playback

- `GET /api/cameras/{id}/live-stream` — HTTP-FLV live view via DSS (section 3.4.4), played in the
  frontend with flv.js. DSS-linked cameras only (needs `dahuaChannelId`).
- `GET /api/cameras/{id}/recordings` + `GET /api/cameras/{id}/recordings/playback-url` — recording
  search (section 3.5.1) and HLS playback URL (section 3.5.4), played with hls.js/native HLS.
- Direct-device cameras (no DSS) have no equivalent — Dahua's classic API only exposes RTSP for
  live/recorded video, which isn't browser-playable without a transcoding gateway (not built).

## Frontend

A separate React + TypeScript + Vite project (`../ai-video-analytics-frontend`) covers every
module above: dashboards, camera CRUD + live/recordings, AI events, incidents, reports, users,
audit logs, dark/light mode, and real-time STOMP notifications.

## Not yet built

- LDAP / Active Directory and OAuth2 login (JWT/local auth only for now)
- Horizontal scaling / load balancing / DB replication infra (deployment concern, not app code)
- Automated tests
- DSS ActiveMQ/MQTT event consumption (the HTTP callback subscription is used instead — simpler, and sufficient for real-time alerting)
- Direct-device listener routes all channels of a multi-channel NVR to a single Camera record; per-channel routing for NVRs (as opposed to standalone IP cameras) isn't implemented
- Video Intercom, Access Control, Parking Management, ANPR-specific traffic dashboards (proposal mentions these as VMS-adjacent modules; out of scope for this backend, which focuses on camera/AI-event/incident management)
