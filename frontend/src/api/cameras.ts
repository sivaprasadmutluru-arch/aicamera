import { api } from "./client";
import type { Camera, CameraStatus, RecordingStatus } from "../types";

export interface CameraRequest {
  name: string;
  code: string;
  ipAddress?: string;
  zone?: string;
  dahuaDeviceId?: string;
  dahuaChannelId?: string;
  aiEnabled: boolean;
}

export interface UpdateCameraStatusRequest {
  status?: CameraStatus;
  recordingStatus?: RecordingStatus;
}

export interface Recording {
  channelId: string;
  recordSource: string;
  recordType: string;
  streamId: string;
  startTime: number;
  endTime: number;
  recordName: string;
}

export const camerasApi = {
  list: () => api.get<Camera[]>("/cameras"),
  get: (id: number) => api.get<Camera>(`/cameras/${id}`),
  create: (payload: CameraRequest) => api.post<Camera>("/cameras", payload),
  update: (id: number, payload: CameraRequest) => api.put<Camera>(`/cameras/${id}`, payload),
  updateStatus: (id: number, payload: UpdateCameraStatusRequest) =>
    api.patch<Camera>(`/cameras/${id}/status`, payload),
  remove: (id: number) => api.delete<void>(`/cameras/${id}`),
  liveStreamUrl: (id: number, streamType = 1) =>
    api.get<{ streamUrl: string }>(`/cameras/${id}/live-stream?streamType=${streamType}`),
  searchRecordings: (id: number, fromEpochSeconds: number, toEpochSeconds: number) =>
    api.get<Recording[]>(`/cameras/${id}/recordings?from=${fromEpochSeconds}&to=${toEpochSeconds}`),
  recordingPlaybackUrl: (id: number, recording: Recording) => {
    const params = new URLSearchParams({
      recordSource: recording.recordSource,
      recordType: recording.recordType,
      streamId: recording.streamId,
      startTime: String(recording.startTime),
      endTime: String(recording.endTime),
    });
    return api.get<{ streamUrl: string }>(`/cameras/${id}/recordings/playback-url?${params.toString()}`);
  },
};
