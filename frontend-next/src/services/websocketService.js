// Raw-WebSocket transport for the Community -> Discussion tab (postman-echo).
//
// Ported from Angular `WebsocketService` (providedIn: 'root'), so this module
// exports a single shared instance. RxJS Subjects/BehaviorSubjects are replaced
// with simple listener Sets: `onStatus` replays the current status on subscribe
// (BehaviorSubject semantics) while `onMessage` does not (plain Subject).
//
// NOTE: Intentionally separate from `chatSocketService`, which the Chat tab
// uses with Socket.IO. Do not merge the two.

function uuid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

class WebsocketService {
  constructor() {
    this.url = 'wss://ws.postman-echo.com/raw';
    this.socket = undefined;
    this.outbox = [];
    this.status = 'closed';
    this.messageListeners = new Set();
    this.statusListeners = new Set();
  }

  connect() {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    this.setStatus('connecting');
    try {
      this.socket = new WebSocket(this.url);
    } catch (err) {
      console.error('[websocketService] failed to construct WebSocket', err);
      this.setStatus('error');
      return;
    }

    this.socket.onopen = () => {
      this.setStatus('open');
      while (this.outbox.length && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(this.outbox.shift());
      }
    };

    this.socket.onmessage = (event) => {
      const text = typeof event.data === 'string' ? event.data : '';
      if (!text) {
        return;
      }
      this.emitMessage({
        id: uuid(),
        text,
        sender: 'server',
        timestamp: new Date(),
      });
    };

    this.socket.onerror = (e) => {
      console.warn('[websocketService] error', e);
      this.setStatus('error');
    };

    this.socket.onclose = () => this.setStatus('closed');
  }

  send(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return false;
    }

    this.emitMessage({
      id: uuid(),
      text: trimmed,
      sender: 'me',
      timestamp: new Date(),
    });

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(trimmed);
    } else {
      this.outbox.push(trimmed);
      this.connect();
    }
    return true;
  }

  onMessage(cb) {
    this.messageListeners.add(cb);
    return () => this.messageListeners.delete(cb);
  }

  onStatus(cb) {
    cb(this.status);
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  disconnect() {
    this.socket?.close();
    this.socket = undefined;
  }

  emitMessage(msg) {
    this.messageListeners.forEach((cb) => cb(msg));
  }

  setStatus(status) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }
}

export const websocketService = new WebsocketService();
