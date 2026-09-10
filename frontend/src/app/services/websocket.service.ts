import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'server';
  timestamp: Date;
}

type Status = 'connecting' | 'open' | 'closed' | 'error';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private readonly url = 'wss://ws.postman-echo.com/raw';
  private socket?: WebSocket;
  private messages$ = new Subject<ChatMessage>();
  private status$ = new BehaviorSubject<Status>('closed');
  private outbox: string[] = [];

  connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    this.status$.next('connecting');
    try {
      this.socket = new WebSocket(this.url);
    } catch (err) {
      console.error('[WebsocketService] failed to construct WebSocket', err);
      this.status$.next('error');
      return;
    }

    this.socket.onopen = () => {
      this.status$.next('open');
      while (this.outbox.length && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(this.outbox.shift()!);
      }
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const text = typeof event.data === 'string' ? event.data : '';
      if (!text) {
        return;
      }
      this.messages$.next({
        id: this.uuid(),
        text,
        sender: 'server',
        timestamp: new Date(),
      });
    };

    this.socket.onerror = (e) => {
      console.error('[WebsocketService] error', e);
      this.status$.next('error');
    };

    this.socket.onclose = () => this.status$.next('closed');
  }

  send(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed) {
      return false;
    } 

    this.messages$.next({
      id: this.uuid(),
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

  onMessage(): Observable<ChatMessage> {
    return this.messages$.asObservable();
  }

  onStatus(): Observable<Status> {
    return this.status$.asObservable();
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = undefined;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private uuid(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
