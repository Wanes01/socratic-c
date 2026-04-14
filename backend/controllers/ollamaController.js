const path = require('path');
const fs = require('fs');
const ollamaService = require('../services/ollamaService');
const filesService = require('../services/filesService');
const globalAIConfig = require('../global-ai-config.json');

const OLLAMA_MODEL = process.env.OLLAMA_MODEL;
const EXERCISES_DIR = process.env.EXERCISES_DIR || path.join(__dirname, '../../exercises');

exports.chat = async (req, res) => {
    try {
        // the context window messages and exercise
        const { messages, exerciseName } = req.body;

        if (!messages || !exerciseName) {
            return res.status(400).json({ error: 'messages ed exerciseName sono obbligatori' });
        }

        const exercisePath = path.join(EXERCISES_DIR, exerciseName);

        // checks if the exercise actually exists
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

        // test files (optionals)
        const testFiles = exerciseTree.children?.['tests']
            ? filesService.readFilesFromTree(exerciseTree.children['tests'])
            : [];

        // solution files (optionals)
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

        // builds the full messages array for Ollama
        const fullMessages = [
            // the system prompt that tell the LLM it's purpose
            {
                role: 'system',
                content: globalAIConfig.systemPrompt
            },
            // a breafing providing context on the current exercise
            {
                role: 'user',
                content: briefing
            },
            /* a confirmation message from the assistant, designed so that the
            assistant's first message is not a confirmation that they have reviewed their tasks */
            {
                role: 'assistant',
                content: 'Ho preso visione dell\'esercizio e del codice dello studente. Sono pronto ad aiutarti.'
            },
            // previews messages between the user and the assistant (if any)
            ...messages
        ];

        console.log(fullMessages);

        // SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        for await (const chunk of ollamaService.streamChat(OLLAMA_MODEL, fullMessages, globalAIConfig.temperature)) {
            res.write(`data: ${JSON.stringify({ token: chunk.token })}\n\n`);
            if (chunk.done) {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                return;
            }
        }

    } catch (err) {
        console.error('ollamaController.chat error:', err);
        // if headers are already sent we can't send a JSON error anymore
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
};