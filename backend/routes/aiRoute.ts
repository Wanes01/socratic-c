import express from 'express';
import * as aiController from '../controllers/aiController';

const router = express.Router();

router.post('/chat', aiController.chat);

export default router;