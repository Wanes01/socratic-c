/**
 * Represents a single message in the chat history.
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * Structure of the global AI configuration file.
 */
export interface GlobalAIConfig {
    groqApiKey?: string;
    temperature: number;
}

/**
 * Internal configuration for the streamChat function.
 */
export interface StreamChatConfig {
    provider: 'groq' | 'ollama';
    url: string;
    apiKey?: string;
    body: any; // the body can vary between providers
}

/**
 * The chunk yielded by the stream generator.
 */
export interface ChatStreamChunk {
    token: string;
    done: boolean;
}