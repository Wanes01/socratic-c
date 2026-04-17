/**
 * Possible chat partecipants
 */
export type ChatRole = 'user' | 'assistant';

/**
 * A message in chat
 */
export interface ChatMessage {
    role: ChatRole;
    content: string;
}

/**
 * A model that can be used to chat
 */
export interface LLMOption {
    provider: string;
    model: string;
    available: boolean;
}