import { Provider, ProviderConfig } from "../types/ai-types";

const OLLAMA_URL = process.env.OLLAMA_URL || "";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const LLM_TEMPERATURE = 0.3; // the model should be highly determistic, so a low temperature is appropriate
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_API_KEY: string | undefined = process.env.GROQ_API_KEY?.trim();

/**
 * Maps each provider to its configuration.
 * In particular specifies how the request body is built.
 */
export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
    groq: {
        url: GROQ_API,
        apiKey: GROQ_API_KEY,
        model: process.env.OLLAMA_MODEL || "",
        buildBody: (messages) => ({
            model: GROQ_MODEL,
            messages,
            temperature: LLM_TEMPERATURE,
            stream: true
        })
    },
    ollama: {
        url: `${OLLAMA_URL}/api/chat`,
        model: GROQ_MODEL,
        buildBody: (messages) => ({
            model: process.env.OLLAMA_MODEL,
            messages,
            options: { temperature: LLM_TEMPERATURE },
            stream: true
        })
    }
};