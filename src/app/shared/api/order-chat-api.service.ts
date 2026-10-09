import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from 'app/shared/consts/urls.const';
import { ChatMessage, ChatMessagesPage, ChatRoom } from 'app/shared/models/chat.model';

@Injectable({ providedIn: 'root' })
export class OrderChatApiService {
  private readonly http = inject(HttpClient);

  public getRooms(orderId: string): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(API_ENDPOINTS.chats.orderRooms(orderId));
  }

  public getMessages(roomId: string, limit = 50): Observable<ChatMessagesPage> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<ChatMessagesPage>(API_ENDPOINTS.chats.messages(roomId), { params });
  }

  public sendMessage(roomId: string, text: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(API_ENDPOINTS.chats.messages(roomId), { text });
  }
}
