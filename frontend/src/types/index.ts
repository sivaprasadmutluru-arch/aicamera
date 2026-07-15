export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type Role = "SUPER_ADMIN" | "ADMIN" | "SECURITY_OPERATOR" | "VIEWER";

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export type CameraStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";
export type RecordingStatus = "RECORDING" | "NOT_RECORDING" | "ERROR";

export interface Camera {
  id: number;
  name: string;
  code: string;
  ipAddress: string | null;
  zone: string | null;
  dahuaDeviceId: string | null;
  dahuaChannelId: string | null;
  status: CameraStatus;
  recordingStatus: RecordingStatus;
  aiEnabled: boolean;
  lastHeartbeatAt: string | null;
}

export type AiEventType =
  | "FACE_DETECTION"
  | "FACE_RECOGNITION"
  | "HUMAN_DETECTION"
  | "VEHICLE_DETECTION"
  | "VEHICLE_RECOGNITION"
  | "ANPR"
  | "CROWD_DENSITY"
  | "INTRUSION_DETECTION"
  | "LINE_CROSSING"
  | "OBJECT_ABANDONMENT"
  | "OBJECT_REMOVED"
  | "MOTION_DETECTION"
  | "LOITERING_DETECTION"
  | "FIRE_DETECTION"
  | "SMOKE_DETECTION"
  | "PPE_DETECTION"
  | "HELMET_DETECTION"
  | "VEHICLE_COUNTING"
  | "PEOPLE_COUNTING"
  | "QUEUE_ANALYTICS"
  | "HEAT_MAP";

export type EventSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AiEvent {
  id: number;
  cameraId: number;
  cameraName: string;
  eventType: AiEventType;
  severity: EventSeverity;
  description: string | null;
  snapshotUrl: string | null;
  detectedAt: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
}

export type IncidentStatus = "OPEN" | "ASSIGNED" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Incident {
  id: number;
  title: string;
  description: string | null;
  cameraId: number | null;
  cameraName: string | null;
  relatedAiEventId: number | null;
  status: IncidentStatus;
  priority: IncidentPriority;
  assignedToName: string | null;
  createdByName: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  department: string | null;
  enabled: boolean;
  lastLoginAt: string | null;
  assignedCameraIds: number[];
}

export interface AuditLog {
  id: number;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  createdAt: string;
}

export interface ExecutiveDashboard {
  totalCameras: number;
  onlineCameras: number;
  offlineCameras: number;
  aiEventsToday: number;
  activeIncidents: number;
  alertsToday: number;
  totalUsers: number;
}

export interface OperationsDashboard {
  cameras: Camera[];
  recentEvents: AiEvent[];
}

export interface AnalyticsDashboard {
  aiEventsByType: Record<string, number>;
  incidentsByStatus: Record<string, number>;
  incidentsByPriority: Record<string, number>;
}

export interface PeriodReport {
  from: string;
  to: string;
  totalAiEvents: number;
  totalIncidents: number;
  aiEventsByType: Record<string, number>;
}
