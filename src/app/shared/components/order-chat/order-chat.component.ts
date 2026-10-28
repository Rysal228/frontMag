import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';

import { OrderChatApiService } from 'app/shared/api/order-chat-api.service';
import { ChatAttachment, ChatMessage, ChatRoom, ChatSocketEvent } from 'app/shared/models/chat.model';
import { OrderChatSocketService } from 'app/shared/services/order-chat-socket.service';
import { CurrentUserStore } from 'app/shared/storage/current-user-store';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

@Component({
  selector: 'app-order-chat',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, TuiButton],
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
  protected readonly selectedFiles = signal<File[]>([]);
  protected readonly isLoadingRooms = signal(true);
  protected readonly isLoadingMessages = signal(false);
  protected readonly isConnecting = signal(false);
  protected readonly isConnected = signal(false);
  protected readonly isSending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly attachmentError = signal<string | null>(null);
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
    this.selectedFiles.set([]);
    this.attachmentError.set(null);
    this.errorMessage.set(null);
    this.isConnected.set(false);
    this.isConnecting.set(true);
    this.isLoadingMessages.set(false);
    this.socket.connect(room.id);
  }

  protected onComposerKeydown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const incoming = Array.from(input.files ?? []);
    input.value = '';

    if (!incoming.length) {
      return;
    }

    const combined = [...this.selectedFiles(), ...incoming];
    if (combined.length > MAX_FILES) {
      this.attachmentError.set('Можно прикрепить не более 5 файлов к одному сообщению.');
      return;
    }

    const invalidFile = incoming.find((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const validExtension = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(extension ?? '');
      return file.size > MAX_FILE_SIZE || !validExtension || !ACCEPTED_FILE_TYPES.has(file.type);
    });

    if (invalidFile) {
      this.attachmentError.set(
        invalidFile.size > MAX_FILE_SIZE
          ? `Файл «${invalidFile.name}» превышает 10 МБ.`
          : `Формат файла «${invalidFile.name}» не поддерживается. Разрешены JPEG, PNG, WebP и PDF.`,
      );
      return;
    }

    this.selectedFiles.set(combined);
    this.attachmentError.set(null);
  }

  protected removeSelectedFile(index: number): void {
    this.selectedFiles.update((files) => files.filter((_, fileIndex) => fileIndex !== index));
    this.attachmentError.set(null);
  }

  protected sendMessage(): void {
    const text = this.messageControl.value.trim();
    const room = this.selectedRoom();
    const files = this.selectedFiles();

    if ((!text && !files.length) || !room || this.isSending() || !this.isConnected()) {
      return;
    }

    this.isSending.set(true);
    this.errorMessage.set(null);

    if (files.length) {
      this.api.sendMessageWithAttachments(room.id, text, files)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (message) => {
            this.messages.update((current) => this.mergeMessages(current, [message]));
            this.messageControl.setValue('');
            this.selectedFiles.set([]);
            this.attachmentError.set(null);
            this.isSending.set(false);
          },
          error: () => {
            this.errorMessage.set('Не удалось отправить сообщение с файлами. Попробуйте ещё раз.');
            this.isSending.set(false);
          },
        });
      return;
    }

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

  protected downloadAttachment(attachment: ChatAttachment): void {
    this.api.downloadAttachment(attachment.downloadUrl)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = attachment.originalName;
          anchor.click();
          URL.revokeObjectURL(url);
        },
        error: () => this.errorMessage.set(`Не удалось скачать файл «${attachment.originalName}».`),
      });
  }

  protected formatFileSize(size: number): string {
    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} КБ`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
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
    if (event.code !== 1000) {
      this.errorMessage.set('Соединение с чатом закрыто. Попробуйте подключиться повторно.');
    }
  }

  private mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const unique = new Map<string, ChatMessage>();
    [...current, ...incoming].forEach((message) => unique.set(message.id, message));
    return [...unique.values()].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }
}
