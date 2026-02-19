/**
 * Servicio de Chat de Soporte – Tickets Transfer.
 * Arquitectura extensible: actualmente usa bot local; en el futuro se puede
 * conectar a:
 * - API REST (fetch a /api/chat con mensaje)
 * - WebSocket para tiempo real
 * - IA de terceros (OpenAI, Claude, etc.) reemplazando matchIntent + getBotResponse
 */

import { matchIntent, getBotResponse } from './chatBotResponses';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  quickReplies?: string[];
}

export type ChatProvider = 'local_bot' | 'api' | 'websocket' | 'ai';

/** Configuración para cambiar el proveedor en el futuro */
export const CHAT_PROVIDER: ChatProvider = 'local_bot';

/**
 * Simula latencia de red/IA para sensación de tiempo real.
 * En producción con API real, esto no sería necesario.
 */
const BOT_DELAY_MS = 600;

/**
 * Envía un mensaje y obtiene la respuesta del bot.
 * En el futuro: reemplazar por llamada a API, WebSocket o IA.
 */
export async function sendMessage(
  message: string,
  _conversationId?: string
): Promise<{ reply: string; quickReplies?: string[] }> {
  await new Promise<void>((r) => setTimeout(() => r(), BOT_DELAY_MS));

  const intent = matchIntent(message);
  const response = getBotResponse(intent);

  return {
    reply: response.text.replace(/\*\*(.+?)\*\*/g, '$1'),
    quickReplies: response.quickReplies,
  };
}

/** Genera ID único para mensajes */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
