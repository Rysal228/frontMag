export type ChatRoomType = 'customer_manager' | 'manager_mechanic';

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
};

export type ChatRoom = {
  id: string;
  orderId: string;
  orderNumber: string;
  type: ChatRoomType;
  typeLabel: string;
  mechanicId: string | null;
  mechanicName: string | null;
  createdAt: string;
  lastMessage: ChatMessage | null;
};

export type ChatMessagesPage = {
  results: ChatMessage[];
  hasMore: boolean;
};

export type ChatSocketEvent =
  | { type: 'authenticated'; roomId: string }
  | { type: 'message'; message: ChatMessage & { roomId: string } }
  | { type: 'error'; code: string; message: string }
  | { type: 'closed'; code: number };
