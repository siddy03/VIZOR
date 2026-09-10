'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { websocketService } from '@/services/websocketService';
import './discussion.css';

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const STATUS_LABEL = {
  open: 'Live',
  connecting: 'Connecting...',
};

export default function DiscussionPage() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('closed');
  const participants = 2;

  const messageListRef = useRef(null);

  useEffect(() => {
    websocketService.connect();
    const offMessage = websocketService.onMessage((msg) => {
      setMessages((list) => [...list, msg]);
    });
    const offStatus = websocketService.onStatus((s) => setStatus(s));

    return () => {
      offMessage();
      offStatus();
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (websocketService.send(draft)) {
      setDraft('');
    }
  };

  const onKeyUp = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <section className="panel-host" aria-label="Community discussion">
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
            <i className="pi pi-comments" style={{ fontSize: '3rem', color: '#dee2e6' }} aria-hidden="true"></i>
            <p>No discussions yet. Start a conversation!</p>
          </div>
        )}

        {messages.length > 0 && (
          <div className="message-list" ref={messageListRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message-bubble${m.sender === 'me' ? ' from-me' : ''}${m.sender === 'server' ? ' from-server' : ''}`}
              >
                <div className="message-meta">
                  <span className="message-sender">{m.sender === 'me' ? 'You' : 'Echo Server'}</span>
                  <span className="message-time">{formatTime(m.timestamp)}</span>
                </div>
                <div className="message-text">{m.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="message-input-section" role="form" aria-label="Send a message">
        <div className="message-input-group p-inputgroup">
          <label htmlFor="discussion-message-input" className="sr-only">Message</label>
          <InputText
            id="discussion-message-input"
            type="text"
            placeholder="Send a message"
            className="message-input"
            aria-label="Type a message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyUp={onKeyUp}
          />
          <Button
            icon="pi pi-send"
            className="send-button"
            rounded
            disabled={!draft.trim()}
            onClick={sendMessage}
            aria-label="Send message"
          />
        </div>
      </div>
    </section>
  );
}
