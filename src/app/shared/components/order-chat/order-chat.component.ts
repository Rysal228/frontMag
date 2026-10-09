import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ChatMessage, ChatRoom, ChatSocketEvent } from 'app/shared/models/chat.model';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';
import { OrderChatApiService } from 'app/shared/api/order-chat-api.service';
import { OrderChatSocketService } from 'app/shared/services/order-chat-socket.service';

@Component({
  selector: 'app-order-chat',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './order-chat.component.html',
  styleUrl: './order-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderChatComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(OrderChatApiService);
  private readonly socket = inject(OrderChatSocketService);
  private readonly currentUser = inject(CurrentUserStore);

  public readonly orderId = input.required<string>();

  protected readonly rooms = signal<ChatRoom[]>([]);
  protected readonly selectedRoom = signal<ChatRoom | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly isLoadingRooms = signal(true);
  protected readonly isLoadingMessages = signal(false);
  protected readonly isConnecting = signal(false);
  protected readonly isConnected = signal(false);
  protected readonly isSending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly messageControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(5000)],
  });

  protected readonly currentUserId = () => this.currentUser.user()?.id ?? null;

  public ngOnInit(): void {
    this.socket.events$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.handleSocketEvent(event));

    this.destroyRef.onDestroy(() => this.socket.disconnect());
    this.loadRooms();
  }

  protected loadRooms(): void {
    this.isLoadingRooms.set(true);
    this.api.getRooms(this.orderId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rooms) => {
          this.rooms.set(rooms);
          this.isLoadingRooms.set(false);
          if (rooms.length) {
            this.connectRoom(rooms[0]);
          }
        },
        error: () => {
          this.isLoadingRooms.set(false);
          this.errorMessage.set('Не удалось загрузить чаты заказа.');
        },
      });
  }

  protected connectRoom(room: ChatRoom): void {
    this.socket.disconnect();
    this.selectedRoom.set(room);
    this.messages.set([]);
    this.errorMessage.set(null);
    this.isConnected.set(false);
    this.isConnecting.set(true);
    this.isLoadingMessages.set(false);
    this.socket.connect(room.id);
  }

  protected sendMessage(): void {
    const text = this.messageControl.value.trim();
    const room = this.selectedRoom();

    if (!text || !room || this.isSending() || !this.isConnected()) {
      return;
    }

    this.isSending.set(true);
    const sent = this.socket.sendMessage(text);
    if (!sent) {
      this.isSending.set(false);
      this.errorMessage.set('Соединение с чатом потеряно. Подключитесь повторно.');
      this.isConnected.set(false);
      return;
    }

    this.messageControl.setValue('');
    this.isSending.set(false);
  }

  protected reconnect(): void {
    const room = this.selectedRoom();
    if (room) {
      this.connectRoom(room);
    } else {
      this.loadRooms();
    }
  }

  private handleSocketEvent(event: ChatSocketEvent): void {
    const room = this.selectedRoom();

    if (event.type === 'authenticated') {
      if (!room || event.roomId !== room.id) {
        return;
      }

      this.isConnecting.set(false);
      this.isConnected.set(true);
      this.isLoadingMessages.set(true);
      this.api.getMessages(room.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (page) => {
            this.messages.update((current) => this.mergeMessages(current, page.results));
            this.isLoadingMessages.set(false);
          },
          error: () => {
            this.isLoadingMessages.set(false);
            this.errorMessage.set('Не удалось загрузить историю сообщений.');
          },
        });
      return;
    }

    if (event.type === 'message') {
      if (room && event.message.roomId === room.id) {
        this.messages.update((current) => this.mergeMessages(current, [event.message]));
      }
      return;
    }

    if (event.type === 'error') {
      this.isConnecting.set(false);
      this.isConnected.set(false);
      this.errorMessage.set(event.message);
      return;
    }

    this.isConnecting.set(false);
    this.isConnected.set(false);
  }

  private mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const unique = new Map<string, ChatMessage>();
    [...current, ...incoming].forEach((message) => unique.set(message.id, message));
    return [...unique.values()].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }
}
