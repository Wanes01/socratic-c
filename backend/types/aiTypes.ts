/**
 * Represents a single message in the chat history.
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ExerciseAIConfig {
    description: string;
    learningGoals?: string;
    constraints?: string;
}

/**
 * Structure of the global AI configuration file.
 */
export interface GlobalAIConfig {
    groqApiKey?: string;
    temperature: number;
}

/**
 * Supported LLM providers.
 */
type Provider = 'groq' | 'ollama';

/**
 * Internal configuration for the streamChat function.
 */
export interface StreamChatConfig {
    provider: Provider;
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

/**
 * A model that can be used to chat.
 */
export interface LLMOption {
    provider: Provider,
    model: string,
    available: boolean
}