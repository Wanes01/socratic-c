const ollamaService = require('../services/ollamaService');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

exports.chat = async (req, res) => {
    const { model = OLLAMA_MODEL, messages } = req.body;

    // these headers are mandatory for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // sends the headers immediately

    try {
        await ollamaService.streamChat(model, messages, res);
    } catch (err) {
        // if something goes wrong notifies the client
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    } finally {
        res.end();
    }
}