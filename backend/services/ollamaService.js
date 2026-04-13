const OLLAMA_URL = process.env.OLLAMA_URL;

exports.streamChat = async function* (model, messages) {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages,
            stream: true // makes sure that Ollama does not send the response once completed but streams it in pieces during generation.
        })
    });
    // reads the response stream chunk by chunk
    for await (const chunk of response.body) {
        const lines = Buffer.from(chunk).toString('utf-8').split('\n').filter(Boolean);
        for (const line of lines) {
            try {
                const data = JSON.parse(line);
                yield { token: data.message?.content ?? '', done: data.done ?? false };
                if (data.done) {
                    return;
                }
            } catch {
                // malformed chunk, ignores it
                continue;
            }
        }
    }
};