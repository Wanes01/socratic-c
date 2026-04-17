import type { StreamChatConfig, ChatStreamChunk, ChatMessage, LLMOption, Provider } from '../types/ai-types';
import fs from 'fs/promises';
import path from 'path';
import isReachable from 'is-reachable';
import { PROVIDER_CONFIGS } from '../config/llm-config';

const SYSTEM_PROMPT_PATH = path.join(__dirname, '../config/system-prompt.md');
let cachedSystemPrompt: string = "";

/**
 * Generates a stream of chat tokens from the specified AI provider
 * * @param config the provider configuration and request body.
 * @yields {ChatStreamChunk} an object containing the current token and the completion status
 * @throws {Error} ff the HTTP response is not ok
 */
export const streamChat = async function* (config: StreamChatConfig): AsyncGenerator<ChatStreamChunk> {
    const { provider, url, apiKey, body } = config;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Errore dal provider ${provider}: ${response.statusText}`);
    }

    for await (const chunk of response.body as any) {
        const lines = Buffer.from(chunk).toString('utf-8').split('\n').filter(Boolean);

        for (const line of lines) {
            if (provider === 'groq') {
                // Formato OpenAI (Server-Sent Events)
                if (!line.startsWith('data: ')) continue;

                const payload = line.slice('data: '.length).trim();

                if (payload === '[DONE]') {
                    yield { token: '', done: true };
                    return;
                }

                try {
                    const data = JSON.parse(payload);
                    const token = data.choices[0]?.delta?.content || '';
                    yield { token, done: false };
                } catch { continue; }

            } else if (provider === 'ollama') {
                // Formato Ollama (NDJSON)
                try {
                    const data = JSON.parse(line);
                    yield { token: data.message?.content || '', done: data.done || false };
                    if (data.done) return;
                } catch { continue; }
            }
        }
    }
};

/**
 * Builds the config object for streamChat based on the selected provider.
 *
 * @param messages the full messages array to send to the LLM
 * @param provider the language model service provider
 * @returns the configuration to use in the request to the provider
 */
export const buildChatConfig = (messages: ChatMessage[], provider: Provider): StreamChatConfig => {
    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
        throw new Error(`Provider non disponibile: ${provider}`);
    }

    return {
        provider,
        url: config.url,
        apiKey: config.apiKey,
        body: config.buildBody(messages)
    };
};

/**
 * Reads the system prompt from the system-prompt.md file.
 * @returns the content of the system prompt file
 */
export const getSystemPrompt = async () => {
    // sets the system prompt for the first time, so it does not have to be red again
    if (!cachedSystemPrompt) {
        cachedSystemPrompt = await fs.readFile(SYSTEM_PROMPT_PATH, 'utf-8');
    }
    return cachedSystemPrompt;
};

/**
 * Makes a list of all usable models and their providers.
 * @returns a list of moderls that can be used.
 */
export const getAvailableModels = async (): Promise<LLMOption[]> => {
    return Promise.all(
        Object.entries(PROVIDER_CONFIGS).map(async ([provider, config]) => ({
            provider: provider as Provider,
            model: config.model,
            available: await isReachable(config.url) && (!config.keyNeeded || !!config.apiKey)
        }))
    );
};