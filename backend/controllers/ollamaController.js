const ollamaService = require('../services/ollamaService');
const globalAIConfig = require('../global-ai-config.json');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

exports.chat = async (req, res) => {
    const { messages, exercise } = req.body;

    // these headers are mandatory for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // sends the headers immediately

    for await (const chunk of ollamaService.streamChat(OLLAMA_MODEL, messages)) {
        res.write(`data: ${JSON.stringify({ token: chunk.token })}\n\n`);
        if (chunk.done) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            return;
        }
    }
}