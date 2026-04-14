const OLLAMA_URL = process.env.OLLAMA_URL;

exports.streamChat = async function* (config) {
    const { provider, url, apiKey, body } = config;

    const headers = { 'Content-Type': 'application/json' };
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

    for await (const chunk of response.body) {
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
 * Builds the config object for streamChat based on the global AI config.
 * Uses Groq if a valid groqApiKey is present, otherwise falls back to Ollama.
 *
 * @param {object[]} messages - The full messages array to send to the LLM.
 * @param {object} globalAIConfig - The parsed global-ai-config.json object.
 * @returns {object} The config object ready to be passed to streamChat.
 */
exports.buildChatConfig = (messages, globalAIConfig) => {
    const groqApiKey = globalAIConfig.groqApiKey?.trim();

    if (groqApiKey) {
        return {
            provider: 'groq',
            url: 'https://api.groq.com/openai/v1/chat/completions',
            apiKey: groqApiKey,
            body: {
                model: 'openai/gpt-oss-120b', //'llama-3.3-70b-versatile',
                messages,
                temperature: globalAIConfig.temperature,
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
            options: { temperature: globalAIConfig.temperature },
            stream: true
        }
    };
};