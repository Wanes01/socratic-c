import express from 'express';
import * as aiController from '../controllers/ai-controllers';

const router = express.Router();

// endpoint to chat with a LLM
router.post('/chat', aiController.chat);

// endpoint to list available language models
router.get('/models', aiController.listUsableModels);

export default router;