package com.vizor.backend.service;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.vizor.backend.dto.ChatMessageDto;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Socket.IO event handler powering the Community -> Chat tab.
 *
 * Events:
 *   - "chat:send"     (client -> server): { senderId, senderName, text }
 *   - "chat:history"  (server -> joining client): [ {id, senderId, senderName, text, timestamp}, ... ]
 *   - "chat:message"  (server -> all):  { id, senderId, senderName, text, timestamp }
 *   - "chat:participants" (server -> all): number of connected sockets
 *
 * History is kept in memory only (bounded to MAX_HISTORY messages). It survives
 * page refreshes as long as the backend process keeps running. A backend restart
 * resets the chat.
 */
@Component
public class ChatSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatSocketHandler.class);
    private static final int MAX_HISTORY = 200;

    private final SocketIOServer server;
    private final Deque<ChatMessageDto> history = new ConcurrentLinkedDeque<>();

    public ChatSocketHandler(SocketIOServer server) {
        this.server = server;
    }

    @PostConstruct
    public void register() {
        server.addListeners(this);
        log.info("ChatSocketHandler registered");
    }

    @OnConnect
    public void onConnect(SocketIOClient client) {
        log.info("Socket connected: {}. Total clients: {}",
                client.getSessionId(), server.getAllClients().size());

        // Send chat history to the joining client only (so a refresh restores the conversation).
        List<ChatMessageDto> snapshot = new ArrayList<>(history);
        client.sendEvent("chat:history", snapshot);

        broadcastParticipants();
    }

    @OnDisconnect
    public void onDisconnect(SocketIOClient client) {
        log.info("Socket disconnected: {}. Total clients: {}",
                client.getSessionId(), server.getAllClients().size());
        broadcastParticipants();
    }

    @OnEvent("chat:send")
    public void onChatSend(SocketIOClient client, ChatMessageDto payload) {
        if (payload == null || payload.getText() == null || payload.getText().isBlank()) {
            return;
        }

        String senderId = payload.getSenderId();
        if (senderId == null || senderId.isBlank()) {
            // Fall back to the socket session id if the client didn't supply one.
            senderId = client.getSessionId().toString();
        }

        String senderName = payload.getSenderName();
        if (senderName == null || senderName.isBlank()) {
            senderName = "Anonymous";
        }

        ChatMessageDto out = new ChatMessageDto(
                UUID.randomUUID().toString(),
                senderId,
                senderName,
                payload.getText().trim(),
                System.currentTimeMillis()
        );
        addToHistory(out);
        log.debug("Broadcasting chat message from {} ({}): {}", senderName, senderId, out.getText());
        server.getBroadcastOperations().sendEvent("chat:message", out);
    }

    private void addToHistory(ChatMessageDto msg) {
        history.addLast(msg);
        while (history.size() > MAX_HISTORY) {
            history.pollFirst();
        }
    }

    private void broadcastParticipants() {
        server.getBroadcastOperations().sendEvent("chat:participants", server.getAllClients().size());
    }
}
