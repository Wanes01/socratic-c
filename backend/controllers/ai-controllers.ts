
import type { Request, Response } from 'express';
import type { ExerciseAIConfig } from '../types/ai-types';
import path from 'path';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import * as aiService from '../services/ai-services';
import { getFileTree, readFilesFromTree, EXERCISES_DIR, EXERCISE_AI_CONFIG_FILE_NAME } from '../services/files-services';
import { FileContent } from '../types/files-types';

/**
 * Handles a streaming AI chat request for a specific exercise.
 * This controller:
 * - Validates the exercise existence and its specific AI configuration.
 * - Aggregates all relevant files (student source, tests, and solutions) into a Markdown briefing.
 * - Injects a system prompt and the briefing into the conversation history.
 * - Delegates provider selection (Groq/Ollama) to the aiService.
 * - Streams the LLM response back to the client using Server-Sent Events (SSE).
 * @param req express request object (body expects: { messages: ChatMessage[], exerciseName: string })
 * @param res express response object configured for SSE streaming.
 * @returns sends an SSE stream of tokens or a JSON error if headers haven't been sent.
 * @throws 400 if parameters are missing, 404 if exercise is not found.
 */
export const chat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { messages, exerciseName, provider } = req.body;

        if (!messages || !exerciseName) {
            res.status(400).json({ error: 'messages ed exerciseName sono obbligatori' });
            return;
        }

        const exercisePath = path.join(EXERCISES_DIR, exerciseName);
        if (!exercisePath.startsWith(EXERCISES_DIR)) {
            res.status(403).json({ error: 'Accesso non autorizzato' });
            return;
        }

        const [exerciseTree, exerciseConfigRaw] = await Promise.all([
            getFileTree(exercisePath),
            fs.readFile(path.join(exercisePath, EXERCISE_AI_CONFIG_FILE_NAME), 'utf-8').catch(() => null)
        ]);

        if (!exerciseTree) {
            res.status(404).json({ error: 'Esercizio non trovato' });
            return;
        }

        // exercise specific ai configuration
        const exerciseAIConfig = (exerciseConfigRaw ? yaml.load(exerciseConfigRaw) : {}) as ExerciseAIConfig;

        // the description field is mandatory
        if (!exerciseAIConfig.description) {
            throw new Error("Every exercise must provide a description.");
        }

        // student files
        const studentFiles = await readFilesFromTree(exerciseTree?.children?.['root'] ?? null);

        // test files (optional)
        const testFiles = exerciseTree?.children?.['tests']
            ? await readFilesFromTree(exerciseTree.children['tests'])
            : [];

        // solution files (optional)
        const solutionsPath = path.join(exercisePath, 'solutions');
        let solutionFiles: FileContent[] = [];
        try {
            await fs.access(solutionsPath);
            const solutionsTree = await getFileTree(solutionsPath);
            solutionFiles = await readFilesFromTree(solutionsTree);
        } catch {
        }

        // static part (cachable: limits the token usage)
        // they have to come first in the final prompt
        let staticBriefing = `## Exercise description\n${exerciseAIConfig.description}\n\n`;

        if (exerciseAIConfig.learningGoals) {
            staticBriefing += `## Learning goals\n${exerciseAIConfig.learningGoals}\n\n`;
        }

        if (exerciseAIConfig.constraints) {
            staticBriefing += `## Constraints\n${exerciseAIConfig.constraints}\n\n`;
        }

        // solutions files cannot vary
        if (solutionFiles.length > 0) {
            staticBriefing += `## Reference solution\n`;
            for (const file of solutionFiles) {
                staticBriefing += `### ${file.name}\n\`\`\`c\n${file.content}\n\`\`\`\n\n`;
            }
        }

        // prompt part that may vary between messages
        let dynamicBriefing = `## Tests to pass\n`;
        // usally test files do not change but they may
        if (testFiles.length > 0) {
            for (const file of testFiles) {
                dynamicBriefing += `### ${file.name}\n\`\`\`c\n${file.content}\n\`\`\`\n\n`;
            }
        }

        // student code is intrinsically dynamic
        dynamicBriefing += `## Student source files\n`;
        for (const file of studentFiles) {
            dynamicBriefing += `### ${file.name}\n\`\`\`c\n${file.content}\n\`\`\`\n\n`;
        }

        const fullMessages = [
            { role: 'system', content: await aiService.getSystemPrompt() },
            {
                role: 'user',
                content: staticBriefing
            },
            {
                role: 'assistant',
                content: 'Ho preso visione dell\'esercizio. Sono pronto ad aiutarti.'
            },
            {
                role: 'user',
                content: dynamicBriefing
            },
            { role: 'assistant', content: 'Ho preso visione del codice attuale dello studente.' },
            ...messages
        ];

        // provider selection
        const chatConfig = aiService.buildChatConfig(fullMessages, provider);

        // SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        for await (const chunk of aiService.streamChat(chatConfig)) {
            res.write(`data: ${JSON.stringify({ token: chunk.token })}\n\n`);
            if (chunk.done) {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                break;
            }
        }

    } catch (err: any) {
        console.error('aiController.chat error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    } finally {
        res.end();
    }
};

/**
 * Handles the request for listing available language models.
 * @param req express request object
 * @param res express response object
 * @returns 200 if the operation is successfull, 503 if models could not be listed
 */
export const listUsableModels = async (_: Request, res: Response) => {
    try {
        const availableModels = await aiService.getAvailableModels();

        if (availableModels.length === 0) {
            res.status(503).json({
                success: false,
                message: "Nessun provider LLM raggiungibile"
            })
            return;
        }

        return res.status(200).json({
            success: true,
            models: availableModels
        });
    } catch (error: any) {
        res.status(503).json({
            success: false,
            message: "Non è stato possibile ottenere una lista dei modelli disponibili"
        })
        return;
    }
}