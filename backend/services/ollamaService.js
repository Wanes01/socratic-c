const OLLAMA_URL = process.env.OLLAMA_URL;

/**
 * Executes a request to the Ollama API and writes the tokens received
 * directly to the client's HTTP response in SSE format.
 *  
 * @param {string} model : name of the model to use
 * @param {Array<{role: string, content: string}>} messages :
 *  Conversation history. Each object has the following:
 *  - role = "system" / "user" / "assistant"
 *  - content = message text
 * @param {import('express').Response} res :
 *  Express.js response object over which the SSE events will be written.
 *  The SSE headers must be already set before calling this function. 
 */
exports.streamChat = async (model, messages, res) => {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages,
            stream: true // makes sure that Ollama does not send the response once completed but streams it in pieces during generation.
        })
    });

    if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
    }

    // reads the response stream chunk by chunk
    for await (const chunk of response.body) {
        const lines = Buffer.from(chunk)
            .toString('utf-8')
            .split('\n')
            .filter(Boolean); // removes empty lines

        // sends the tokens to the client
        for (const line of lines) {
            const data = JSON.parse(line);
            res.write(`data: ${JSON.stringify({ token: data.message?.content ?? '' })}\n\n`);

            if (data.done) {
                // notifies client that the data stream has ended
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                return;
            }
        }
    }
}