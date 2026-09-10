'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { chatSocketService } from '@/services/chatSocketService';
import './chat.css';

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const STATUS_LABEL = {
  open: 'Live',
  connecting: 'Connecting...',
};

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function generateUsername() {
  const adjectives = ['Swift', 'Calm', 'Bright', 'Brave', 'Witty', 'Quiet', 'Lucky', 'Kind', 'Bold', 'Cool'];
  const animals = ['Otter', 'Falcon', 'Tiger', 'Panda', 'Wolf', 'Lynx', 'Heron', 'Koala', 'Fox', 'Whale'];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = animals[Math.floor(Math.random() * animals.length)];
  const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${a}${n}${suffix}`;
}

/**
 * Per-tab chat identity:
 *   - senderId is a UUID in sessionStorage (per-tab, persists across refreshes,
 *     unique across tabs).
 *   - senderName is a friendly random handle, also in sessionStorage.
 */
function resolveIdentity() {
  const idKey = 'vizor.community.chat.senderId';
  const nameKey = 'vizor.community.chat.senderName';
  try {
    let senderId = window.sessionStorage.getItem(idKey);
    if (!senderId) {
      senderId = uuid();
      window.sessionStorage.setItem(idKey, senderId);
    }
    let senderName = window.sessionStorage.getItem(nameKey);
    if (!senderName) {
      senderName = generateUsername();
      window.sessionStorage.setItem(nameKey, senderName);
    }
    return { senderId, senderName };
  } catch {
    return { senderId: uuid(), senderName: generateUsername() };
  }
}

export default function ChatPage() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('closed');
  const [participants, setParticipants] = useState(0);
  const [senderName, setSenderName] = useState('');

  const senderIdRef = useRef('');
  const chatMessageListRef = useRef(null);

  useEffect(() => {
    const identity = resolveIdentity();
    senderIdRef.current = identity.senderId;
    setSenderName(identity.senderName);

    chatSocketService.connect(identity.senderId, identity.senderName);

    const offHistory = chatSocketService.onHistory((history) => setMessages(history));
    const offMessage = chatSocketService.onMessage((msg) => {
      setMessages((list) => [...list, msg]);
    });
    const offStatus = chatSocketService.onStatus((s) => setStatus(s));
    const offParticipants = chatSocketService.onParticipants((p) => setParticipants(p));

    return () => {
      offHistory();
      offMessage();
      offStatus();
      offParticipants();
      chatSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (chatMessageListRef.current) {
      chatMessageListRef.current.scrollTop = chatMessageListRef.current.scrollHeight;
    }
  }, [messages]);

  const isMine = (msg) => msg.senderId === senderIdRef.current;

  const sendMessage = () => {
    if (chatSocketService.send(draft)) {
      setDraft('');
    }
  };

  const onKeyUp = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <section className="panel-host" aria-label="Community chat">
      <div className="panel-header">
        <span className="ws-status" data-status={status} aria-live="polite">
          <span className="ws-dot"></span>
          {STATUS_LABEL[status] ?? 'Offline'}
        </span>
        <div className="participants-badge" role="status" aria-label={`Participants: ${participants}`}>
          <i className="pi pi-users" aria-hidden="true"></i>
          <span>Participants ({participants})</span>
        </div>
      </div>

      <div className="tab-panel" role="tabpanel" tabIndex={0}>
        {messages.length === 0 && (
          <div className="empty-state" role="status">
            <i className="pi pi-comment" style={{ fontSize: '3rem', color: '#dee2e6' }} aria-hidden="true"></i>
            <p>No messages yet. Start chatting!</p>
            <p className="chat-username-hint">You are <strong>{senderName}</strong></p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="message-list" ref={chatMessageListRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message-bubble${isMine(m) ? ' from-me' : ' from-server'}`}
              >
                <div className="message-meta">
                  <span className="message-sender">{isMine(m) ? 'You' : m.senderName}</span>
                  <span className="message-time">{formatTime(m.timestamp)}</span>
                </div>
                <div className="message-text">{m.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="message-input-section" role="form" aria-label="Send a chat message">
        <div className="message-input-group p-inputgroup">
          <label htmlFor="chat-message-input" className="sr-only">Chat message</label>
          <InputText
            id="chat-message-input"
            type="text"
            placeholder={`Send a message as ${senderName}`}
            className="message-input"
            aria-label="Type a chat message"
            value={draft}
            disabled={status !== 'open'}
            onChange={(e) => setDraft(e.target.value)}
            onKeyUp={onKeyUp}
          />
          <Button
            icon="pi pi-send"
            className="send-button"
            rounded
            disabled={!draft.trim() || status !== 'open'}
            onClick={sendMessage}
            aria-label="Send chat message"
          />
        </div>
      </div>
    </section>
  );
}
