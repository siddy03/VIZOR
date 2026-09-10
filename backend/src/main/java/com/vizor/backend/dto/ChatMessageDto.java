package com.vizor.backend.dto;

/**
 * Payload exchanged over Socket.IO for the Community -> Chat tab.
 *
 * Clients emit "chat:send" with { senderId, senderName, text }.
 * The server stamps an id and timestamp and broadcasts "chat:message" with
 * { id, senderId, senderName, text, timestamp } to every client.
 *
 * `senderId` is a per-tab UUID generated client-side, persisted in sessionStorage
 * so the same tab keeps the same id across refreshes but different tabs always
 * differ. This is what the UI uses to decide left/right bubble alignment.
 */
public class ChatMessageDto {

    private String id;
    private String senderId;
    private String senderName;
    private String text;
    private long timestamp;

    public ChatMessageDto() {}

    public ChatMessageDto(String id, String senderId, String senderName, String text, long timestamp) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.text = text;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}
