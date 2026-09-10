// Socket.IO client for the Community -> Chat tab.
//
// Ported from Angular `ChatSocketService` (providedIn: 'root'), so this module
// exports a single shared instance. Each browser tab passes its own `senderId`
// + `senderName` on connect and again with every outgoing message; the server
// echoes both back so each client decides locally whether a message is "mine"
// by comparing senderId.
//
// RxJS subjects are replaced with listener Sets:
//   - onStatus / onParticipants replay the current value on subscribe
//     (BehaviorSubject semantics)
//   - onMessage / onHistory do not (plain Subject semantics)
//
// NOTE: Intentionally separate from `websocketService`, which the Discussion
// tab uses with raw WebSockets. Do not merge the two.

import { io } from 'socket.io-client';

class ChatSocketService {
  constructor() {
    this.url = 'http://localhost:9092';
    this.socket = undefined;
    this.senderId = '';
    this.senderName = '';
    this.status = 'closed';
    this.participants = 0;

    this.messageListeners = new Set();
    this.historyListeners = new Set();
    this.statusListeners = new Set();
    this.participantsListeners = new Set();
  }

  connect(senderId, senderName) {
    if (this.socket && this.socket.connected) {
      return;
    }
    this.senderId = senderId;
    this.senderName = senderName;
    this.setStatus('connecting');

    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      query: { senderId, senderName },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.setStatus('open');
    });

    this.socket.on('disconnect', () => {
      this.setStatus('closed');
    });

    this.socket.on('connect_error', (err) => {
      console.error('[chatSocketService] connect_error', err);
      this.setStatus('error');
    });

    this.socket.on('chat:history', (list) => {
      const history = (list ?? []).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        text: m.text,
        timestamp: new Date(m.timestamp),
      }));
      this.emitHistory(history);
    });

    this.socket.on('chat:message', (m) => {
      this.emitMessage({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        text: m.text,
        timestamp: new Date(m.timestamp),
      });
    });

    this.socket.on('chat:participants', (count) => {
      this.setParticipants(typeof count === 'number' ? count : 0);
    });
  }

  send(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return false;
    }
    if (!this.socket || !this.socket.connected) {
      return false;
    }
    this.socket.emit('chat:send', {
      senderId: this.senderId,
      senderName: this.senderName,
      text: trimmed,
    });
    return true;
  }

  getSenderId() {
    return this.senderId;
  }

  getSenderName() {
    return this.senderName;
  }

  onMessage(cb) {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  onHistory(cb) {
    this.historyListeners.add(cb);
    return () => this.historyListeners.delete(cb);
  }

  onStatus(cb) {
    cb(this.status);
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  onParticipants(cb) {
    cb(this.participants);
    this.participantsListeners.add(cb);
    return () => this.participantsListeners.delete(cb);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
    this.setStatus('closed');
  }

  emitMessage(msg) {
    this.messageListeners.forEach((cb) => cb(msg));
  }

  emitHistory(history) {
    this.historyListeners.forEach((cb) => cb(history));
  }

  setStatus(status) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  setParticipants(count) {
    this.participants = count;
    this.participantsListeners.forEach((cb) => cb(count));
  }
}

export const chatSocketService = new ChatSocketService();
