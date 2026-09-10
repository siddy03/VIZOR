import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Subscription } from 'rxjs';
import { ChatSocketService, ChatSocketMessage } from '../../../services/chat-socket.service';

/**
 * Community -> Chat tab.
 *
 * Owns the Socket.IO chat lifecycle. Each browser tab gets its own per-tab
 * identity (senderId + senderName) persisted in sessionStorage so two tabs on
 * the same browser are always treated as two different users.
 */
@Component({
  selector: 'app-community-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './chat.html',
  styleUrls: ['../community-shared.css', './chat.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessageList') chatMessageList?: ElementRef<HTMLDivElement>;

  senderId = '';
  senderName = '';
  draft = '';
  messages = signal<ChatSocketMessage[]>([]);
  status = signal<'connecting' | 'open' | 'closed' | 'error'>('closed');
  participants = signal<number>(0);

  private subs = new Subscription();
  private shouldScroll = false;

  constructor(private chatSocket: ChatSocketService) {
    const identity = this.resolveIdentity();
    this.senderId = identity.senderId;
    this.senderName = identity.senderName;
  }

  ngOnInit(): void {
    this.chatSocket.connect(this.senderId, this.senderName);

    this.subs.add(
      this.chatSocket.onHistory().subscribe((history) => {
        this.messages.set(history);
        this.shouldScroll = true;
      }),
    );
    this.subs.add(
      this.chatSocket.onMessage().subscribe((msg) => {
        this.messages.update((list) => [...list, msg]);
        this.shouldScroll = true;
      }),
    );
    this.subs.add(this.chatSocket.onStatus().subscribe((s) => this.status.set(s)));
    this.subs.add(this.chatSocket.onParticipants().subscribe((p) => this.participants.set(p)));
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.chatMessageList) {
      this.chatMessageList.nativeElement.scrollTop = this.chatMessageList.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.chatSocket.disconnect();
  }

  sendMessage(): void {
    if (this.chatSocket.send(this.draft)) {
      this.draft = '';
      this.shouldScroll = true;
    }
  }

  trackById(_: number, msg: ChatSocketMessage): string {
    return msg.id;
  }

  isMine(msg: ChatSocketMessage): boolean {
    return msg.senderId === this.senderId;
  }

  /**
   * Per-tab chat identity:
   *   - senderId is a UUID in sessionStorage (per-tab, persists across refreshes,
   *     unique across tabs).
   *   - senderName is a friendly random handle, also in sessionStorage.
   */
  private resolveIdentity(): { senderId: string; senderName: string } {
    const idKey = 'vizor.community.chat.senderId';
    const nameKey = 'vizor.community.chat.senderName';
    try {
      let senderId = window.sessionStorage.getItem(idKey);
      if (!senderId) {
        senderId = this.uuid();
        window.sessionStorage.setItem(idKey, senderId);
      }
      let senderName = window.sessionStorage.getItem(nameKey);
      if (!senderName) {
        senderName = this.generateUsername();
        window.sessionStorage.setItem(nameKey, senderName);
      }
      return { senderId, senderName };
    } catch {
      return { senderId: this.uuid(), senderName: this.generateUsername() };
    }
  }

  private uuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  private generateUsername(): string {
    const adjectives = ['Swift', 'Calm', 'Bright', 'Brave', 'Witty', 'Quiet', 'Lucky', 'Kind', 'Bold', 'Cool'];
    const animals = ['Otter', 'Falcon', 'Tiger', 'Panda', 'Wolf', 'Lynx', 'Heron', 'Koala', 'Fox', 'Whale'];
    const a = adjectives[Math.floor(Math.random() * adjectives.length)];
    const n = animals[Math.floor(Math.random() * animals.length)];
    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${a}${n}${suffix}`;
  }
}
