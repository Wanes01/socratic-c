const path = require('path');
const fs = require('fs');
const aiService = require('../services/aiService');
const filesService = require('../services/filesService');
const globalAIConfig = require('../global-ai-config.json');

const EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');

exports.chat = async (req, res) => {
    try {
        const { messages, exerciseName } = req.body;

        if (!messages || !exerciseName) {
            return res.status(400).json({ error: 'messages ed exerciseName sono obbligatori' });
        }

        const exercisePath = path.join(EXERCISES_DIR, exerciseName);

        if (!fs.existsSync(exercisePath) || !fs.statSync(exercisePath).isDirectory()) {
            return res.status(404).json({ error: 'Esercizio non trovato' });
        }

        // exercise specific ai configuration
        const exerciseAIConfig = JSON.parse(
            fs.readFileSync(path.join(exercisePath, 'ai-config.json'), 'utf-8')
        );

        const exerciseTree = filesService.getFileTree(exercisePath);

        // student files
        const studentFiles = filesService.readFilesFromTree(exerciseTree.children?.['root']);

        // test files (optional)
        const testFiles = exerciseTree.children?.['tests']
            ? filesService.readFilesFromTree(exerciseTree.children['tests'])
            : [];

        // solution files (optional)
        const solutionsFullPath = path.join(exercisePath, 'solutions');
        const solutionFiles = fs.existsSync(solutionsFullPath)
            ? filesService.readFilesFromTree(filesService.getFileTree(solutionsFullPath))
            : [];

        // builds the briefing message
        let briefing = `## Exercise description\n${exerciseAIConfig.description}\n\n`;

        if (exerciseAIConfig.learningGoals) {
            briefing += `## Learning goals\n${exerciseAIConfig.learningGoals}\n\n`;
        }

        if (exerciseAIConfig.constraints) {
            briefing += `## Constraints\n${exerciseAIConfig.constraints}\n\n`;
        }

        briefing += `## Student source files\n`;
        for (const file of studentFiles) {
            briefing += `### ${file.name}\n\`\`\`c\n${file.content}\n\`\`\`\n\n`;
        }

        if (testFiles.length > 0) {
            briefing += `## Tests to pass\n`;
            for (const file of testFiles) {
                briefing += `### ${file.name}\n\`\`\`c\n${file.content}\n\`\`\`\n\n`;
            }
        }

        if (solutionFiles.length > 0) {
            briefing += `## Reference solution\n`;
            for (const file of solutionFiles) {
                briefing += `### ${file.name}\n\`\`\`c\n${file.content}\n\`\`\`\n\n`;
            }
        }

        const fullMessages = [
            {
                role: 'system',
                content: globalAIConfig.systemPrompt
            },
            {
                role: 'user',
                content: briefing
            },
            // Fake assistant confirmation so that the first visible message
            // is not the LLM acknowledging its own instructions
            {
                role: 'assistant',
                content: 'Ho preso visione dell\'esercizio e del codice dello studente. Sono pronto ad aiutarti.'
            },
            ...messages
        ];

        // Provider selection (Groq if groqApiKey is set, Ollama otherwise)
        // is fully delegated to aiService.buildChatConfig
        const chatConfig = aiService.buildChatConfig(fullMessages, globalAIConfig);

        // SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        for await (const chunk of aiService.streamChat(chatConfig)) {
            res.write(`data: ${JSON.stringify({ token: chunk.token })}\n\n`);
            if (chunk.done) {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                return;
            }
        }

    } catch (err) {
        console.error('aiController.chat error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
};