package com.prabhatech.videoanalytics.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    public static final String TOPIC_AI_EVENTS = "/topic/ai-events";
    public static final String TOPIC_INCIDENTS = "/topic/incidents";
    public static final String TOPIC_CAMERA_STATUS = "/topic/camera-status";

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(String topic, Object payload) {
        messagingTemplate.convertAndSend(topic, payload);
    }
}
