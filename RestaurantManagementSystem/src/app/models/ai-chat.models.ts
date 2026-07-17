export interface AiChatRequest {
  conversationId: string;
  message: string;
}

export interface AiChatResponse {
  conversationId: string;
  response: string;
}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}
