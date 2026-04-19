import { Provider, ProviderConfig } from "../types/ai-types";

const OLLAMA_URL = process.env.OLLAMA_URL || "";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const LLM_TEMPERATURE = 0.3; // the model should be highly determistic, so a low temperature is appropriate
const GROQ_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3-32b';
const GROQ_API_KEY: string | undefined = process.env.GROQ_API_KEY?.trim();

/**
 * Provider configuration for local ollama models.
 */
const OLLAMA_PROVIDER_CONFIG: ProviderConfig = {
    url: `${OLLAMA_URL}/api/chat`,
    model: OLLAMA_MODEL,
    keyNeeded: false,
    buildBody: (messages) => ({
        model: process.env.OLLAMA_MODEL,
        messages,
        options: { temperature: LLM_TEMPERATURE },
        stream: true
    }),
    validateModel: async () => {
        const modelName = process.env.OLLAMA_MODEL;
        if (!modelName) {
            return false;
        }
        try {
            // the use may not have downloaded the ollama model
            const res = await fetch(`${OLLAMA_URL}/api/show`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: modelName }),
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    }
};

/**
 * Groq language model provider configuration.
 */
const GROQ_PROVIDER_CONFIG: ProviderConfig = {
    url: GROQ_API,
    apiKey: GROQ_API_KEY,
    model: GROQ_MODEL,
    keyNeeded: true,
    buildBody: (messages) => ({
        model: GROQ_MODEL,
        messages,
        temperature: LLM_TEMPERATURE,
        stream: true,
        include_reasoning: false
    }),
    validateModel: async () => {
        if (!GROQ_MODEL || !GROQ_API_KEY) return false;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/models", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                return false;
            }

            const json = await response.json();
            const modelExists = json.data.some((m: { id: string }) => m.id === GROQ_MODEL);

            return modelExists;
        } catch (error) {
            return false;
        }
    }
};

/**
 * Maps each provider to its configuration.
 * In particular specifies how the request body is built.
 */
export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
    groq: GROQ_PROVIDER_CONFIG,
    ollama: OLLAMA_PROVIDER_CONFIG
};