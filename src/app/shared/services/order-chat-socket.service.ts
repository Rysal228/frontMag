import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { ChatSocketEvent } from 'app/shared/models/chat.model';
import { TokenStore } from 'app/shared/storage/token-store';

@Injectable({ providedIn: 'root' })
export class OrderChatSocketService {
  private readonly document = inject(DOCUMENT);
  private readonly tokenStore = inject(TokenStore);
  private socket: WebSocket | null = null;

  private readonly eventsSubject = new Subject<ChatSocketEvent>();
  public readonly events$ = this.eventsSubject.asObservable();

  public connect(roomId: string): void {
    this.disconnect();

    const token = this.tokenStore.accessToken;
    if (!token) {
      this.eventsSubject.next({
        type: 'error',
        code: 'missing_token',
        message: 'Для подключения к чату необходимо войти в аккаунт.',
      });
      return;
    }

    const location = this.document.location;
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${location.host}/ws/chats/${roomId}/`);
    this.socket = socket;

    socket.onopen = () => {
      if (this.socket !== socket) {
        return;
      }

      socket.send(JSON.stringify({ type: 'authenticate', token }));
    };

    socket.onmessage = ({ data }) => {
      if (this.socket !== socket) {
        return;
      }

      try {
        this.eventsSubject.next(JSON.parse(data) as ChatSocketEvent);
      } catch {
        this.eventsSubject.next({
          type: 'error',
          code: 'invalid_server_event',
          message: 'Сервер отправил сообщение в неизвестном формате.',
        });
      }
    };

    socket.onerror = () => {
      if (this.socket === socket) {
        this.eventsSubject.next({
          type: 'error',
          code: 'connection_error',
          message: 'Не удалось подключиться к чату.',
        });
      }
    };

    socket.onclose = ({ code }) => {
      if (this.socket === socket) {
        this.socket = null;
        this.eventsSubject.next({ type: 'closed', code });
      }
    };
  }

  public sendMessage(text: string): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.socket.send(JSON.stringify({ type: 'send_message', text }));
    return true;
  }

  public disconnect(): void {
    const socket = this.socket;
    this.socket = null;

    if (socket) {
      socket.onclose = null;
      socket.close();
    }
  }
}
