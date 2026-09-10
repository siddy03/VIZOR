import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface ChatSocketMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export type ChatStatus = 'connecting' | 'open' | 'closed' | 'error';

interface ChatWirePayload {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}


@Injectable({ providedIn: 'root' })
export class ChatSocketService implements OnDestroy {
  private readonly url = 'http://localhost:9092';

  private socket?: Socket;
  private senderId = '';
  private senderName = '';

  private messages$ = new Subject<ChatSocketMessage>();
  private history$ = new Subject<ChatSocketMessage[]>();
  private status$ = new BehaviorSubject<ChatStatus>('closed');
  private participants$ = new BehaviorSubject<number>(0);

  connect(senderId: string, senderName: string): void {
    if (this.socket && this.socket.connected) {
      return;
    }
    this.senderId = senderId;
    this.senderName = senderName;
    this.status$.next('connecting');

    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      query: { senderId, senderName },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.status$.next('open');
    });

    this.socket.on('disconnect', () => {
      this.status$.next('closed');
    });

    this.socket.on('connect_error', (err) => {
      console.error('[ChatSocketService] connect_error', err);
      this.status$.next('error');
    });

    this.socket.on('chat:history', (list: ChatWirePayload[]) => {
      const history: ChatSocketMessage[] = (list ?? []).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        text: m.text,
        timestamp: new Date(m.timestamp),
      }));
      this.history$.next(history);
    });

    this.socket.on('chat:message', (m: ChatWirePayload) => {
      this.messages$.next({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        text: m.text,
        timestamp: new Date(m.timestamp),
      });
    });

    this.socket.on('chat:participants', (count: number) => {
      this.participants$.next(typeof count === 'number' ? count : 0);
    });
  }

  send(text: string): boolean {
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

  getSenderId(): string {
    return this.senderId;
  }

  getSenderName(): string {
    return this.senderName;
  }

  onMessage(): Observable<ChatSocketMessage> {
    return this.messages$.asObservable();
  }

  onHistory(): Observable<ChatSocketMessage[]> {
    return this.history$.asObservable();
  }

  onStatus(): Observable<ChatStatus> {
    return this.status$.asObservable();
  }

  onParticipants(): Observable<number> {
    return this.participants$.asObservable();
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
    this.status$.next('closed');
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}



/**
 * Socket.IO client for the Community -> Chat tab.
 *
 * Each tab passes its own `senderId` + `senderName` on connect and again with
 * every outgoing message. The server echoes both back so every client can
 * decide locally whether a message is "mine" by comparing senderId.
 *
 * NOTE: This is intentionally separate from `WebsocketService`, which the
 * Discussion tab uses with raw WebSockets. Do not merge the two.
 */