import type { StreamChatConfig, ChatStreamChunk, ChatMessage, LLMOption } from '../types/aiTypes';
import fs from 'fs/promises';
import path from 'path';
import isReachable from 'is-reachable';

const OLLAMA_URL = process.env.OLLAMA_URL || "";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const SYSTEM_PROMPT_PATH = path.join(__dirname, '../config/system-prompt.md');
const LLM_TEMPERATURE = 0.3; // the model should be highly determistic, so a low temperature is appropriate
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_API_KEY: string | undefined = process.env.GROQ_API_KEY?.trim();

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
 * Builds the config object for streamChat based on the global AI configuration.
 * Uses Groq if a valid api key is present, otherwise falls back to Ollama.
 *
 * @param messages the full messages array to send to the LLM.
 * @returns {StreamChatConfig} the config object ready to be passed to streamChat.
 */
export const buildChatConfig = (messages: ChatMessage[]): StreamChatConfig => {

    if (GROQ_API_KEY) {
        return {
            provider: 'groq',
            url: 'https://api.groq.com/openai/v1/chat/completions',
            apiKey: GROQ_API_KEY,
            body: {
                model: GROQ_MODEL,
                messages,
                temperature: LLM_TEMPERATURE,
                stream: true
            }
        };
    }

    return {
        provider: 'ollama',
        url: `${OLLAMA_URL}/api/chat`,
        body: {
            model: process.env.OLLAMA_MODEL,
            messages,
            options: { temperature: LLM_TEMPERATURE },
            stream: true
        }
    };
};

/**
 * Reads the system prompt from the system-prompt.md file.
 * @returns the content of the system prompt file
 */
export const getSystemPrompt = async () => {
    // sets it, so it does not have to be red again
    if (!cachedSystemPrompt) {
        cachedSystemPrompt = await fs.readFile(SYSTEM_PROMPT_PATH, 'utf-8');
    }
    return cachedSystemPrompt;
};

/**
 * Makes a list of all usable models and their providers.
 * @returns a list of moderls that can be used.
 */
export const getAvailableModels = async () => {
    const models: LLMOption[] = [
        {
            provider: 'ollama',
            model: process.env.OLLAMA_MODEL || "",
            available: await isReachable(OLLAMA_URL)
        },
        {
            provider: 'groq',
            model: GROQ_MODEL,
            available: await isReachable(GROQ_API)
        }
    ];
    return models;
}