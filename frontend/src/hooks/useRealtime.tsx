import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { API_BASE_URL, getToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { AiEvent, Incident } from "../types";

export interface RealtimeNotification {
  id: string;
  kind: "AI_EVENT" | "INCIDENT";
  title: string;
  detail: string;
  receivedAt: number;
}

interface RealtimeContextValue {
  connected: boolean;
  notifications: RealtimeNotification[];
  clear: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  notifications: [],
  clear: () => {},
});

const WS_BASE_URL = import.meta.env.VITE_WS_URL ?? API_BASE_URL.replace(/\/api$/, "");

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      clientRef.current?.deactivate();
      setConnected(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`) as unknown as WebSocket,
      connectHeaders: { Authorization: `Bearer ${getToken() ?? ""}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/ai-events", (message) => {
          try {
            const event = JSON.parse(message.body) as AiEvent;
            pushNotification({
              id: `event-${event.id}-${Date.now()}`,
              kind: "AI_EVENT",
              title: `${event.eventType.replaceAll("_", " ")} - ${event.cameraName}`,
              detail: event.description ?? event.severity,
              receivedAt: Date.now(),
            });
          } catch {
            // ignore malformed payloads
          }
        });
        client.subscribe("/topic/incidents", (message) => {
          try {
            const incident = JSON.parse(message.body) as Incident;
            pushNotification({
              id: `incident-${incident.id}-${Date.now()}`,
              kind: "INCIDENT",
              title: incident.title,
              detail: `${incident.status} · ${incident.priority}`,
              receivedAt: Date.now(),
            });
          } catch {
            // ignore malformed payloads
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    function pushNotification(notification: RealtimeNotification) {
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
    }

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [isAuthenticated]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ connected, notifications, clear: () => setNotifications([]) }),
    [connected, notifications]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
