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
import { WebsocketService, ChatMessage } from '../../../services/websocket.service';

/**
 * Community -> Discussion tab.
 *
 * Owns the raw-WebSocket lifecycle (postman-echo) used by the discussion
 * board. This component is intentionally independent from the Chat tab
 * (which uses Socket.IO via a different service).
 */
@Component({
  selector: 'app-community-discussion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: './discussion.html',
  styleUrls: ['../community-shared.css', './discussion.css'],
})
export class DiscussionComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageList') messageList?: ElementRef<HTMLDivElement>;

  draft = '';
  messages = signal<ChatMessage[]>([]);
  status = signal<'connecting' | 'open' | 'closed' | 'error'>('closed');
  participants = 2;

  private subs = new Subscription();
  private shouldScroll = false;

  constructor(private ws: WebsocketService) {}

  ngOnInit(): void {
    this.ws.connect();
    this.subs.add(
      this.ws.onMessage().subscribe((msg) => {
        this.messages.update((list) => [...list, msg]);
        this.shouldScroll = true;
      }),
    );
    this.subs.add(this.ws.onStatus().subscribe((s) => this.status.set(s)));
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.messageList) {
      this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.ws.disconnect();
  }

  sendMessage(): void {
    if (this.ws.send(this.draft)) {
      this.draft = '';
      this.shouldScroll = true;
    }
  }

  trackById(_: number, msg: ChatMessage): string {
    return msg.id;
  }
}
